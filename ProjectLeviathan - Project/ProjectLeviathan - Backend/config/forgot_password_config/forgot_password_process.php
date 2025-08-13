<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../db_config.php';

$action = $_POST['action'] ?? '';
$response = ['success' => false, 'message' => 'Acción no válida.'];

if ($action === 'get_csrf_token') {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    $response['success'] = true;
    $response['csrf_token'] = $_SESSION['csrf_token'];
    echo json_encode($response);
    exit;
}

if (empty($_POST['csrf_token']) || empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
    $response['message'] = 'Error de validación de seguridad. Por favor, recarga la página.';
    echo json_encode($response);
    exit;
}

if ($action === 'find_account') {
    $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
    if (!$email) {
        $response['message'] = 'Correo electrónico inválido.';
    } else {
        try {
            $stmt = $pdo->prepare("SELECT id, phone_number FROM users WHERE email = :email");
            $stmt->execute(['email' => $email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                // Generar y guardar el código de verificación
                $verification_code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
                $expires_at = date('Y-m-d H:i:s', strtotime('+1 hour'));
                
                $stmt_code = $pdo->prepare("INSERT INTO verification_codes (user_email, code, expires_at) VALUES (:email, :code, :expires)");
                $stmt_code->execute(['email' => $email, 'code' => $verification_code, 'expires' => $expires_at]);

                $_SESSION['reset_email'] = $email;
                $response['success'] = true;
                $response['message'] = 'Cuenta encontrada. Se ha generado un código.';
            } else {
                $response['message'] = 'No se encontró una cuenta con ese correo electrónico.';
            }
        } catch (PDOException $e) {
            $response['message'] = 'Error del servidor.';
        }
    }
}

if ($action === 'verify_code') {
    $code = $_POST['verification_code'] ?? '';
    $email = $_SESSION['reset_email'] ?? '';

    if (empty($code) || empty($email)) {
        $response['message'] = 'Sesión inválida o código no proporcionado.';
    } else {
        try {
            $stmt = $pdo->prepare("SELECT * FROM verification_codes WHERE user_email = :email AND code = :code ORDER BY id DESC LIMIT 1");
            $stmt->execute(['email' => $email, 'code' => $code]);
            $verification = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($verification) {
                if (new DateTime() > new DateTime($verification['expires_at'])) {
                    $response['message'] = 'El código ha expirado.';
                } else {
                    $_SESSION['reset_code_verified'] = true;
                    $response['success'] = true;
                    $response['message'] = 'Código verificado.';
                }
            } else {
                $response['message'] = 'El código de verificación es incorrecto.';
            }
        } catch (PDOException $e) {
            $response['message'] = 'Error del servidor.';
        }
    }
}

if ($action === 'reset_password') {
    $new_password = $_POST['new_password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    $email = $_SESSION['reset_email'] ?? '';
    $code_verified = $_SESSION['reset_code_verified'] ?? false;

    if (empty($new_password) || empty($confirm_password) || empty($email) || !$code_verified) {
        $response['message'] = 'Datos incompletos o sesión inválida.';
    } elseif ($new_password !== $confirm_password) {
        $response['message'] = 'Las contraseñas no coinciden.';
    } elseif (strlen($new_password) < 8) {
        $response['message'] = 'La contraseña debe tener al menos 8 caracteres.';
    } else {
        try {
            $hashed_password = password_hash($new_password, PASSWORD_BCRYPT);
            $stmt = $pdo->prepare("UPDATE users SET password = :password WHERE email = :email");
            $stmt->execute(['password' => $hashed_password, 'email' => $email]);
            
            // Limpiar datos de sesión
            unset($_SESSION['reset_email'], $_SESSION['reset_code_verified']);

            $response['success'] = true;
            $response['message'] = 'Contraseña actualizada con éxito.';
            $response['redirect_url'] = '../'; // Redirigir al login
        } catch (PDOException $e) {
            $response['message'] = 'Error del servidor al actualizar la contraseña.';
        }
    }
}

echo json_encode($response);
?>