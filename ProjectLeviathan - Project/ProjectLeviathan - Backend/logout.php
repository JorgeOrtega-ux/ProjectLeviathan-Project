<?php
session_start(); // Inicia la sesión para poder acceder a ella.

// Destruye todas las variables de sesión.
$_SESSION = array();

// Si se desea destruir la sesión completamente, borra también la cookie de la sesión.
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Finalmente, destruye la sesión.
session_destroy();

// Define la ruta base para redirigir al directorio de login.
// Esto asume que logout.php está en la raíz de 'ProjectLeviathan - Backend'.
$login_path = './'; // Redirige a la página de login en la misma carpeta.

// Redirige al usuario a la página de inicio de sesión.
header("Location: " . $login_path);
exit;
?>