<?php
session_start();
header('Content-Type: application/json');

// Incluir configuración de la base de datos
require_once __DIR__ . '/../config/db_config.php';

// Validar el token CSRF para todas las peticiones POST
if (empty($_POST['csrf_token']) || empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
    echo json_encode(['success' => false, 'message' => 'Error de validación de seguridad.']);
    exit;
}

// Obtener la acción a realizar
$action = $_POST['action'] ?? '';

// --- ACCIÓN: ACTUALIZAR PERFIL (NOMBRE DE USUARIO O CORREO) ---
if ($action === 'update_profile') {
    $field = $_POST['field'] ?? '';
    $value = trim($_POST['value'] ?? '');
    $userId = $_SESSION['user_id'] ?? 0;

    if (empty($field) || empty($value) || empty($userId)) {
        echo json_encode(['success' => false, 'message' => 'Faltan datos para realizar la actualización.']);
        exit;
    }

    $response = ['success' => false];
    $update_column_name = "last_{$field}_update";

    try {
        // 1. Verificar el límite de tiempo para el cambio (30 días)
        $stmt_time = $pdo->prepare("SELECT $update_column_name FROM users WHERE id = :user_id");
        $stmt_time->execute(['user_id' => $userId]);
        $user_data = $stmt_time->fetch(PDO::FETCH_ASSOC);
        $last_update = $user_data[$update_column_name];

        if ($last_update !== null) {
            $last_update_time = new DateTime($last_update);
            $current_time = new DateTime();
            $interval = $current_time->diff($last_update_time);
            
            if ($interval->days < 30) {
                $days_left = 30 - $interval->days;
                $field_name = $field === 'username' ? 'nombre de usuario' : 'correo';
                $response['message'] = "Debes esperar " . $days_left . " día(s) más para volver a cambiar tu " . $field_name . ".";
                echo json_encode($response);
                exit;
            }
        }

        // 2. Validación específica por campo
        if ($field === 'email') {
            if (!preg_match('/^[a-zA-Z0-9._-]+@(gmail\.com|outlook\.com)$/i', $value)) {
                $response['message'] = 'Solo se permiten correos de @gmail.com o @outlook.com.';
                echo json_encode($response);
                exit;
            }
            $stmt_check = $pdo->prepare("SELECT id FROM users WHERE email = :email AND id != :user_id");
            $stmt_check->execute(['email' => $value, 'user_id' => $userId]);
            if ($stmt_check->fetch()) {
                $response['message'] = 'Ese correo electrónico ya está registrado por otro usuario.';
                echo json_encode($response);
                exit;
            }
        } elseif ($field === 'username') {
            if (strlen($value) < 4 || strlen($value) > 25) {
                 $response['message'] = 'El nombre de usuario debe tener entre 4 y 25 caracteres.';
                echo json_encode($response);
                exit;
            }
            $stmt_check = $pdo->prepare("SELECT id FROM users WHERE username = :username AND id != :user_id");
            $stmt_check->execute(['username' => $value, 'user_id' => $userId]);
            if ($stmt_check->fetch()) {
                $response['message'] = 'Ese nombre de usuario ya está en uso.';
                echo json_encode($response);
                exit;
            }
        } else {
            $response['message'] = 'El campo a actualizar no es válido.';
            echo json_encode($response);
            exit;
        }

        // 3. Actualizar el campo y la fecha de actualización
        $stmt_update = $pdo->prepare("UPDATE users SET $field = :value, $update_column_name = NOW() WHERE id = :user_id");
        $stmt_update->execute(['value' => $value, 'user_id' => $userId]);

        if ($stmt_update->rowCount() > 0) {
            $_SESSION[$field] = $value;
            $response['success'] = true;
            $response['newValue'] = htmlspecialchars($value);
            $response['message'] = '¡Tu ' . ($field === 'username' ? 'nombre de usuario' : 'correo') . ' se ha actualizado correctamente!';
        } else {
            $response['message'] = 'No se realizaron cambios o el valor es el mismo.';
        }
    } catch (PDOException $e) {
        $response['message'] = 'Error del servidor al intentar actualizar los datos.';
        // error_log($e->getMessage());
    }
    echo json_encode($response);

// --- ACCIÓN: ACTUALIZAR CONTRASEÑA ---
} elseif ($action === 'update_password') {
    $current_password = $_POST['current_password'] ?? '';
    $new_password = $_POST['new_password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    $userId = $_SESSION['user_id'] ?? 0;

    $response = ['success' => false];

    try {
        // 1. Obtener datos del usuario
        $stmt_user = $pdo->prepare("SELECT password, last_password_update FROM users WHERE id = :user_id");
        $stmt_user->execute(['user_id' => $userId]);
        $user = $stmt_user->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            $response['message'] = 'No se encontró el usuario.';
            echo json_encode($response);
            exit;
        }

        // 2. Verificar la contraseña actual
        if (!password_verify($current_password, $user['password'])) {
            $response['message'] = 'La contraseña actual es incorrecta.';
            $response['field'] = 'current'; // Para identificar el campo con error
            echo json_encode($response);
            exit;
        }

        // Si no se proporciona una nueva contraseña, es solo una verificación.
        if (empty($new_password) && empty($confirm_password)) {
            $response['success'] = true;
            echo json_encode($response);
            exit;
        }
        
        // 3. Verificar el límite de tiempo para el cambio (24 horas)
        if ($user['last_password_update'] !== null) {
            $last_update_time = new DateTime($user['last_password_update']);
            $current_time = new DateTime();
            $interval_seconds = $current_time->getTimestamp() - $last_update_time->getTimestamp();

            if ($interval_seconds < 86400) { // 24 horas * 60 min * 60 seg
                $response['message'] = 'Solo puedes cambiar tu contraseña una vez cada 24 horas.';
                echo json_encode($response);
                exit;
            }
        }
        
        // 4. Validar la nueva contraseña
        if (password_verify($new_password, $user['password'])) {
            $response['message'] = 'La nueva contraseña no puede ser igual a la actual.';
            echo json_encode($response);
            exit;
        }

        if ($new_password !== $confirm_password) {
            $response['message'] = 'Las nuevas contraseñas no coinciden.';
            echo json_encode($response);
            exit;
        }

        if (strlen($new_password) < 8) {
            $response['message'] = 'La nueva contraseña debe tener al menos 8 caracteres.';
            echo json_encode($response);
            exit;
        }

        // 5. Hashear y actualizar la nueva contraseña y la fecha de actualización
        $hashed_password = password_hash($new_password, PASSWORD_BCRYPT);
        $stmt_update = $pdo->prepare("UPDATE users SET password = :password, last_password_update = NOW() WHERE id = :user_id");
        $stmt_update->execute(['password' => $hashed_password, 'user_id' => $userId]);

        $response['success'] = true;
        $response['message'] = '¡Tu contraseña ha sido actualizada con éxito!';

    } catch (PDOException $e) {
        $response['message'] = 'Error del servidor al intentar actualizar la contraseña.';
        // error_log($e->getMessage());
    }

    echo json_encode($response);

// --- ACCIÓN: ELIMINAR CUENTA ---
} elseif ($action === 'delete_account') {
    $password = $_POST['password'] ?? '';
    $userId = $_SESSION['user_id'] ?? 0;
    
    $response = ['success' => false];

    if (empty($password) || empty($userId)) {
        $response['message'] = 'Se requiere contraseña para eliminar la cuenta.';
        echo json_encode($response);
        exit;
    }

    try {
        // 1. Obtener la contraseña actual del usuario
        $stmt_user = $pdo->prepare("SELECT password FROM users WHERE id = :user_id");
        $stmt_user->execute(['user_id' => $userId]);
        $user = $stmt_user->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            $response['message'] = 'No se encontró el usuario.';
            echo json_encode($response);
            exit;
        }

        // 2. Verificar la contraseña
        if (password_verify($password, $user['password'])) {
            // Contraseña correcta, proceder a "eliminar"
            $stmt_delete = $pdo->prepare("UPDATE users SET status = 'deleted' WHERE id = :user_id");
            $stmt_delete->execute(['user_id' => $userId]);

            // 3. Destruir la sesión
            session_unset();
            session_destroy();
            
            $response['success'] = true;
            // Redirigir al directorio de login en la carpeta Backend
            $response['redirect_url'] = '../'; 

        } else {
            // Contraseña incorrecta
            $response['message'] = 'La contraseña es incorrecta.';
        }

    } catch (PDOException $e) {
        $response['message'] = 'Error del servidor al intentar eliminar la cuenta.';
        // error_log($e->getMessage());
    }
    
    echo json_encode($response);

} else {
    echo json_encode(['success' => false, 'message' => 'Acción no reconocida.']);
}
?>