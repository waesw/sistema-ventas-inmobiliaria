<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

init_secure_session();
$method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));

if ($method === 'GET') {
    $role = $_SESSION['auth_role'] ?? null;
    $lastActivity = (int) ($_SESSION['last_activity'] ?? 0);
    $active = is_string($role) && (time() - $lastActivity) <= 7200;

    if (!$active && $role !== null) {
        $_SESSION = [];
        $role = null;
    } elseif ($active) {
        $_SESSION['last_activity'] = time();
    }

    json_response([
        'ok' => true,
        'authenticated' => $active,
        'role' => $active ? $role : null,
        'csrfToken' => get_csrf_token(),
    ]);
}

if ($method !== 'POST') {
    json_response(['ok' => false, 'error' => 'Método no permitido.'], 405);
}

$body = read_json_body(32768);
$action = (string) ($body['action'] ?? '');

if ($action === 'login') {
    $scope = (string) ($body['scope'] ?? 'admin');
    if ($scope !== 'admin' && $scope !== 'dev') {
        json_response(['ok' => false, 'error' => 'Ámbito de acceso inválido.'], 400);
    }

    $credential = (string) ($body['credential'] ?? '');
    if ($credential === '') {
        json_response(['ok' => false, 'error' => 'Ingresa la credencial de acceso.'], 400);
    }

    $bucket = 'auth_' . $scope;
    check_rate_limit($bucket, 8, 300);

    $secrets = load_secrets();
    $hashKey = $scope === 'dev' ? 'dev_key_hash' : 'pin_hash';
    $storedHash = (string) ($secrets[$hashKey] ?? '');

    if ($storedHash === '' || !password_verify($credential, $storedHash)) {
        json_response(['ok' => false, 'error' => 'Credencial incorrecta.'], 401);
    }

    clear_rate_limit($bucket);
    session_regenerate_id(true);
    $_SESSION['auth_role'] = $scope;
    $_SESSION['last_activity'] = time();
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

    json_response([
        'ok' => true,
        'authenticated' => true,
        'role' => $scope,
        'csrfToken' => $_SESSION['csrf_token'],
    ]);
}

if ($action === 'logout') {
    require_csrf();
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires' => time() - 42000,
            'path' => $params['path'] ?: '/',
            'domain' => $params['domain'] ?: '',
            'secure' => (bool) $params['secure'],
            'httponly' => (bool) $params['httponly'],
            'samesite' => $params['samesite'] ?: 'Strict',
        ]);
    }

    session_destroy();
    json_response([
        'ok' => true,
        'authenticated' => false,
        'role' => null,
    ]);
}

if ($action === 'change_credential') {
    require_csrf();
    $target = (string) ($body['target'] ?? 'admin');
    if ($target !== 'admin' && $target !== 'dev') {
        json_response(['ok' => false, 'error' => 'Objetivo inválido.'], 400);
    }

    require_auth($target);

    $current = (string) ($body['current_credential'] ?? '');
    $next = trim((string) ($body['new_credential'] ?? ''));

    $minLen = $target === 'dev' ? 8 : 4;
    if (strlen($next) < $minLen || strlen($next) > 64) {
        json_response([
            'ok' => false,
            'error' => "La nueva credencial debe tener entre {$minLen} y 64 caracteres.",
        ], 400);
    }

    $secrets = load_secrets();
    $hashKey = $target === 'dev' ? 'dev_key_hash' : 'pin_hash';
    $storedHash = (string) ($secrets[$hashKey] ?? '');

    if ($storedHash === '' || !password_verify($current, $storedHash)) {
        json_response(['ok' => false, 'error' => 'La credencial actual no coincide.'], 401);
    }

    $secrets[$hashKey] = password_hash($next, password_algo());
    if (!save_secrets($secrets)) {
        json_response(['ok' => false, 'error' => 'No se pudo guardar la nueva credencial.'], 500);
    }

    json_response([
        'ok' => true,
        'message' => 'Credencial actualizada de forma segura.',
    ]);
}

json_response(['ok' => false, 'error' => 'Acción no reconocida.'], 400);