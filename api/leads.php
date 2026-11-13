<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

init_secure_session();
$method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));

function clean_text(mixed $value, int $maxLen = 200): string
{
    $text = trim(strip_tags((string) ($value ?? '')));
    if (function_exists('mb_substr')) {
        return mb_substr($text, 0, $maxLen, 'UTF-8');
    }
    return substr($text, 0, $maxLen);
}

function normalize_colombian_phone(string $raw): ?string
{
    $digits = preg_replace('/\D+/', '', $raw) ?? '';
    if (str_starts_with($digits, '57') && strlen($digits) === 12) {
        $digits = substr($digits, 2);
    }
    if (!preg_match('/^3\d{9}$/', $digits)) {
        return null;
    }
    return '57' . $digits;
}

function dispatch_webhook_async(string $url, array $payload): bool
{
    if ($url === '' || !str_starts_with($url, 'https://')) {
        return false;
    }

    $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        return false;
    }

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        if ($ch !== false) {
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $json,
                CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Accept: application/json'],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 3,
                CURLOPT_CONNECTTIMEOUT => 2,
                CURLOPT_SSL_VERIFYPEER => true,
            ]);
            @curl_exec($ch);
            $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            return $code >= 200 && $code < 300;
        }
    }

    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\nAccept: application/json\r\n",
            'content' => $json,
            'timeout' => 3,
            'ignore_errors' => true,
        ],
    ]);
    $res = @file_get_contents($url, false, $ctx);
    return $res !== false;
}

if ($method === 'GET') {
    require_auth('admin');
    $leads = read_private_json('leads.json', []);
    if (!is_array($leads)) {
        $leads = [];
    }
    json_response([
        'ok' => true,
        'leads' => array_values($leads),
        'total' => count($leads),
    ]);
}

if ($method !== 'POST') {
    json_response(['ok' => false, 'error' => 'Método no permitido.'], 405);
}

$body = read_json_body(65536);
$action = (string) ($body['action'] ?? 'create');

if ($action === 'update_status') {
    require_csrf();
    require_auth('admin');

    $leadId = clean_text($body['id'] ?? '', 64);
    $status = clean_text($body['status'] ?? '', 32);
    $allowed = ['Nuevo', 'Contactado', 'Visita Agendada', 'Descartado'];

    if ($leadId === '' || !in_array($status, $allowed, true)) {
        json_response(['ok' => false, 'error' => 'Datos de actualización inválidos.'], 400);
    }

    $leads = read_private_json('leads.json', []);
    if (!is_array($leads)) {
        $leads = [];
    }

    $found = false;
    foreach ($leads as &$item) {
        if (($item['id'] ?? '') === $leadId) {
            $item['status'] = $status;
            $item['updated_at'] = gmdate('c');
            $found = true;
            break;
        }
    }
    unset($item);

    if (!$found) {
        json_response(['ok' => false, 'error' => 'Prospecto no encontrado.'], 404);
    }

    if (!write_private_json('leads.json', $leads)) {
        json_response(['ok' => false, 'error' => 'No se pudo actualizar el estado.'], 500);
    }

    json_response(['ok' => true, 'message' => 'Estado actualizado.']);
}

if ($action === 'delete') {
    require_csrf();
    require_auth('admin');

    $leadId = clean_text($body['id'] ?? '', 64);
    if ($leadId === '') {
        json_response(['ok' => false, 'error' => 'ID de prospecto requerido.'], 400);
    }

    $leads = read_private_json('leads.json', []);
    if (!is_array($leads)) {
        $leads = [];
    }

    $filtered = array_values(array_filter($leads, static fn ($item): bool => ($item['id'] ?? '') !== $leadId));
    if (count($filtered) === count($leads)) {
        json_response(['ok' => false, 'error' => 'Prospecto no encontrado.'], 404);
    }

    write_private_json('leads.json', $filtered);
    json_response(['ok' => true, 'message' => 'Prospecto eliminado.']);
}

// Registro público de un nuevo prospecto
check_rate_limit('lead_submit', 5, 300);

// Campo trampa antispam (honeypot): debe llegar vacío
if (!empty($body['website'])) {
    json_response(['ok' => true, 'message' => 'Solicitud recibida.']);
}

$nombre = clean_text($body['nombre'] ?? '', 120);
$whatsappRaw = clean_text($body['whatsapp'] ?? '', 30);
$correo = clean_text($body['correo'] ?? '', 150);
$proyecto = clean_text($body['proyecto'] ?? 'Portafolio General', 120);
$unidad = clean_text($body['unidad'] ?? '', 60);
$mensaje = clean_text($body['mensaje'] ?? '', 600);
$origen = clean_text($body['origen'] ?? 'web', 60);

if (strlen($nombre) < 2) {
    json_response(['ok' => false, 'error' => 'Ingresa tu nombre completo.'], 400);
}

$whatsapp = normalize_colombian_phone($whatsappRaw);
if ($whatsapp === null) {
    json_response(['ok' => false, 'error' => 'Ingresa un WhatsApp colombiano válido (10 dígitos iniciando en 3).'], 400);
}

if ($correo !== '' && !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    json_response(['ok' => false, 'error' => 'El correo electrónico no es válido.'], 400);
}

$lead = [
    'id' => 'lead_' . bin2hex(random_bytes(8)),
    'nombre' => $nombre,
    'whatsapp' => $whatsapp,
    'correo' => $correo,
    'proyecto' => $proyecto,
    'unidad' => $unidad,
    'mensaje' => $mensaje,
    'origen' => $origen,
    'status' => 'Nuevo',
    'created_at' => gmdate('c'),
];

$leads = read_private_json('leads.json', []);
if (!is_array($leads)) {
    $leads = [];
}

array_unshift($leads, $lead);
if (!write_private_json('leads.json', $leads)) {
    json_response(['ok' => false, 'error' => 'No se pudo registrar tu solicitud en este momento.'], 500);
}

$secrets = load_secrets();
$webhookUrl = (string) ($secrets['webhook_url'] ?? '');
$webhookSent = false;
if ($webhookUrl !== '') {
    $webhookSent = dispatch_webhook_async($webhookUrl, [
        'event' => 'new_lead',
        'lead' => $lead,
    ]);
}

json_response([
    'ok' => true,
    'lead_id' => $lead['id'],
    'webhook_dispatched' => $webhookSent,
    'message' => 'Solicitud registrada de forma segura.',
], 201);