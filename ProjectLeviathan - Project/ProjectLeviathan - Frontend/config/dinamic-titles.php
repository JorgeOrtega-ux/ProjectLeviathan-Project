<?php
// Títulos dinámicos basados en la sección actual
$pageTitles = [
    'home' => 'Página Principal - ProjectLeviathan',
    'explore' => 'Explorar Comunidades - ProjectLeviathan',
    'settings' => 'Configuración - ProjectLeviathan',
    '404' => 'Página no encontrada - ProjectLeviathan'
];

$pageTitle = isset($pageTitles[$CURRENT_SECTION]) ? $pageTitles[$CURRENT_SECTION] : 'ProjectLeviathan';
