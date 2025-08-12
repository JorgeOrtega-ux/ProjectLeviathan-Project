<?php
// validate_email.php - Verifica si un email ya está en uso.

header('Content-Type: application/json');
require_once 'db_config.php';

$response = ['is_in_use' => false];
$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);

if (empty($email)) {
    echo json_encode($response);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute(['email' => $email]);
    
    if ($stmt->fetch()) {
        $response['is_in_use'] = true;
    }
} catch (PDOException $e) {
    // En caso de error, es más seguro asumir que podría estar en uso
    // o simplemente no validar en el cliente y dejarlo para el envío final.
    // Por simplicidad, no devolvemos error aquí.
}

echo json_encode($response);
?>