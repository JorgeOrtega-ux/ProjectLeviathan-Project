<?php
// validate_profile.php - Verifica si el username o teléfono ya están en uso.

header('Content-Type: application/json');
require_once 'db_config.php';

$response = ['is_in_use' => false, 'field' => ''];

$username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_STRING);
$phone_number = filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_NUMBER_INT);
$country_code = filter_input(INPUT_POST, 'country_code', FILTER_SANITIZE_STRING);
$full_phone = $country_code . $phone_number;

if (empty($username) || empty($phone_number)) {
    echo json_encode($response);
    exit;
}

try {
    // Usamos una sola consulta para eficiencia
    $stmt = $pdo->prepare("SELECT username, phone_number FROM users WHERE username = :username OR phone_number = :phone_number");
    $stmt->execute(['username' => $username, 'phone_number' => $full_phone]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        $response['is_in_use'] = true;
        // Determinamos qué campo causó el conflicto
        if ($result['username'] === $username) {
            $response['field'] = 'username';
        } else {
            $response['field'] = 'phone';
        }
    }
} catch (PDOException $e) {
    // Manejo de errores
}

echo json_encode($response);
?>