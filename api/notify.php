<?php
declare(strict_types=1);

/**
 * Módulo Central de Alerta Doble al Asesor (Paso 9)
 * Canal 1: Webhook HTTPS (CRM / Automatización)
 * Canal 2: Alerta directa por WhatsApp Cloud API al asesor comercial
 */

function http_post_json(string $url, array $payload, array $extraHeaders = [], int $timeout = 4): array
{
    $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false || $url === '' || !str_starts_with($url, 'https://')) {
        return ['sent' => false, 'code' => 0];
    }

    $headers = array_merge(['Content-Type: application/json', 'Accept: application/json'], $extraHeaders);

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        if ($ch !== false) {
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $json,
                CURLOPT_HTTPHEADER => $headers,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => $timeout,
                CURLOPT_CONNECTTIMEOUT => 2,
                CURLOPT_SSL_VERIFYPEER => true,
            ]);
            @curl_exec($ch);
            $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            return ['sent' => ($code >= 200 && $code < 300), 'code' => $code];
        }
    }

    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => implode("\r\n", $headers) . "\r\n",
            'content' => $json,
            'timeout' => $timeout,
            'ignore_errors' => true,
        ],
    ]);
    $res = @file_get_contents($url, false, $ctx);
    return ['sent' => ($res !== false), 'code' => $res !== false ? 200 : 0];
}

function send_advisor_whatsapp_alert(array $secrets, array $config, array $lead): bool
{
    $phoneId = trim((string) ($secrets['meta_phone_id'] ?? ''));
    $token = trim((string) ($secrets['meta_access_token'] ?? ''));
    $advisorRaw = (string) ($config['whatsappNumber'] ?? $config['whatsapp'] ?? '');
    $advisorPhone = preg_replace('/\D+/', '', $advisorRaw) ?? '';

    if ($phoneId === '' || $token === '' || $advisorPhone === '') {
        return false;
    }

    $text = "NUEVO PROSPECTO REGISTRADO\n"
        . "Nombre: " . ($lead['nombre'] ?? 'Sin nombre') . "\n"
        . "WhatsApp: +" . ($lead['whatsapp'] ?? '') . "\n"
        . "Proyecto: " . ($lead['proyecto'] ?? 'Portafolio General') . "\n"
        . (!empty($lead['unidad']) ? "Unidad: {$lead['unidad']}\n" : '')
        . "Origen: " . ($lead['origen'] ?? 'web') . "\n"
        . (!empty($lead['mensaje']) ? "Nota: {$lead['mensaje']}" : '');

    $url = "https://graph.facebook.com/v21.0/{$phoneId}/messages";
    $result = http_post_json(
        $url,
        [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $advisorPhone,
            'type' => 'text',
            'text' => ['preview_url' => false, 'body' => $text],
        ],
        ["Authorization: Bearer {$token}"],
        4
    );

    return (bool) $result['sent'];
}

function dispatch_double_alert(array $secrets, array $config, array $lead): array
{
    $webhookUrl = trim((string) ($secrets['webhook_url'] ?? ''));
    $webhookResult = ['sent' => false, 'code' => 0];

    if ($webhookUrl !== '') {
        $webhookResult = http_post_json($webhookUrl, [
            'event' => 'new_lead',
            'brand' => (string) ($config['brandName'] ?? 'Inmobiliaria'),
            'lead' => $lead,
        ], [], 3);
    }

    $whatsappSent = send_advisor_whatsapp_alert($secrets, $config, $lead);

    $log = read_private_json('alerts_log.json', []);
    if (!is_array($log)) {
        $log = [];
    }
    array_unshift($log, [
        'lead_id' => $lead['id'] ?? '',
        'origen' => $lead['origen'] ?? 'web',
        'webhook_ok' => (bool) $webhookResult['sent'],
        'webhook_code' => (int) $webhookResult['code'],
        'advisor_wa_ok' => $whatsappSent,
        'at' => gmdate('c'),
    ]);
    write_private_json('alerts_log.json', array_slice($log, 0, 100));

    return [
        'webhook_sent' => (bool) $webhookResult['sent'],
        'advisor_wa_sent' => $whatsappSent,
    ];
}