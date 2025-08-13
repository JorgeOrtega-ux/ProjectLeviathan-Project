<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../db_config.php';

$action = $_POST['action'] ?? '';
$response = ['success' => false, 'message' => 'Acción no válida.'];

// --- ACCIÓN: OBTENER TOKEN CSRF ---
if ($action === 'get_csrf_token') {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    $response['success'] = true;
    $response['csrf_token'] = $_SESSION['csrf_token'];
    echo json_encode($response);
    exit;
}

// --- VALIDACIÓN DE TOKEN CSRF ---
if (empty($_POST['csrf_token']) || empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
    $response['message'] = 'Error de validación de seguridad. Por favor, recarga la página.';
    echo json_encode($response);
    exit;
}

// --- ACCIÓN: VALIDAR PASO 1 (CORREO Y LÍMITE DE IP) ---
if ($action === 'validate_step1') {
    $ip_limit = 3;

    // Se obtiene la IP directamente de la variable del servidor $_SERVER['REMOTE_ADDR'],
    // que es más rápido, fiable y seguro.
    function get_user_ip() {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        return filter_var($ip, FILTER_VALIDATE_IP) ?: 'UNKNOWN';
    }
    
    $user_ip = get_user_ip();
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

// --- ACCIÓN: GENERAR CÓDIGO DE VERIFICACIÓN ---
if ($action === 'generate_code') {
    $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
    $password = $_POST['password'] ?? '';
    $phone_number = filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_NUMBER_INT);
    $country_code = filter_input(INPUT_POST, 'country_code', FILTER_SANITIZE_STRING);

    // --- INICIO DE LA MODIFICACIÓN ---
    $username = $_POST['username'] ?? ''; // Obtener el valor crudo

    // Se valida el nombre de usuario con una expresión regular estricta.
    if (!preg_match('/^[a-zA-Z0-9_]{4,25}$/', $username)) {
        $response['message'] = 'El nombre de usuario solo puede contener letras, números y guiones bajos, y debe tener entre 4 y 25 caracteres.';
        echo json_encode($response);
        exit;
    }
    // --- FIN DE LA MODIFICACIÓN ---
    
    // *** INICIO DE LA CORRECCIÓN ***
    // Se añade una validación estricta para el número de teléfono.
    if (!preg_match('/^[0-9]{10,15}$/', $phone_number)) {
        $response['message'] = 'El número de teléfono no es válido. Debe contener entre 10 y 15 dígitos.';
        echo json_encode($response);
        exit;
    }
    // *** FIN DE LA CORRECCIÓN ***

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
                
                $verification_code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                $expires_at = date('Y-m-d H:i:s', strtotime('+1 hour'));
                
                $stmt_code = $pdo->prepare("INSERT INTO verification_codes (user_email, type, code, expires_at) VALUES (:email, 'account_verification', :code, :expires)");
                $stmt_code->execute(['email' => $email, 'code' => $verification_code, 'expires' => $expires_at]);
                
                $response['success'] = true;
                $response['message'] = 'Código generado.';
            }
        } catch (PDOException $e) {
            $response['message'] = 'Error del servidor.';
        }
    }
}


// --- ACCIÓN: VERIFICAR CUENTA Y CREAR USUARIO ---
if ($action === 'verify_account') {
    if (!isset($_SESSION['registration_data']) || !isset($_SESSION['client_metadata'])) {
        $response['message'] = 'Sesión expirada. Reinicia el proceso.';
    } else {
        $reg_data = $_SESSION['registration_data'];
        $meta_data = $_SESSION['client_metadata'];
        $code = $_POST['verification_code'] ?? '';

        try {
            $stmt = $pdo->prepare("SELECT * FROM verification_codes WHERE user_email = :email AND code = :code AND type = 'account_verification' ORDER BY id DESC LIMIT 1");
            $stmt->execute(['email' => $reg_data['email'], 'code' => $code]);
            $verification = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$verification) {
                $response['message'] = 'El código de verificación es incorrecto.';
            } elseif (new DateTime() > new DateTime($verification['expires_at'])) {
                $response['message'] = 'El código ha expirado.';
            } else {
                $pdo->beginTransaction();
                
                function generate_uuid() {
                    $data = random_bytes(16);
                    $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // set version to 0100
                    $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // set bits 6-7 to 10
                    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
                }
                
                $user_role = 'user';
                $stmt_user = $pdo->prepare(
                    "INSERT INTO users (uuid, username, email, phone_number, password, role, created_at) 
                     VALUES (:uuid, :user, :email, :phone, :pass, :role, :created_at)"
                );
                
                $created_at = date('Y-m-d H:i:s');
                
                $stmt_user->execute([
                    'uuid' => generate_uuid(), 
                    'user' => $reg_data['username'], 
                    'email' => $reg_data['email'], 
                    'phone' => $reg_data['full_phone'], 
                    'pass' => $reg_data['hashed_password'], 
                    'role' => $user_role,
                    'created_at' => $created_at
                ]);
                $user_id = $pdo->lastInsertId();

                $stmt_meta = $pdo->prepare("INSERT INTO users_metadata (user_id, ip_address, user_agent) VALUES (:id, :ip, :agent)");
                $stmt_meta->execute(['id' => $user_id, 'ip' => $meta_data['ip_address'], 'agent' => $meta_data['user_agent']]);

                $stmt_del = $pdo->prepare("DELETE FROM verification_codes WHERE id = :id");
                $stmt_del->execute(['id' => $verification['id']]);
                
                $pdo->commit();

                unset($_SESSION['csrf_token'], $_SESSION['registration_data'], $_SESSION['client_metadata']);
                
                $_SESSION['user_id'] = $user_id;
                $_SESSION['username'] = $reg_data['username'];
                $_SESSION['email'] = $reg_data['email'];
                $_SESSION['phone_number'] = $reg_data['full_phone'];
                $_SESSION['role'] = $user_role;

                $response['success'] = true;
                $response['message'] = '¡Cuenta verificada y creada con éxito!';
                $response['redirect_url'] = '../../ProjectLeviathan - Frontend/';
            }
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            $response['message'] = 'Error del servidor al crear la cuenta.';
        }
    }
}

echo json_encode($response);
?>