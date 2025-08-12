<?php
// register_process.php (El único script de lógica necesario)

session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../db_config.php';

$action = $_POST['action'] ?? '';
$response = ['success' => false, 'message' => 'Acción no válida.'];

//======================================================================
// ACCIÓN 0: GENERAR Y ENVIAR TOKEN CSRF
//======================================================================
if ($action === 'get_csrf_token') {
    // Genera un token CSRF si no existe uno en la sesión
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    $response['success'] = true;
    $response['csrf_token'] = $_SESSION['csrf_token'];
    echo json_encode($response);
    exit;
}

//======================================================================
// VALIDACIÓN DE CSRF TOKEN PARA TODAS LAS DEMÁS ACCIONES
//======================================================================
if (empty($_POST['csrf_token']) || empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
    $response['message'] = 'Error de validación de seguridad. Por favor, recarga la página.';
    echo json_encode($response);
    exit;
}

//======================================================================
// ACCIÓN 1: VALIDAR ETAPA 1 (EMAIL Y LÍMITE DE IP)
//======================================================================
if ($action === 'validate_step1') {
    $ip_limit = 3;

    function get_public_ip() {
        try {
            $ip_data_json = @file_get_contents('https://ipwho.is/');
            if ($ip_data_json === false) return 'UNKNOWN';
            $ip_data = json_decode($ip_data_json, true);
            return (json_last_error() === JSON_ERROR_NONE && isset($ip_data['ip'])) ? $ip_data['ip'] : 'UNKNOWN';
        } catch (Exception $e) {
            return 'UNKNOWN';
        }
    }
    
    $user_ip = get_public_ip();
    $_SESSION['client_metadata'] = ['ip_address' => $user_ip, 'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'UNKNOWN'];
    $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);

    if (!$email) {
        $response['message'] = 'Correo electrónico inválido.';
    } else {
        try {
            if ($user_ip !== 'UNKNOWN') {
                $stmt_ip = $pdo->prepare("SELECT COUNT(*) FROM users_metadata WHERE ip_address = :ip");
                $stmt_ip->execute(['ip' => $user_ip]);
                if ($stmt_ip->fetchColumn() >= $ip_limit) {
                    $response['message'] = 'Se ha alcanzado el límite de cuentas para esta red.';
                    echo json_encode($response);
                    exit;
                }
            }
            $stmt_email = $pdo->prepare("SELECT id FROM users WHERE email = :email");
            $stmt_email->execute(['email' => $email]);
            if ($stmt_email->fetch()) {
                $response['message'] = 'Este correo electrónico ya está registrado.';
            } else {
                $response['success'] = true;
                $response['message'] = 'Email validado.';
            }
        } catch (PDOException $e) {
            $response['message'] = 'Error del servidor.';
        }
    }
}

//======================================================================
// ACCIÓN 2: VALIDAR ETAPA 2 Y GENERAR CÓDIGO
//======================================================================
if ($action === 'generate_code') {
    $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
    $password = $_POST['password'] ?? '';
    $username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_STRING);
    $phone_number = filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_NUMBER_INT);
    $country_code = filter_input(INPUT_POST, 'country_code', FILTER_SANITIZE_STRING);
    
    if (!$email || empty($password) || empty($username) || empty($phone_number)) {
        $response['message'] = 'Datos de formulario incompletos.';
    } else {
        try {
            $full_phone = $country_code . $phone_number;
            $stmt_check = $pdo->prepare("SELECT username FROM users WHERE username = :username OR phone_number = :phone");
            $stmt_check->execute(['username' => $username, 'phone' => $full_phone]);
            if ($stmt_check->fetch()) {
                $response['message'] = 'El nombre de usuario o teléfono ya están en uso.';
            } else {
                $_SESSION['registration_data'] = [
                    'email' => $email, 'username' => $username, 'full_phone' => $full_phone,
                    'hashed_password' => password_hash($password, PASSWORD_BCRYPT),
                ];
                $verification_code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
                $expires_at = date('Y-m-d H:i:s', strtotime('+1 hour'));
                $stmt_code = $pdo->prepare("INSERT INTO verification_codes (user_email, code, expires_at) VALUES (:email, :code, :expires)");
                $stmt_code->execute(['email' => $email, 'code' => $verification_code, 'expires' => $expires_at]);
                $response['success'] = true;
                $response['message'] = 'Código generado.';
            }
        } catch (PDOException $e) {
            $response['message'] = 'Error del servidor.';
        }
    }
}

//======================================================================
// ACCIÓN 3: VERIFICAR CUENTA Y CREAR USUARIO
//======================================================================
if ($action === 'verify_account') {
    if (!isset($_SESSION['registration_data']) || !isset($_SESSION['client_metadata'])) {
        $response['message'] = 'Sesión expirada. Reinicia el proceso.';
    } else {
        $reg_data = $_SESSION['registration_data'];
        $meta_data = $_SESSION['client_metadata'];
        $code = $_POST['verification_code'] ?? '';

        try {
            $stmt = $pdo->prepare("SELECT * FROM verification_codes WHERE user_email = :email AND code = :code ORDER BY id DESC LIMIT 1");
            $stmt->execute(['email' => $reg_data['email'], 'code' => $code]);
            $verification = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$verification) {
                $response['message'] = 'El código de verificación es incorrecto.';
            } elseif (new DateTime() > new DateTime($verification['expires_at'])) {
                $response['message'] = 'El código ha expirado.';
            } else {
                $pdo->beginTransaction();
                function generate_uuid() {
                    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x', mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000, mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff));
                }
                $stmt_user = $pdo->prepare("INSERT INTO users (uuid, username, email, phone_number, password) VALUES (:uuid, :user, :email, :phone, :pass)");
                $stmt_user->execute(['uuid' => generate_uuid(), 'user' => $reg_data['username'], 'email' => $reg_data['email'], 'phone' => $reg_data['full_phone'], 'pass' => $reg_data['hashed_password']]);
                $user_id = $pdo->lastInsertId();

                $stmt_meta = $pdo->prepare("INSERT INTO users_metadata (user_id, ip_address, user_agent) VALUES (:id, :ip, :agent)");
                $stmt_meta->execute(['id' => $user_id, 'ip' => $meta_data['ip_address'], 'agent' => $meta_data['user_agent']]);

                $stmt_del = $pdo->prepare("DELETE FROM verification_codes WHERE id = :id");
                $stmt_del->execute(['id' => $verification['id']]);
                $pdo->commit();

                // Destruir el token CSRF y los datos de sesión de registro
                unset($_SESSION['csrf_token'], $_SESSION['registration_data'], $_SESSION['client_metadata']);
                $response['success'] = true;
                $response['message'] = '¡Cuenta verificada y creada con éxito!';
            }
        } catch (PDOException $e) {
            $pdo->rollBack();
            $response['message'] = 'Error del servidor al crear la cuenta.';
        }
    }
}

echo json_encode($response);
?>