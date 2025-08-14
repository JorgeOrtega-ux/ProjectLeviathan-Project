<?php
session_start();
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    $login_path = str_replace('ProjectLeviathan - Frontend', 'ProjectLeviathan - Backend/', getBaseUrl());
    header('Location: ' . $login_path);
    exit;
}

require_once __DIR__ . '/../../ProjectLeviathan - Backend/config/db_config.php';

try {
    $stmt = $pdo->prepare("SELECT role, status FROM users WHERE id = :user_id");
    $stmt->execute(['user_id' => $_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        if ($user['status'] !== 'active') {
            $reason = urlencode($user['status']);
            $inactive_account_path = str_replace('ProjectLeviathan - Frontend', 'ProjectLeviathan - Backend/inactive-account.php?reason=' . $reason, getBaseUrl());

            session_unset();
            session_destroy();

            header('Location: ' . $inactive_account_path);
            exit;
        }

        if (isset($user['role'])) {
            $_SESSION['role'] = $user['role'];
        }
    } else {
        session_unset();
        session_destroy();
        $login_path = str_replace('ProjectLeviathan - Frontend', 'ProjectLeviathan - Backend/', getBaseUrl());
        header('Location: ' . $login_path);
        exit;
    }
} catch (PDOException $e) {
}

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

require_once 'router.php';
