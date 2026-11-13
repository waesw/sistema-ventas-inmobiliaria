<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

init_secure_session();
$method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));

function mask_secret(string $value): string
{
    $len = strlen($value);
    if ($len === 0) {
        return '';
    }
    if ($len <= 8) {
        return str_repeat('*', $len);
    }
    return substr($value, 0, 4) . str_repeat('*', max(4, $len - 8)) . substr($value, -4);
}

if ($method === 'GET') {
    $resource = (string) ($_GET['resource'] ?? 'public');

    if ($resource === 'empalme') {
        require_auth('dev');
        $secrets = load_secrets();
        json_response([
            'ok' => true,
            'empalme' => [
                'meta_phone_id' => (string) ($secrets['meta_phone_id'] ?? ''),
                'meta_verify_token' => (string) ($secrets['meta_verify_token'] ?? ''),
                'meta_access_token_set' => !empty($secrets['meta_access_token']),
                'meta_access_token_preview' => mask_secret((string) ($secrets['meta_access_token'] ?? '')),
                'webhook_url' => (string) ($secrets['webhook_url'] ?? ''),
                'updated_at' => (string) ($secrets['updated_at'] ?? ''),
            ],
        ]);
    }

    $config = read_private_json('config.json', null);
    $projects = read_private_json('projects.json', null);

    if ($resource === 'config') {
        json_response(['ok' => true, 'config' => is_array($config) ? $config : null]);
    }

    if ($resource === 'projects') {
        json_response(['ok' => true, 'projects' => is_array($projects) ? $projects : null]);
    }

    json_response([
        'ok' => true,
        'config' => is_array($config) ? $config : null,
        'projects' => is_array($projects) ? $projects : null,
    ]);
}

if ($method !== 'POST') {
    json_response(['ok' => false, 'error' => 'Método no permitido.'], 405);
}

require_csrf();
$body = read_json_body(10485760); // Hasta 10 MB para planos/galerías comprimidas
$resource = (string) ($body['resource'] ?? '');

if ($resource === 'config') {
    require_auth('admin');
    $config = $body['data'] ?? null;
    if (!is_array($config)) {
        json_response(['ok' => false, 'error' => 'Estructura de configuración inválida.'], 400);
    }

    $config['server_updated_at'] = gmdate('c');
    if (!write_private_json('config.json', $config)) {
        json_response(['ok' => false, 'error' => 'No se pudo guardar la configuración en el servidor.'], 500);
    }

    json_response(['ok' => true, 'message' => 'Configuración guardada en servidor privado.']);
}

if ($resource === 'projects') {
    require_auth('admin');
    $projects = $body['data'] ?? null;
    if (!is_array($projects)) {
        json_response(['ok' => false, 'error' => 'Estructura de proyectos inválida.'], 400);
    }

    if (count($projects) > 5) {
        json_response(['ok' => false, 'error' => 'Se excede el máximo permitido de 5 macro proyectos.'], 400);
    }

    if (!write_private_json('projects.json', array_values($projects))) {
        json_response(['ok' => false, 'error' => 'No se pudieron guardar los proyectos en el servidor.'], 500);
    }

    json_response(['ok' => true, 'message' => 'Catálogo de proyectos guardado en servidor privado.']);
}

if ($resource === 'bundle') {
    require_auth('admin');
    $config = $body['config'] ?? null;
    $projects = $body['projects'] ?? null;

    if (!is_array($config) || !is_array($projects)) {
        json_response(['ok' => false, 'error' => 'Datos de respaldo inválidos.'], 400);
    }

    if (count($projects) > 5) {
        json_response(['ok' => false, 'error' => 'Se excede el máximo permitido de 5 macro proyectos.'], 400);
    }

    $config['server_updated_at'] = gmdate('c');
    $savedConfig = write_private_json('config.json', $config);
    $savedProjects = write_private_json('projects.json', array_values($projects));

    if (!$savedConfig || !$savedProjects) {
        json_response(['ok' => false, 'error' => 'Error al guardar el paquete completo en servidor.'], 500);
    }

    json_response(['ok' => true, 'message' => 'Configuración y proyectos sincronizados en el servidor.']);
}

if ($resource === 'empalme') {
    require_auth('dev');
    $data = $body['data'] ?? null;
    if (!is_array($data)) {
        json_response(['ok' => false, 'error' => 'Datos de empalme inválidos.'], 400);
    }

    $webhookUrl = trim((string) ($data['webhook_url'] ?? ''));
    if ($webhookUrl !== '' && (!filter_var($webhookUrl, FILTER_VALIDATE_URL) || !str_starts_with($webhookUrl, 'https://'))) {
        json_response(['ok' => false, 'error' => 'El Webhook debe ser una URL HTTPS válida.'], 400);
    }

    $secrets = load_secrets();
    $secrets['meta_phone_id'] = trim((string) ($data['meta_phone_id'] ?? ($secrets['meta_phone_id'] ?? '')));
    $secrets['meta_verify_token'] = trim((string) ($data['meta_verify_token'] ?? ($secrets['meta_verify_token'] ?? '')));
    $secrets['webhook_url'] = $webhookUrl;

    $newToken = trim((string) ($data['meta_access_token'] ?? ''));
    if ($newToken !== '') {
        $secrets['meta_access_token'] = $newToken;
    }

    if (!save_secrets($secrets)) {
        json_response(['ok' => false, 'error' => 'No se pudieron guardar las credenciales de empalme.'], 500);
    }

    json_response(['ok' => true, 'message' => 'Credenciales de empalme guardadas de forma privada.']);
}

json_response(['ok' => false, 'error' => 'Recurso no reconocido.'], 400);