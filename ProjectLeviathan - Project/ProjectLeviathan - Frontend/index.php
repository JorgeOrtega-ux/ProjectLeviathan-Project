<?php
session_start();
require_once 'config/config.php';

// Proteger la página: si el usuario no ha iniciado sesión, redirigirlo a la página de login
if (!isset($_SESSION['user_id'])) {
    $login_path = str_replace('ProjectLeviathan - Frontend', 'ProjectLeviathan - Backend/', getBaseUrl());
    header('Location: ' . $login_path);
    exit;
}

// --- Actualizar rol, estado y generar token CSRF ---
require_once __DIR__ . '/../ProjectLeviathan - Backend/config/db_config.php';

try {
    $stmt = $pdo->prepare("SELECT role, status FROM users WHERE id = :user_id");
    $stmt->execute(['user_id' => $_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Si el estado no es 'active', destruir la sesión y redirigir
        if ($user['status'] !== 'active') {
            session_unset();
            session_destroy();
            $login_path = str_replace('ProjectLeviathan - Frontend', 'ProjectLeviathan - Backend/', getBaseUrl());
            header('Location: ' . $login_path);
            exit;
        }

        // Si todo está bien, actualizar el rol en la sesión
        if (isset($user['role'])) {
            $_SESSION['role'] = $user['role'];
        }

    } else {
        // Si el usuario no se encuentra en la BD (p. ej., fue eliminado), destruir sesión
        session_unset();
        session_destroy();
        $login_path = str_replace('ProjectLeviathan - Frontend', 'ProjectLeviathan - Backend/', getBaseUrl());
        header('Location: ' . $login_path);
        exit;
    }

} catch (PDOException $e) {
    // En caso de error de DB, se podría mantener la sesión o cerrarla por seguridad.
    // Por ahora, se mantiene en silencio para no afectar la experiencia si es un fallo temporal.
}


if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

require_once 'config/router.php';
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" type="text/css" href="<?php echo $BASE_URL; ?>/assets/css/styles.css">
    <link rel="stylesheet" type="text/css" href="<?php echo $BASE_URL; ?>/assets/css/settings.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded" />
    <?php require_once 'config/dinamic-titles.php'; ?>
    <title><?php echo $pageTitle; ?></title>
    <meta name="description" content="ProjectLeviathan - Plataforma de comunidades">
    <link rel="canonical" href="<?php echo $BASE_URL . '/' . $CURRENT_PATH; ?>">

    <script>
        window.PROJECT_CONFIG = {
            baseUrl: '<?php echo $BASE_URL; ?>',
            currentSection: '<?php echo $CURRENT_SECTION; ?>',
            currentSubsection: <?php echo $CURRENT_SUBSECTION ? '"' . $CURRENT_SUBSECTION . '"' : 'null'; ?>,
            currentPath: '<?php echo $CURRENT_PATH; ?>',
            routes: <?php echo json_encode(Router::getAllRoutes()); ?>,
            csrfToken: '<?php echo $_SESSION['csrf_token']; ?>',
            apiUrl: '<?php echo str_replace('ProjectLeviathan - Frontend', 'ProjectLeviathan - Backend/api/api_handler.php', getBaseUrl()); ?>'
        };
    </script>
</head>

<body>
    <div class="page-wrapper">
        <div class="main-content">
            <div class="general-content">
                <div class="general-content-top">
                    <?php include 'includes/layouts/header.php'; ?>
                </div>
                <div class="general-content-bottom">
                    <div class="general-content-scrolleable">
                        <?php include 'includes/modules/module-surface.php'; ?>
                        <?php include 'includes/sections/general-sections.php'; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="module-content module-dialog disabled" data-module="updatePasswordModal">
        <div class="dialog-content">
            <div class="dialog-pane active" data-pane="confirmPassword">
                <button class="dialog-close" data-action="closeUpdatePasswordModal"><span class="material-symbols-rounded">close</span></button>
                <div class="dialog-header">
                    <h2>Confirma tu contraseña actual</h2>
                    <p>Antes de actualizar la configuración de tu cuenta, confirma tu contraseña.</p>
                </div>
                <div class="dialog-body">
                    <div class="input-group">
                        <label for="current-password">Contraseña</label>
                        <input type="password" id="current-password" class="edit-input" placeholder="Escribe tu contraseña">
                    </div>
                    <div class="dialog-error-message" style="color: #d93025; font-size: 0.9rem; margin-top: 12px; display: none;"></div>
                </div>
                <div class="dialog-actions">
                    <button class="cancel-button" data-action="closeUpdatePasswordModal">Cancelar</button>
                    <button class="save-button" data-action="confirmCurrentPassword">Confirmar</button>
                </div>
            </div>

            <div class="dialog-pane disabled" data-pane="setNewPassword">
                <button class="dialog-close" data-action="closeUpdatePasswordModal"><span class="material-symbols-rounded">close</span></button>
                <div class="dialog-header">
                    <h2>Establece tu nueva contraseña</h2>
                    <p>Asegúrate de que tu nueva contraseña sea segura y fácil de recordar.</p>
                </div>
                <div class="dialog-body">
                    <div class="input-group">
                        <label for="new-password">Nueva contraseña</label>
                        <input type="password" id="new-password" class="edit-input" placeholder="Nueva contraseña">
                    </div>
                    <div class="input-group">
                        <label for="confirm-password">Confirmar nueva contraseña</label>
                        <input type="password" id="confirm-password" class="edit-input" placeholder="Confirmar nueva contraseña">
                    </div>
                     <div class="dialog-error-message" style="color: #d93025; font-size: 0.9rem; margin-top: 12px; display: none;"></div>
                </div>
                <div class="dialog-actions">
                    <button class="cancel-button" data-action="closeUpdatePasswordModal">Cancelar</button>
                    <button class="save-button" data-action="saveNewPassword">Guardar cambios</button>
                </div>
            </div>
        </div>
    </div>

    <div class="module-content module-dialog disabled" data-module="deleteAccountModal">
        <div class="dialog-content">
            <div class="dialog-pane active" data-pane="confirmDelete">
                <button class="dialog-close" data-action="closeDeleteAccountModal"><span class="material-symbols-rounded">close</span></button>
                <div class="dialog-header">
                    <h2>Eliminar tu cuenta</h2>
                    <p>Esta acción es permanente. Para confirmar, por favor ingresa tu contraseña.</p>
                </div>
                <div class="dialog-body">
                    <div class="input-group">
                        <label for="delete-confirm-password">Contraseña</label>
                        <input type="password" id="delete-confirm-password" class="edit-input" placeholder="Escribe tu contraseña para confirmar">
                    </div>
                    <div class="dialog-error-message" style="color: #d93025; font-size: 0.9rem; margin-top: 12px; display: none;"></div>
                </div>
                <div class="dialog-actions">
                    <button class="cancel-button" data-action="closeDeleteAccountModal">Cancelar</button>
                    <button class="save-button" data-action="confirmDeleteAccount" style="background-color: #d93025; border-color: #d93025;">Eliminar cuenta</button>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://unpkg.com/@popperjs/core@2/dist/umd/popper.min.js"></script>
    <script type="module" src="<?php echo $BASE_URL; ?>/assets/js/app-init.js"></script>
</body>

</html>