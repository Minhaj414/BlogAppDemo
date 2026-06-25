<?php
// includes/auth.php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function isLoggedIn(): bool
{
    return isset($_SESSION['user_id']);
}

function requireLogin(): void
{
    if (!isLoggedIn()) {
        header('Location: login.php');
        exit;
    }
}

/**
 * Returns current user info as an associative array ['user_id' => ..., 'username' => ...]
 * or null if not logged in.
 */
function currentUser(): ?array
{
    if (!isLoggedIn()) {
        return null;
    }

    return [
        'user_id'  => $_SESSION['user_id'] ?? null,
        'username' => $_SESSION['username'] ?? null,
    ];
}
