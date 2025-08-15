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
        $requestUri = urldecode($_SERVER['REQUEST_URI']);
        
        $scriptName = $_SERVER['SCRIPT_NAME'];
        
        $basePath = dirname($scriptName);
        if ($basePath !== '/') {
            $requestUri = substr($requestUri, strlen($basePath));
        }
        
        $path = trim(parse_url($requestUri, PHP_URL_PATH), '/');
        
        return $path;
    }

    public static function getRouteConfig($path = null) {
        if ($path === null) {
            $path = self::getCurrentRoute();
        }
        
        if (array_key_exists($path, self::$routes)) {
            return self::$routes[$path];
        }
        
        return null;
    }

    public static function isValidRoute($path) {
        return array_key_exists($path, self::$routes);
    }

    public static function getAllRoutes() {
        return self::$routes;
    }
}

$currentPath = Router::getCurrentRoute();
$routeConfig = Router::getRouteConfig($currentPath);

if ($routeConfig === null) {
    $routeConfig = ['section' => '404', 'subsection' => null];
    http_response_code(404);
}

$CURRENT_SECTION = $routeConfig['section'];
$CURRENT_SUBSECTION = $routeConfig['subsection'];
$CURRENT_PATH = $currentPath;
?>