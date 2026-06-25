<?php
// delete.php
require_once __DIR__ . '/includes/auth.php';
$pdo = require_once __DIR__ . '/config/db.php';

requireLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.php');
    exit;
}

$id = $_POST['id'] ?? null;
if ($id === null || !ctype_digit((string)$id)) {
    header('Location: index.php');
    exit;
}

$postId = (int)$id;
$userId = $_SESSION['user_id'];

try {
    $stmt = $pdo->prepare('DELETE FROM blogPost WHERE id = ? AND user_id = ?');
    $stmt->execute([$postId, $userId]);
} catch (PDOException $e) {
    // Optionally log the error in a real app
}

header('Location: index.php');
exit;
