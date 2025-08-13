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

    try {
        // 1. Verificar el límite de tiempo desde la nueva tabla de historial
        $stmt_time = $pdo->prepare(
            "SELECT updated_at FROM user_update_history 
             WHERE user_id = :user_id AND field_changed = :field 
             ORDER BY updated_at DESC LIMIT 1"
        );
        $stmt_time->execute(['user_id' => $userId, 'field' => $field]);
        $last_update_record = $stmt_time->fetch(PDO::FETCH_ASSOC);

        if ($last_update_record) {
            $last_update_time = new DateTime($last_update_record['updated_at']);
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
            if (!filter_var($value, FILTER_VALIDATE_EMAIL) || !preg_match('/^[a-zA-Z0-9._-]+@(gmail\.com|outlook\.com)$/i', $value)) {
                $response['message'] = 'Solo se permiten correos válidos de @gmail.com o @outlook.com.';
                echo json_encode($response);
                exit;
            }
        } elseif ($field === 'username') {
            if (strlen($value) < 4 || strlen($value) > 25) {
                $response['message'] = 'El nombre de usuario debe tener entre 4 y 25 caracteres.';
                echo json_encode($response);
                exit;
            }
        } else {
            $response['message'] = 'El campo a actualizar no es válido.';
            echo json_encode($response);
            exit;
        }

        // Verificar si el nuevo valor ya está en uso por otro usuario
        $stmt_check = $pdo->prepare("SELECT id FROM users WHERE $field = :value AND id != :user_id");
        $stmt_check->execute(['value' => $value, 'user_id' => $userId]);
        if ($stmt_check->fetch()) {
            $response['message'] = 'Ese ' . ($field === 'username' ? 'nombre de usuario' : 'correo electrónico') . ' ya está en uso.';
            echo json_encode($response);
            exit;
        }
        
        // Obtener el valor antiguo para el historial
        $stmt_old = $pdo->prepare("SELECT $field FROM users WHERE id = :user_id");
        $stmt_old->execute(['user_id' => $userId]);
        $old_value = $stmt_old->fetchColumn();

        // 3. Actualizar el campo en la tabla de usuarios y registrar en el historial
        $pdo->beginTransaction();
        
        $stmt_update = $pdo->prepare("UPDATE users SET $field = :value WHERE id = :user_id");
        $stmt_update->execute(['value' => $value, 'user_id' => $userId]);

        $stmt_history = $pdo->prepare(
            "INSERT INTO user_update_history (user_id, field_changed, old_value, new_value) 
             VALUES (:user_id, :field, :old_value, :new_value)"
        );
        $stmt_history->execute([
            'user_id' => $userId, 
            'field' => $field,
            'old_value' => $old_value,
            'new_value' => $value
        ]);

        $pdo->commit();

        $_SESSION[$field] = $value;
        $response['success'] = true;
        $response['newValue'] = htmlspecialchars($value);
        $response['message'] = '¡Tu ' . ($field === 'username' ? 'nombre de usuario' : 'correo') . ' se ha actualizado correctamente!';
        
    } catch (PDOException $e) {
        $pdo->rollBack();
        $response['message'] = 'Error del servidor al intentar actualizar los datos.';
        // error_log($e->getMessage()); // Descomentar para depuración en servidor
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
        $stmt_user = $pdo->prepare("SELECT password FROM users WHERE id = :user_id");
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
        $stmt_time = $pdo->prepare(
            "SELECT updated_at FROM user_update_history 
             WHERE user_id = :user_id AND field_changed = 'password' 
             ORDER BY updated_at DESC LIMIT 1"
        );
        $stmt_time->execute(['user_id' => $userId]);
        $last_update_record = $stmt_time->fetch(PDO::FETCH_ASSOC);

        if ($last_update_record) {
            $last_update_time = new DateTime($last_update_record['updated_at']);
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

        // 5. Hashear y actualizar la nueva contraseña y registrar en el historial
        $pdo->beginTransaction();
        
        $hashed_password = password_hash($new_password, PASSWORD_BCRYPT);
        $stmt_update = $pdo->prepare("UPDATE users SET password = :password WHERE id = :user_id");
        $stmt_update->execute(['password' => $hashed_password, 'user_id' => $userId]);

        $stmt_history = $pdo->prepare(
            "INSERT INTO user_update_history (user_id, field_changed) VALUES (:user_id, 'password')"
        );
        $stmt_history->execute(['user_id' => $userId]);

        $pdo->commit();

        $response['success'] = true;
        $response['message'] = '¡Tu contraseña ha sido actualizada con éxito!';

    } catch (PDOException $e) {
        $pdo->rollBack();
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
        $stmt_user = $pdo->prepare("SELECT password FROM users WHERE id = :user_id");
        $stmt_user->execute(['user_id' => $userId]);
        $user = $stmt_user->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            $response['message'] = 'No se encontró el usuario.';
            echo json_encode($response);
            exit;
        }

        if (password_verify($password, $user['password'])) {
            $stmt_delete = $pdo->prepare("UPDATE users SET status = 'deleted' WHERE id = :user_id");
            $stmt_delete->execute(['user_id' => $userId]);

            session_unset();
            session_destroy();
            
            $response['success'] = true;
            $response['redirect_url'] = '../'; 

        } else {
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