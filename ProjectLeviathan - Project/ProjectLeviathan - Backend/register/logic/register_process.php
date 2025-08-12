<?php
// register_process.php - Procesa el registro inicial del usuario.

// --- INICIA LA SESIÓN ---
session_start();

header('Content-Type: application/json');
require_once 'db_config.php';

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Método de solicitud no válido.';
    echo json_encode($response);
    exit;
}

// --- RECOGER Y SANITIZAR DATOS ---
$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
$password = $_POST['password'] ?? '';
$username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_STRING);
$phone_number = filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_NUMBER_INT);
$country_code = filter_input(INPUT_POST, 'country_code', FILTER_SANITIZE_STRING);
$full_phone = $country_code . $phone_number;

// --- VALIDACIONES DEL SERVIDOR ---
if (empty($email) || empty($password) || empty($username) || empty($phone_number)) {
    $response['message'] = 'Todos los campos son obligatorios.';
    echo json_encode($response);
    exit;
}
if (strlen($password) < 8) {
    $response['message'] = 'La contraseña debe tener al menos 8 caracteres.';
    echo json_encode($response);
    exit;
}

try {
    // --- MODIFICACIÓN PRINCIPAL AQUÍ ---
    // 1. VERIFICAR SI EL EMAIL, USERNAME O TELÉFONO YA EXISTEN
    $stmt = $pdo->prepare(
        "SELECT id FROM users WHERE email = :email OR username = :username OR phone_number = :phone_number"
    );
    $stmt->execute([
        'email' => $email,
        'username' => $username,
        'phone_number' => $full_phone
    ]);

    if ($stmt->fetch()) {
        // Mensaje de error actualizado para ser más general
        $response['message'] = 'El correo, nombre de usuario o número de teléfono ya están en uso.';
        echo json_encode($response);
        exit;
    }
    // --- FIN DE LA MODIFICACIÓN ---


    // 2. INSERTAR USUARIO (CON is_verified = FALSE)
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);
    $uuid = generate_uuid();
    $stmt = $pdo->prepare(
        "INSERT INTO users (uuid, username, email, phone_number, password, is_verified) VALUES (:uuid, :username, :email, :phone_number, :password, FALSE)"
    );
    $stmt->execute([
        'uuid' => $uuid, 'username' => $username, 'email' => $email,
        'phone_number' => $full_phone, 'password' => $hashed_password
    ]);
    $user_id = $pdo->lastInsertId();

    // 3. GENERAR Y GUARDAR CÓDIGO DE VERIFICACIÓN
    $verification_code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
    $expires_at = date('Y-m-d H:i:s', strtotime('+1 hour'));
    $stmt = $pdo->prepare(
        "INSERT INTO verification_codes (user_id, code, expires_at) VALUES (:user_id, :code, :expires_at)"
    );
    $stmt->execute(['user_id' => $user_id, 'code' => $verification_code, 'expires_at' => $expires_at]);

    // 4. GUARDAR EL ID DE USUARIO EN LA SESIÓN
    $_SESSION['user_id_to_verify'] = $user_id;

    // 5. RESPUESTA DE ÉXITO
    $response['success'] = true;
    $response['message'] = 'Usuario registrado. Ahora introduce el código de verificación.';

} catch (PDOException $e) {
    $response['message'] = 'Error en el servidor al procesar el registro: ' . $e->getMessage();
}

echo json_encode($response);
?>