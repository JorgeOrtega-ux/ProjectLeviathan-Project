<?php
class Router {
    private static $routes = [
        '' => ['section' => 'home', 'subsection' => null],
        'explore' => ['section' => 'explore', 'subsection' => null],
        'settings' => ['section' => 'settings', 'subsection' => 'profile'],
        'settings/your-account' => ['section' => 'settings', 'subsection' => 'profile'],
        'settings/login' => ['section' => 'settings', 'subsection' => 'login'],
        'settings/accessibility' => ['section' => 'settings', 'subsection' => 'accessibility'],
        'help' => ['section' => 'help', 'subsection' => 'privacy'],
        'help/privacy' => ['section' => 'help', 'subsection' => 'privacy'],
        'help/terms' => ['section' => 'help', 'subsection' => 'terms'],
        'help/cookies' => ['section' => 'help', 'subsection' => 'cookies'],
        'help/suggestions' => ['section' => 'help', 'subsection' => 'suggestions']
    ];

    public static function getCurrentRoute() {
        $requestUri = $_SERVER['REQUEST_URI'];
        $scriptName = $_SERVER['SCRIPT_NAME'];
        
        // Remover el directorio base del proyecto
        $basePath = dirname($scriptName);
        if ($basePath !== '/') {
            $requestUri = substr($requestUri, strlen($basePath));
        }
        
        // Remover slash inicial y query parameters
        $path = trim(parse_url($requestUri, PHP_URL_PATH), '/');
        
        return $path;
    }

    public static function getRouteConfig($path = null) {
        if ($path === null) {
            $path = self::getCurrentRoute();
        }
        
        // Verificar si la ruta existe
        if (array_key_exists($path, self::$routes)) {
            return self::$routes[$path];
        }
        
        return null; // Ruta no encontrada (404)
    }

    public static function isValidRoute($path) {
        return array_key_exists($path, self::$routes);
    }

    public static function getAllRoutes() {
        return self::$routes;
    }
}

// Obtener configuración de la ruta actual
$currentPath = Router::getCurrentRoute();
$routeConfig = Router::getRouteConfig($currentPath);

// Si la ruta no existe, mostrar 404
if ($routeConfig === null) {
    $routeConfig = ['section' => '404', 'subsection' => null];
    http_response_code(404);
}

// Variables globales para usar en las vistas
$CURRENT_SECTION = $routeConfig['section'];
$CURRENT_SUBSECTION = $routeConfig['subsection'];
$CURRENT_PATH = $currentPath;
?>