<?php
declare(strict_types=1);

/**
 * Núcleo de Seguridad y Persistencia Privada (PHP 8+)
 * Almacena secretos, configuración y leads FUERA de la carpeta pública web.
 */

ini_set('display_errors', '0');
error_reporting(E_ALL);

define('APP_PUBLIC_ROOT', dirname(__DIR__));

function send_security_headers(): void
{
    if (headers_sent()) {
        return;
    }
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
}

function json_response(array $payload, int $status = 200): never
{
    send_security_headers();
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function read_json_body(int $maxBytes = 2097152): array
{
    $raw = file_get_contents('php://input', false, null, 0, $maxBytes + 1);
    if ($raw === false || $raw === '') {
        return [];
    }
    if (strlen($raw) > $maxBytes) {
        json_response(['ok' => false, 'error' => 'Carga útil excede el límite permitido.'], 413);
    }
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        json_response(['ok' => false, 'error' => 'Formato JSON inválido.'], 400);
    }
    return $decoded;
}

function get_private_dir(): string
{
    $envPath = getenv('INMOBILIARIA_PRIVATE_DIR');
    if (is_string($envPath) && $envPath !== '') {
        $target = rtrim($envPath, '/\\');
    } else {
        $parent = dirname(APP_PUBLIC_ROOT);
        if (is_writable($parent)) {
            $target = $parent . DIRECTORY_SEPARATOR . 'inmobiliaria_private';
        } else {
            // Respaldo protegido con .htaccess si el hosting restringe el directorio superior
            $target = APP_PUBLIC_ROOT . DIRECTORY_SEPARATOR . '_inmobiliaria_private';
        }
    }

    if (!is_dir($target)) {
        if (!mkdir($target, 0750, true) && !is_dir($target)) {
            json_response(['ok' => false, 'error' => 'No se pudo inicializar el almacenamiento privado.'], 500);
        }
    }

    $htaccess = $target . DIRECTORY_SEPARATOR . '.htaccess';
    if (!file_exists($htaccess)) {
        @file_put_contents(
            $htaccess,
            "<IfModule mod_authz_core.c>\n    Require all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\n    Deny from all\n</IfModule>\n"
        );
    }

    $indexGuard = $target . DIRECTORY_SEPARATOR . 'index.php';
    if (!file_exists($indexGuard)) {
        @file_put_contents($indexGuard, "<?php http_response_code(403); exit;\n");
    }

    return $target;
}

function is_https_request(): bool
{
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        return true;
    }
    if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
        return true;
    }
    return ((int) ($_SERVER['SERVER_PORT'] ?? 80)) === 443;
}

function init_secure_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');

    session_name('INMOB_SESS');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => is_https_request(),
        'httponly' => true,
        'samesite' => 'Strict',
    ]);

    session_start();

    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
}

function get_csrf_token(): string
{
    init_secure_session();
    return (string) ($_SESSION['csrf_token'] ?? '');
}

function require_csrf(): void
{
    init_secure_session();
    $headerToken = (string) ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
    $sessionToken = (string) ($_SESSION['csrf_token'] ?? '');
    if ($headerToken === '' || $sessionToken === '' || !hash_equals($sessionToken, $headerToken)) {
        json_response(['ok' => false, 'error' => 'Token de seguridad CSRF inválido o ausente.'], 403);
    }
}

function require_auth(string $requiredRole = 'admin'): void
{
    init_secure_session();
    $role = $_SESSION['auth_role'] ?? null;
    $lastActivity = (int) ($_SESSION['last_activity'] ?? 0);

    // Expiración por inactividad: 2 horas
    if ($role === null || (time() - $lastActivity) > 7200) {
        $_SESSION = [];
        json_response(['ok' => false, 'error' => 'Sesión expirada o no autorizada.'], 401);
    }

    if ($requiredRole === 'dev' && $role !== 'dev') {
        json_response(['ok' => false, 'error' => 'Permisos insuficientes para esta operación.'], 403);
    }

    $_SESSION['last_activity'] = time();
}

function get_client_ip(): string
{
    return (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
}

function check_rate_limit(string $bucket, int $maxAttempts = 8, int $windowSeconds = 300): void
{
    $dir = get_private_dir() . DIRECTORY_SEPARATOR . 'ratelimit';
    if (!is_dir($dir)) {
        @mkdir($dir, 0750, true);
    }

    $hash = hash('sha256', $bucket . '|' . get_client_ip());
    $file = $dir . DIRECTORY_SEPARATOR . $hash . '.json';
    $now = time();

    $fp = @fopen($file, 'c+');
    if ($fp === false) {
        return;
    }

    flock($fp, LOCK_EX);
    $raw = stream_get_contents($fp);
    $data = is_string($raw) && $raw !== '' ? json_decode($raw, true) : [];
    $attempts = is_array($data['attempts'] ?? null) ? $data['attempts'] : [];
    $attempts = array_values(array_filter($attempts, static fn ($ts): bool => is_int($ts) && ($now - $ts) < $windowSeconds));

    if (count($attempts) >= $maxAttempts) {
        flock($fp, LOCK_UN);
        fclose($fp);
        json_response(['ok' => false, 'error' => 'Demasiados intentos. Espera unos minutos antes de reintentar.'], 429);
    }

    $attempts[] = $now;
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode(['attempts' => $attempts]));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
}

function clear_rate_limit(string $bucket): void
{
    $file = get_private_dir()
        . DIRECTORY_SEPARATOR . 'ratelimit'
        . DIRECTORY_SEPARATOR . hash('sha256', $bucket . '|' . get_client_ip()) . '.json';
    if (file_exists($file)) {
        @unlink($file);
    }
}

function safe_private_path(string $filename): string
{
    if (!preg_match('/^[a-z0-9_-]+\.json$/i', $filename)) {
        json_response(['ok' => false, 'error' => 'Nombre de recurso privado no permitido.'], 400);
    }
    return get_private_dir() . DIRECTORY_SEPARATOR . $filename;
}

function read_private_json(string $filename, mixed $default = []): mixed
{
    $path = safe_private_path($filename);
    if (!file_exists($path)) {
        return $default;
    }
    $fp = @fopen($path, 'rb');
    if ($fp === false) {
        return $default;
    }
    flock($fp, LOCK_SH);
    $raw = stream_get_contents($fp);
    flock($fp, LOCK_UN);
    fclose($fp);

    if (!is_string($raw) || $raw === '') {
        return $default;
    }
    $decoded = json_decode($raw, true);
    return json_last_error() === JSON_ERROR_NONE ? $decoded : $default;
}

function write_private_json(string $filename, mixed $data): bool
{
    $path = safe_private_path($filename);
    $encoded = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($encoded === false) {
        return false;
    }

    $fp = @fopen($path, 'c+b');
    if ($fp === false) {
        return false;
    }
    flock($fp, LOCK_EX);
    ftruncate($fp, 0);
    rewind($fp);
    $written = fwrite($fp, $encoded);
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    @chmod($path, 0600);

    return $written !== false;
}

function password_algo(): string|int
{
    return defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_BCRYPT;
}

function load_secrets(): array
{
    $secrets = read_private_json('secrets.json', null);
    if (is_array($secrets) && !empty($secrets['pin_hash']) && !empty($secrets['dev_key_hash'])) {
        return $secrets;
    }

    // Inicialización segura de primera ejecución (los hashes nunca viven en JS)
    $initial = [
        'pin_hash' => password_hash('2026', password_algo()),
        'dev_key_hash' => password_hash('DEV-2026', password_algo()),
        'meta_verify_token' => '',
        'meta_access_token' => '',
        'meta_phone_id' => '',
        'webhook_url' => '',
        'updated_at' => gmdate('c'),
    ];
    write_private_json('secrets.json', $initial);
    return $initial;
}

function save_secrets(array $secrets): bool
{
    $secrets['updated_at'] = gmdate('c');
    return write_private_json('secrets.json', $secrets);
}