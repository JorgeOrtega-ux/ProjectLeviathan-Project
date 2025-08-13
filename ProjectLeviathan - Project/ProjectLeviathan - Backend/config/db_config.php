<?php
// db_config.php - Archivo de configuración de la base de datos

// --- DEFINIR CREDENCIALES ---
define('DB_HOST', 'localhost');    // Tu servidor de base de datos (usualmente localhost)
define('DB_USER', 'root');         // Tu usuario de la base de datos
define('DB_PASS', '');             // La contraseña para ese usuario
define('DB_NAME', 'project_db');   // El nombre de tu base de datos

// --- CREAR LA CONEXIÓN ---
try {
    // Usamos PDO para una conexión más segura y versátil
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS);

    // Configurar PDO para que reporte errores de SQL
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Evitar emulación de sentencias preparadas para mayor seguridad
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

} catch (PDOException $e) {
    // Si la conexión falla, se detiene la ejecución y se muestra un error.
    // En un entorno de producción, deberías registrar este error en lugar de mostrarlo.
    die("ERROR: No se pudo conectar a la base de datos. " . $e->getMessage());
}
?>