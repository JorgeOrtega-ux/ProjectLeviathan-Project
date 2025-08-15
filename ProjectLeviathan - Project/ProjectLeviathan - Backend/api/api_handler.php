<?php
session_start();
header('Content-Type: application/json');

// Incluir configuración de la base de datos
require_once __DIR__ . '/../config/db_config.php';

// Validar el token CSRF para todas las peticiones POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && (empty($_POST['csrf_token']) || empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token']))) {
    echo json_encode(['success' => false, 'message' => 'Error de validación de seguridad.']);
    exit;
}

// Obtener la acción a realizar
$action = $_POST['action'] ?? $_GET['action'] ?? '';

// --- ACCIÓN: ACTUALIZAR UNA PREFERENCIA DE USUARIO ---
if ($action === 'update_preference') {
    $userId = $_SESSION['user_id'] ?? 0;
    if (empty($userId)) {
        echo json_encode(['success' => false, 'message' => 'Usuario no autenticado.']);
        exit;
    }

    $field = $_POST['field'] ?? '';
    $value = $_POST['value'] ?? '';

    // Lista de campos permitidos para actualizar en user_preferences
    $allowed_fields = ['language', 'usage_type', 'open_links_in_new_tab', 'show_sensitive_content', 'theme', 'shortcuts_need_modifier', 'high_contrast_colors'];
    
    if (empty($field) || !in_array($field, $allowed_fields) || $value === '') {
        echo json_encode(['success' => false, 'message' => 'Datos inválidos para la actualización.']);
        exit;
    }

    // Convertir 'true'/'false' strings a booleanos para los campos correspondientes
    if (in_array($field, ['open_links_in_new_tab', 'show_sensitive_content', 'shortcuts_need_modifier', 'high_contrast_colors'])) {
        $value = filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    // Validación específica para cada campo (puedes añadir más)
    if ($field === 'language' && !in_array($value, ['es-MX', 'en-US'])) {
        echo json_encode(['success' => false, 'message' => 'Idioma no soportado.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("UPDATE user_preferences SET `$field` = :value WHERE user_id = :user_id");
        $stmt->execute(['value' => $value, 'user_id' => $userId]);

        // --- INICIO DE LA MODIFICACIÓN ---
        // ACTUALIZAR LA SESIÓN EN TIEMPO REAL
        if ($stmt->rowCount() > 0 && isset($_SESSION['user_preferences'])) {
            $_SESSION['user_preferences'][$field] = $value;
        }
        // --- FIN DE LA MODIFICACIÓN ---

        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Preferencia actualizada con éxito.']);
        } else {
            // Esto puede ocurrir si el valor no cambió o no se encontró el usuario
            echo json_encode(['success' => true, 'message' => 'No se realizaron cambios.']);
        }
    } catch (PDOException $e) {
        error_log("API Error (update_preference): " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Error del servidor al actualizar la preferencia.']);
    }
    exit;
}


// --- ACCIÓN: OBTENER FECHAS DE LA CUENTA ---
if ($action === 'get_account_dates') {
    // ... (Esta sección no necesita cambios)
    $userId = $_SESSION['user_id'] ?? 0;
    if (empty($userId)) {
        echo json_encode(['success' => false, 'message' => 'Usuario no autenticado.']);
        exit;
    }
    $response = ['success' => false];
    try {
        setlocale(LC_TIME, 'es_ES.UTF-8', 'Spanish_Spain', 'Spanish');
        $stmt_creation = $pdo->prepare("SELECT created_at FROM users WHERE id = :user_id");
        $stmt_creation->execute(['user_id' => $userId]);
        $creation_date = $stmt_creation->fetchColumn();
        $stmt_pass_update = $pdo->prepare(
            "SELECT updated_at FROM user_update_history 
             WHERE user_id = :user_id AND field_changed = 'password' 
             ORDER BY updated_at DESC LIMIT 1"
        );
        $stmt_pass_update->execute(['user_id' => $userId]);
        $last_password_update = $stmt_pass_update->fetchColumn();
        $response['success'] = true;
        $response['creation_date'] = $creation_date ? strftime('%e de %B de %Y a las %I:%M %p', strtotime($creation_date)) : 'No disponible';
        $response['last_password_update'] = $last_password_update ? 'Última actualización: ' . strftime('%e de %B de %Y a las %I:%M %p', strtotime($last_password_update)) : 'Aún no has actualizado tu contraseña.';
    } catch (PDOException $e) {
        error_log("API Error (get_account_dates): " . $e->getMessage());
        $response['message'] = 'Error del servidor.';
    }
    echo json_encode($response);
    exit;
}

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
        // *** INICIO DE LA CORRECCIÓN ***
        // 1. Obtener el valor antiguo ANTES de cualquier otra validación.
        $stmt_old_query = "";
        if ($field === 'username') {
            $stmt_old_query = "SELECT `username` FROM users WHERE id = :user_id";
        } elseif ($field === 'email') {
            $stmt_old_query = "SELECT `email` FROM users WHERE id = :user_id";
        }
        
        $stmt_old = $pdo->prepare($stmt_old_query);
        $stmt_old->execute(['user_id' => $userId]);
        $old_value = $stmt_old->fetchColumn();

        // 2. Si el valor no ha cambiado, detener la ejecución y notificar.
        if ($old_value === $value) {
            echo json_encode([
                'success' => true,
                'newValue' => htmlspecialchars($value),
                'message' => 'No se realizaron cambios.'
            ]);
            exit;
        }

        // 3. AHORA SÍ: Verificar el límite de tiempo, ya que sabemos que es un cambio real.
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
            $interval_seconds = $current_time->getTimestamp() - $last_update_time->getTimestamp();
            $limit_seconds = 30 * 24 * 60 * 60; // 30 días

            if ($interval_seconds < $limit_seconds) {
                $days_left = ceil(($limit_seconds - $interval_seconds) / (24 * 60 * 60));
                $field_name = $field === 'username' ? 'nombre de usuario' : 'correo';
                $response['message'] = "Debes esperar " . $days_left . " día(s) más para volver a cambiar tu " . $field_name . ".";
                echo json_encode($response);
                exit;
            }
        }
        
        // 4. Validación específica por campo
        if ($field === 'email') {
            if (!filter_var($value, FILTER_VALIDATE_EMAIL) || !preg_match('/^[a-zA-Z0-9._-]+@(gmail\.com|outlook\.com)$/i', $value)) {
                $response['message'] = 'Solo se permiten correos válidos de @gmail.com o @outlook.com.';
                echo json_encode($response);
                exit;
            }
        } elseif ($field === 'username') {
            // === INICIO DE LA MODIFICACIÓN IMPORTANTE ===
            // Se añade la validación de caracteres permitidos.
            if (!preg_match('/^[a-zA-Z0-9_]{4,25}$/', $value)) {
                $response['message'] = 'El nombre de usuario debe tener entre 4 y 25 caracteres y solo puede contener letras, números y guiones bajos.';
                echo json_encode($response);
                exit;
            }
            // === FIN DE LA MODIFICACIÓN IMPORTANTE ===
        }

        // 5. Verificar si el nuevo valor ya está en uso por otro usuario
        $check_query = "";
        if ($field === 'username') {
            $check_query = "SELECT id FROM users WHERE `username` = :value AND id != :user_id";
        } elseif ($field === 'email') {
            $check_query = "SELECT id FROM users WHERE `email` = :value AND id != :user_id";
        }
        
        $stmt_check = $pdo->prepare($check_query);
        $stmt_check->execute(['value' => $value, 'user_id' => $userId]);
        if ($stmt_check->fetch()) {
            $response['message'] = 'Ese ' . ($field === 'username' ? 'nombre de usuario' : 'correo electrónico') . ' ya está en uso.';
            echo json_encode($response);
            exit;
        }

        // 6. Actualizar el campo en la tabla de usuarios y registrar en el historial
        $pdo->beginTransaction();
        
        $update_query = "";
        if ($field === 'username') {
            $update_query = "UPDATE users SET `username` = :value WHERE id = :user_id";
        } elseif ($field === 'email') {
            $update_query = "UPDATE users SET `email` = :value WHERE id = :user_id";
        } else {
            $pdo->rollBack();
            echo json_encode(['success' => false, 'message' => 'Operación no permitida.']);
            exit;
        }

        $stmt_update = $pdo->prepare($update_query);
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
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log("API Error (update_profile): " . $e->getMessage());
        $response['message'] = 'Error del servidor al intentar actualizar los datos.';
    }
    echo json_encode($response);

// --- ACCIÓN: ACTUALIZAR CONTRASEÑA ---
} elseif ($action === 'update_password') {
    // ... (Esta sección no necesita cambios)
    $current_password = $_POST['current_password'] ?? '';
    $new_password = $_POST['new_password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    $userId = $_SESSION['user_id'] ?? 0;
    $response = ['success' => false];
    try {
        $stmt_user = $pdo->prepare("SELECT password FROM users WHERE id = :user_id");
        $stmt_user->execute(['user_id' => $userId]);
        $user = $stmt_user->fetch(PDO::FETCH_ASSOC);
        if (!$user) {
            $response['message'] = 'No se encontró el usuario.';
            echo json_encode($response);
            exit;
        }
        if (!password_verify($current_password, $user['password'])) {
            $response['message'] = 'La contraseña actual es incorrecta.';
            echo json_encode($response);
            exit;
        }
        if (empty($new_password) && empty($confirm_password)) {
            $response['success'] = true;
            echo json_encode($response);
            exit;
        }
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
            if ($interval_seconds < 86400) { // 24 horas
                $response['message'] = 'Solo puedes cambiar tu contraseña una vez cada 24 horas.';
                echo json_encode($response);
                exit;
            }
        }
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
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log("API Error (update_password): " . $e->getMessage());
        $response['message'] = 'Error del servidor al intentar actualizar la contraseña.';
    }
    echo json_encode($response);

// --- ACCIÓN: ELIMINAR CUENTA ---
} elseif ($action === 'delete_account') {
    // ... (Esta sección no necesita cambios)
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
        error_log("API Error (delete_account): " . $e->getMessage());
        $response['message'] = 'Error del servidor al intentar eliminar la cuenta.';
    }
    echo json_encode($response);

} else {
    echo json_encode(['success' => false, 'message' => 'Acción no reconocida.']);
}
?>