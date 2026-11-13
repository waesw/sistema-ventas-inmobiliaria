<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/notify.php';

$method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
$secrets = load_secrets();

// 1. VERIFICACIÓN DE WEBHOOK DE META CLOUD API (GET)
if ($method === 'GET') {
    $mode = (string) ($_GET['hub_mode'] ?? '');
    $token = (string) ($_GET['hub_verify_token'] ?? '');
    $challenge = (string) ($_GET['hub_challenge'] ?? '');
    $expected = (string) ($secrets['meta_verify_token'] ?? '');

    if ($mode === 'subscribe' && $expected !== '' && hash_equals($expected, $token)) {
        header('Content-Type: text/plain; charset=utf-8');
        http_response_code(200);
        echo $challenge;
        exit;
    }

    http_response_code(403);
    exit;
}

if ($method !== 'POST') {
    json_response(['ok' => false, 'error' => 'Método no permitido.'], 405);
}

$payload = read_json_body(524288);
$entry = $payload['entry'][0] ?? null;
$value = $entry['changes'][0]['value'] ?? null;
$message = $value['messages'][0] ?? null;

if (!is_array($message)) {
    json_response(['ok' => true, 'ignored' => true]);
}

$from = preg_replace('/\D+/', '', (string) ($message['from'] ?? '')) ?? '';
$msgId = (string) ($message['id'] ?? '');
$contactName = trim((string) ($value['contacts'][0]['profile']['name'] ?? ''));

if ($from === '' || $msgId === '') {
    json_response(['ok' => true, 'ignored' => true]);
}

$msgType = (string) ($message['type'] ?? '');
$rawText = '';
$interactiveId = '';

if ($msgType === 'text') {
    $rawText = trim((string) ($message['text']['body'] ?? ''));
} elseif ($msgType === 'interactive') {
    $interactiveId = (string) (
        $message['interactive']['button_reply']['id']
        ?? $message['interactive']['list_reply']['id']
        ?? ''
    );
    $rawText = (string) (
        $message['interactive']['button_reply']['title']
        ?? $message['interactive']['list_reply']['title']
        ?? ''
    );
}

function send_wa_payload(array $secrets, string $to, array $body): bool
{
    $phoneId = trim((string) ($secrets['meta_phone_id'] ?? ''));
    $token = trim((string) ($secrets['meta_access_token'] ?? ''));
    if ($phoneId === '' || $token === '') {
        return false;
    }

    $url = "https://graph.facebook.com/v21.0/{$phoneId}/messages";
    $res = http_post_json(
        $url,
        array_merge([
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $to,
        ], $body),
        ["Authorization: Bearer {$token}"],
        5
    );
    return (bool) $res['sent'];
}

function wa_text(array $secrets, string $to, string $text): bool
{
    return send_wa_payload($secrets, $to, [
        'type' => 'text',
        'text' => ['preview_url' => false, 'body' => $text],
    ]);
}

function wa_buttons(array $secrets, string $to, string $bodyText, array $buttons): bool
{
    $formatted = [];
    foreach (array_slice($buttons, 0, 3) as $btn) {
        $formatted[] = [
            'type' => 'reply',
            'reply' => ['id' => $btn['id'], 'title' => mb_substr($btn['title'], 0, 20)],
        ];
    }
    return send_wa_payload($secrets, $to, [
        'type' => 'interactive',
        'interactive' => [
            'type' => 'button',
            'body' => ['text' => $bodyText],
            'action' => ['buttons' => $formatted],
        ],
    ]);
}

function wa_list(array $secrets, string $to, string $bodyText, string $buttonLabel, array $rows): bool
{
    return send_wa_payload($secrets, $to, [
        'type' => 'interactive',
        'interactive' => [
            'type' => 'list',
            'body' => ['text' => $bodyText],
            'action' => [
                'button' => mb_substr($buttonLabel, 0, 20),
                'sections' => [['title' => 'Portafolio Activo', 'rows' => array_slice($rows, 0, 10)]],
            ],
        ],
    ]);
}

function register_bot_lead(array $secrets, array $config, string $phone, array $session, string $note): void
{
    $lead = [
        'id' => 'lead_' . bin2hex(random_bytes(8)),
        'nombre' => $session['lead_name'] ?: ($session['profile_name'] ?: 'Prospecto WhatsApp'),
        'whatsapp' => $phone,
        'correo' => '',
        'proyecto' => $session['project_name'] ?: 'Portafolio General',
        'unidad' => $session['lot_code'] ?: '',
        'mensaje' => mb_substr($note, 0, 500),
        'origen' => 'whatsapp_bot',
        'status' => 'Nuevo',
        'created_at' => gmdate('c'),
    ];

    $leads = read_private_json('leads.json', []);
    if (!is_array($leads)) {
        $leads = [];
    }
    array_unshift($leads, $lead);
    write_private_json('leads.json', $leads);

    dispatch_double_alert($secrets, $config, $lead);
}

// Cargar catálogo y marca en vivo
$config = read_private_json('config.json', []);
if (!is_array($config)) {
    $config = [];
}
$brandName = !empty($config['brandName']) ? (string) $config['brandName'] : 'Inmobiliaria Campestre';

$projectsRaw = read_private_json('projects.json', []);
$projects = is_array($projectsRaw)
    ? array_values(array_filter($projectsRaw, static fn ($p): bool => is_array($p) && ($p['visible'] ?? true) !== false))
    : [];
$projects = array_slice($projects, 0, 5);

// Cargar y depurar sesiones (ventana 24h)
$now = time();
$sessions = read_private_json('bot_sessions.json', []);
if (!is_array($sessions)) {
    $sessions = [];
}
foreach ($sessions as $k => $s) {
    if (($now - (int) ($s['updated_at'] ?? 0)) > 86400) {
        unset($sessions[$k]);
    }
}

$session = $sessions[$from] ?? [
    'node' => 'welcome',
    'turns' => 0,
    'off_topic' => 0,
    'silenced_until' => 0,
    'last_msg_at' => 0,
    'last_msg_id' => '',
    'profile_name' => $contactName,
    'lead_name' => '',
    'project_id' => '',
    'project_name' => '',
    'lot_code' => '',
    'payment_mode' => '',
    'updated_at' => $now,
];

// CANDADO 1: Deduplicación de reintentos de Meta
if ($session['last_msg_id'] === $msgId) {
    json_response(['ok' => true, 'dedup' => true]);
}
$session['last_msg_id'] = $msgId;

// CANDADO 2: Sesión silenciada (ya finalizó o excedió límites)
if ((int) $session['silenced_until'] > $now) {
    json_response(['ok' => true, 'silenced' => true]);
}

// CANDADO 3: Anti-ráfaga (mínimo 2 segundos entre mensajes)
if (($now - (int) $session['last_msg_at']) < 2) {
    json_response(['ok' => true, 'throttled' => true]);
}

$session['last_msg_at'] = $now;
$session['updated_at'] = $now;
$session['turns'] = (int) $session['turns'] + 1;

// CANDADO 4: Límite máximo de 8 interacciones en 24 horas
if ($session['turns'] > 8) {
    $session['silenced_until'] = $now + 86400;
    $sessions[$from] = $session;
    write_private_json('bot_sessions.json', $sessions);
    wa_text($secrets, $from, "Hemos alcanzado el límite de consultas automáticas por hoy. Un asesor de {$brandName} continuará tu atención en horario hábil.");
    json_response(['ok' => true, 'limit_reached' => true]);
}

$lower = mb_strtolower($rawText, 'UTF-8');

// ESCAPE INMEDIATO A ASESOR HUMANO
if (preg_match('/\b(asesor|humano|llamar|telefono|teléfono|cita|visita)\b/u', $lower) || $interactiveId === 'go_advisor') {
    $session['node'] = 'capture_details';
    $sessions[$from] = $session;
    write_private_json('bot_sessions.json', $sessions);
    wa_text($secrets, $from, "Con gusto te conectamos con un asesor de {$brandName}. Por favor escríbenos tu *nombre completo* y qué *día u horario* prefieres para atención o visita.");
    json_response(['ok' => true, 'node' => 'capture_details']);
}

$findProject = static function (string $idOrText) use ($projects): ?array {
    foreach ($projects as $p) {
        if (($p['id'] ?? '') === $idOrText || $idOrText === ('proj_' . ($p['id'] ?? ''))) {
            return $p;
        }
        $name = mb_strtolower((string) ($p['nombre'] ?? ''), 'UTF-8');
        if ($name !== '' && str_contains(mb_strtolower($idOrText, 'UTF-8'), $name)) {
            return $p;
        }
    }
    return null;
};

$sendProjectMenu = static function (array $proj) use ($secrets, $from): void {
    $msg = "*{$proj['nombre']}*\n"
        . "Ubicación: {$proj['municipio']}\n"
        . "Áreas: {$proj['rangoAreas']}\n"
        . "Inversión desde: {$proj['precioDesdeFormato']}\n"
        . "Respaldo: {$proj['estadoNotarialGeneral']}";

    wa_buttons($secrets, $from, $msg, [
        ['id' => 'act_lots', 'title' => 'Ver lotes disponibles'],
        ['id' => 'act_finance', 'title' => 'Financiación'],
        ['id' => 'go_advisor', 'title' => 'Agendar visita'],
    ]);
};

// NODO 4 -> NODO 5: CAPTURA DE NOMBRE/HORARIO Y CIERRE
if ($session['node'] === 'capture_details') {
    if (mb_strlen($rawText) < 3 || mb_strlen($rawText) > 300) {
        $session['off_topic'] = (int) $session['off_topic'] + 1;
        if ($session['off_topic'] >= 2) {
            $session['silenced_until'] = $now + 86400;
            $sessions[$from] = $session;
            write_private_json('bot_sessions.json', $sessions);
            wa_text($secrets, $from, "Gracias por escribirnos. Un asesor revisará tu solicitud en horario hábil.");
            json_response(['ok' => true, 'silenced' => true]);
        }
        $sessions[$from] = $session;
        write_private_json('bot_sessions.json', $sessions);
        wa_text($secrets, $from, "Por favor indícanos tu nombre y disponibilidad en un mensaje corto.");
        json_response(['ok' => true, 'retry' => true]);
    }

    $session['lead_name'] = $contactName !== '' ? $contactName : $rawText;
    $session['silenced_until'] = $now + 86400;
    $session['node'] = 'completed';
    $sessions[$from] = $session;
    write_private_json('bot_sessions.json', $sessions);

    register_bot_lead($secrets, $config, $from, $session, "Interés WhatsApp ({$session['payment_mode']}): {$rawText}");
    wa_text($secrets, $from, "Solicitud registrada. Un asesor comercial de {$brandName} se pondrá en contacto contigo con el plano y la ficha técnica.");
    json_response(['ok' => true, 'lead_saved' => true]);
}

// DETECCIÓN DIRECTA DE PROYECTO DESDE ANUNCIO O MENÚ
$matchedProj = $findProject($interactiveId !== '' ? $interactiveId : $rawText);
if ($matchedProj !== null) {
    $session['project_id'] = (string) ($matchedProj['id'] ?? '');
    $session['project_name'] = (string) ($matchedProj['nombre'] ?? '');
    $session['node'] = 'project_menu';
    $session['off_topic'] = 0;
    $sessions[$from] = $session;
    write_private_json('bot_sessions.json', $sessions);
    $sendProjectMenu($matchedProj);
    json_response(['ok' => true, 'node' => 'project_menu']);
}

// NODO 0: BIENVENIDA
if ($session['node'] === 'welcome') {
    if (mb_strlen($rawText) > 300) {
        $session['off_topic'] = 2;
        $session['silenced_until'] = $now + 86400;
        $sessions[$from] = $session;
        write_private_json('bot_sessions.json', $sessions);
        json_response(['ok' => true, 'silenced_length' => true]);
    }

    $rows = [];
    foreach ($projects as $p) {
        $rows[] = [
            'id' => 'proj_' . ($p['id'] ?? ''),
            'title' => mb_substr((string) ($p['nombre'] ?? 'Proyecto'), 0, 24),
            'description' => mb_substr((string) ($p['municipio'] ?? ''), 0, 72),
        ];
    }
    $rows[] = ['id' => 'go_advisor', 'title' => 'Hablar con un Asesor', 'description' => 'Atención comercial directa'];

    $session['node'] = 'awaiting_project';
    $sessions[$from] = $session;
    write_private_json('bot_sessions.json', $sessions);

    wa_list(
        $secrets,
        $from,
        "Cordial saludo, te comunicas con la línea privada de *{$brandName}*. Selecciona el proyecto de tu interés:",
        'Ver Proyectos',
        $rows
    );
    json_response(['ok' => true, 'node' => 'welcome_list']);
}

// NODO 1 -> NODO 2 / NODO 3
$currentProj = $findProject((string) $session['project_id']);
if ($currentProj !== null && $interactiveId === 'act_lots') {
    $units = is_array($currentProj['unidadesInventario'] ?? null) ? $currentProj['unidadesInventario'] : [];
    $available = array_values(array_filter($units, static fn ($u): bool => ($u['estado'] ?? '') === 'Disponible'));

    $lines = ["*Unidades disponibles en {$currentProj['nombre']}:*"];
    foreach (array_slice($available, 0, 10) as $u) {
        $price = number_format((float) ($u['precioCOP'] ?? 0), 0, ',', '.');
        $lines[] = "• {$u['codigo']} — {$u['area']} — \${$price} COP";
    }
    if (count($available) === 0) {
        $lines[] = "Actualmente estamos actualizando inventario. Solicita un asesor para revisar liberaciones.";
    }

    $session['node'] = 'awaiting_lot';
    $session['off_topic'] = 0;
    $sessions[$from] = $session;
    write_private_json('bot_sessions.json', $sessions);

    wa_buttons($secrets, $from, implode("\n", $lines), [
        ['id' => 'act_finance', 'title' => 'Financiación'],
        ['id' => 'go_advisor', 'title' => 'Separar / Visitar'],
    ]);
    json_response(['ok' => true, 'node' => 'lots_list']);
}

if ($currentProj !== null && $interactiveId === 'act_finance') {
    $session['node'] = 'awaiting_payment';
    $session['off_topic'] = 0;
    $sessions[$from] = $session;
    write_private_json('bot_sessions.json', $sessions);

    $msg = "*Financiación y Respaldo Jurídico*\n"
        . ($currentProj['financiacionDirecta'] ?? 'Financiación directa sin intermediación bancaria.') . "\n"
        . "Respaldo: " . ($currentProj['estadoNotarialGeneral'] ?? 'Titulación individual.');

    wa_buttons($secrets, $from, $msg, [
        ['id' => 'pay_cash', 'title' => 'Pago de contado'],
        ['id' => 'pay_direct', 'title' => 'Financiación directa'],
        ['id' => 'go_advisor', 'title' => 'Agendar visita'],
    ]);
    json_response(['ok' => true, 'node' => 'financing']);
}

if ($interactiveId === 'pay_cash' || $interactiveId === 'pay_direct') {
    $session['payment_mode'] = $interactiveId === 'pay_cash' ? 'Contado' : 'Financiación directa';
    $session['node'] = 'capture_details';
    $session['off_topic'] = 0;
    $sessions[$from] = $session;
    write_private_json('bot_sessions.json', $sessions);

    wa_text($secrets, $from, "Excelente. Para enviarte la simulación y coordinar visita, indícanos tu *nombre completo* y *disponibilidad horaria*.");
    json_response(['ok' => true, 'node' => 'capture_details']);
}

// CANDADO 5: CONTROL ESTRICTO DE RESPUESTAS FUERA DE TEMA (Máx. 2 intentos)
$session['off_topic'] = (int) $session['off_topic'] + 1;
if ($session['off_topic'] >= 2) {
    $session['silenced_until'] = $now + 86400;
    $sessions[$from] = $session;
    write_private_json('bot_sessions.json', $sessions);
    wa_text($secrets, $from, "Gracias por escribirnos. Si requieres atención inmobiliaria específica, un asesor de {$brandName} te atenderá en horario hábil.");
    json_response(['ok' => true, 'silenced_off_topic' => true]);
}

$sessions[$from] = $session;
write_private_json('bot_sessions.json', $sessions);
wa_text($secrets, $from, "Para atenderte con precisión, selecciona una de las opciones del menú anterior o escribe *ASESOR*.");
json_response(['ok' => true, 'off_topic_warning' => 1]);