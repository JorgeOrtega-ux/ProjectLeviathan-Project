<?php
// verify_code.php - Valida el código de verificación del usuario.

session_start();
header('Content-Type: application/json');
require_once 'db_config.php';

$response = ['success' => false, 'message' => ''];

// 1. VERIFICAR QUE EL USUARIO ESTÉ LOGUEADO Y SE HAYA ENVIADO UN CÓDIGO
if (!isset($_SESSION['user_id_to_verify'])) {
    $response['message'] = 'No hay ninguna sesión de usuario para verificar. Por favor, reinicia el proceso.';
    echo json_encode($response);
    exit;
}

$user_id = $_SESSION['user_id_to_verify'];
$code_from_user = $_POST['verification_code'] ?? '';

if (empty($code_from_user)) {
    $response['message'] = 'Por favor, introduce el código de verificación.';
    echo json_encode($response);
    exit;
}

try {
    // 2. BUSCAR EL CÓDIGO EN LA BASE DE DATOS
    $stmt = $pdo->prepare(
        "SELECT * FROM verification_codes WHERE user_id = :user_id AND code = :code ORDER BY expires_at DESC LIMIT 1"
    );
    $stmt->execute(['user_id' => $user_id, 'code' => $code_from_user]);
    $verification_data = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$verification_data) {
        $response['message'] = 'El código de verificación es incorrecto.';
        echo json_encode($response);
        exit;
    }

    // 3. VERIFICAR SI EL CÓDIGO HA EXPIRADO
    $current_time = new DateTime();
    $expiration_time = new DateTime($verification_data['expires_at']);

    if ($current_time > $expiration_time) {
        $response['message'] = 'El código de verificación ha expirado. Por favor, solicita uno nuevo.';
        echo json_encode($response);
        exit;
    }

    // 4. SI TODO ES CORRECTO, ACTUALIZAR AL USUARIO COMO VERIFICADO
    $stmt = $pdo->prepare("UPDATE users SET is_verified = TRUE WHERE id = :user_id");
    $stmt->execute(['user_id' => $user_id]);

    // 5. ELIMINAR EL CÓDIGO USADO DE LA BASE DE DATOS (BUENA PRÁCTICA)
    $stmt = $pdo->prepare("DELETE FROM verification_codes WHERE id = :id");
    $stmt->execute(['id' => $verification_data['id']]);
    
    // 6. LIMPIAR LA SESIÓN Y RESPONDER CON ÉXITO
    unset($_SESSION['user_id_to_verify']);
    $response['success'] = true;
    $response['message'] = '¡Cuenta verificada con éxito!';

} catch (PDOException $e) {
    $response['message'] = 'Error del servidor durante la verificación: ' . $e->getMessage();
}

echo json_encode($response);
?>