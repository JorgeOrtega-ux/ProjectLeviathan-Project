<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../db_config.php'; //

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

if ($action === 'login') {
    $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
    $password = $_POST['password'] ?? '';

    if (!$email || empty($password)) {
        $response['message'] = 'Por favor, completa todos los campos.';
    } else {
        try {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");
            $stmt->execute(['email' => $email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && password_verify($password, $user['password'])) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $response['success'] = true;
                $response['message'] = 'Inicio de sesión exitoso.';
                $response['redirect_url'] = '../'; // Redirigir al frontend
            } else {
                $response['message'] = 'Correo o contraseña incorrectos.';
            }
        } catch (PDOException $e) {
            $response['message'] = 'Error del servidor. Inténtalo de nuevo más tarde.';
        }
    }
}

echo json_encode($response);
?>