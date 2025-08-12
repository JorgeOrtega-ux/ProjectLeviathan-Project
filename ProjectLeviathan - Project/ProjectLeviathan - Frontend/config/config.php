<?php
// Función helper para generar URLs base
function getBaseUrl() {
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
    $host = $_SERVER['HTTP_HOST'];
    $scriptName = $_SERVER['SCRIPT_NAME'];
    $basePath = dirname($scriptName);
    
    return $protocol . $host . ($basePath !== '/' ? $basePath : '');
}

$BASE_URL = getBaseUrl();
?>