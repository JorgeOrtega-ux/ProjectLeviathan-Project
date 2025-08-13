<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json');
require_once __DIR__ . '/../db_config.php';

function send_response($success, $message, $extra_data = [])
{
    $response = ['success' => $success, 'message' => $message];
    echo json_encode(array_merge($response, $extra_data));
    exit;
}

function is_csrf_valid()
{
    $token = $_POST['csrf_token'] ?? '';
    if (empty($token) || empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
        return false;
    }
    return true;
}

$action = $_POST['action'] ?? '';

if ($action === 'get_csrf_token') {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    send_response(true, 'Token generado.', ['csrf_token' => $_SESSION['csrf_token']]);
}

if (!is_csrf_valid()) {
    send_response(false, 'Error de validación de seguridad. Por favor, recarga la página.');
}

switch ($action) {
    case 'send_code':
        $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
        if (!$email) {
            send_response(false, 'El formato del correo electrónico no es válido.');
        }
        try {
            $stmt = $pdo->prepare("SELECT id, status FROM users WHERE email = :email");
            $stmt->execute(['email' => $email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                if ($user['status'] !== 'active') {
                    $message = 'No se puede restablecer la contraseña para esta cuenta.';
                    switch ($user['status']) {
                        case 'suspended':
                            $message = 'Tu cuenta está suspendida. Contacta a soporte.';
                            break;
                        case 'banned':
                            $message = 'Tu cuenta ha sido baneada permanentemente.';
                            break;
                        case 'deleted':
                            $message = 'Esta cuenta de usuario ya no existe.';
                            break;
                    }
                    send_response(false, $message);
                    exit;
                }

                // *** INICIO DE LA CORRECCIÓN ***
                // Se reemplaza rand() por random_int() para un código criptográficamente seguro.
                $verification_code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                // *** FIN DE LA CORRECCIÓN ***

                $expires_at = date('Y-m-d H:i:s', strtotime('+1 hour'));
                $stmt_code = $pdo->prepare("INSERT INTO verification_codes (user_email, type, code, expires_at) VALUES (:email, 'password_reset', :code, :expires)");
                $stmt_code->execute(['email' => $email, 'code' => $verification_code, 'expires' => $expires_at]);

                $_SESSION['reset_email'] = $email;
                send_response(true, 'Código enviado.');
            } else {
                send_response(false, 'No se encontró ninguna cuenta con ese correo.');
            }
        } catch (PDOException $e) {
            send_response(false, 'Error del servidor al procesar el correo.');
        }
        break;

    case 'verify_code':
        $code = $_POST['verification_code'] ?? '';
        $email = $_SESSION['reset_email'] ?? null;
        if (!$email) {
            send_response(false, 'Tu sesión ha expirado. Vuelve a empezar.');
        }
        if (strlen($code) !== 6) {
            send_response(false, 'El código debe tener 6 dígitos.');
        }
        try {
            $stmt = $pdo->prepare("SELECT * FROM verification_codes WHERE user_email = :email AND code = :code AND type = 'password_reset' ORDER BY id DESC LIMIT 1");
            $stmt->execute(['email' => $email, 'code' => $code]);
            $verification = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($verification && new DateTime() < new DateTime($verification['expires_at'])) {
                $_SESSION['reset_code_verified'] = true;
                $stmt_del = $pdo->prepare("DELETE FROM verification_codes WHERE id = :id");
                $stmt_del->execute(['id' => $verification['id']]);
                send_response(true, 'Código verificado.');
            } else {
                send_response(false, 'El código es incorrecto o ha expirado.');
            }
        } catch (PDOException $e) {
            send_response(false, 'Error del servidor al verificar el código.');
        }
        break;

    case 'reset_password':
        $password = $_POST['password'] ?? '';
        $confirm_password = $_POST['confirm_password'] ?? '';
        $email = $_SESSION['reset_email'] ?? null;
        $code_verified = $_SESSION['reset_code_verified'] ?? false;

        if (!$email || !$code_verified) {
            send_response(false, 'No has verificado el código. Reinicia el proceso.');
        }
        if (strlen($password) < 8) {
            send_response(false, 'La contraseña debe tener al menos 8 caracteres.');
        }
        if ($password !== $confirm_password) {
            send_response(false, 'Las contraseñas no coinciden.');
        }
        try {
            $pdo->beginTransaction();

            $stmt_user = $pdo->prepare("SELECT id, password FROM users WHERE email = :email");
            $stmt_user->execute(['email' => $email]);
            $user = $stmt_user->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                $pdo->rollBack();
                send_response(false, 'No se encontró el usuario.');
                exit;
            }

            // --- INICIO DE LA MODIFICACIÓN ---
            // Se añade la verificación para no reutilizar la contraseña actual.
            if (password_verify($password, $user['password'])) {
                $pdo->rollBack();
                send_response(false, 'La nueva contraseña no puede ser igual a la actual.');
                exit;
            }
            // --- FIN DE LA MODIFICACIÓN ---

            $user_id = $user['id'];
            $hashed_password = password_hash($password, PASSWORD_BCRYPT);

            $stmt_update = $pdo->prepare("UPDATE users SET password = :password WHERE email = :email");
            $stmt_update->execute(['password' => $hashed_password, 'email' => $email]);

            $stmt_history = $pdo->prepare(
                "INSERT INTO user_update_history (user_id, field_changed) VALUES (:user_id, 'password')"
            );
            $stmt_history->execute(['user_id' => $user_id]);

            $pdo->commit();

            unset($_SESSION['reset_email'], $_SESSION['reset_code_verified'], $_SESSION['csrf_token']);
            send_response(true, 'Contraseña actualizada.', ['redirect_url' => '../']);
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            send_response(false, 'Error del servidor al actualizar la contraseña.');
        }
        break;
    default:
        send_response(false, "La acción '{$action}' no es válida o no se recibió correctamente.");
        break;
}
