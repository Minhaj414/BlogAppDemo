<?php
// db connection file is named dp.php in this project
require_once __DIR__ . '/dp.php';
// Use PHP sessions for authentication
if (session_status() === PHP_SESSION_NONE) session_start();

// Allow preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // GET /posts.php or /posts.php?id=1
    if (isset($_GET['id'])) {
        $stmt = $pdo->prepare('SELECT blogPost.*, `user`.username AS author FROM blogPost LEFT JOIN `user` ON blogPost.user_id = `user`.id WHERE blogPost.id = ?');
        $stmt->execute([$_GET['id']]);
        $post = $stmt->fetch();
        echo json_encode($post ?: null);
    } else {
        $stmt = $pdo->query('SELECT blogPost.*, `user`.username AS author FROM blogPost LEFT JOIN `user` ON blogPost.user_id = `user`.id ORDER BY blogPost.created_at DESC');
        $posts = $stmt->fetchAll();
        echo json_encode($posts);
    }
    exit;
}

// For methods that contain a body, parse JSON
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    // Only authenticated users may create posts
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        exit;
    }

    if (!$input || !isset($input['title']) || !isset($input['content'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing title or content']);
        exit;
    }
    
    $stmt = $pdo->prepare('INSERT INTO blogPost (title, content, user_id) VALUES (?, ?, ?)');
    $stmt->execute([$input['title'], $input['content'], $_SESSION['user_id']]);
    echo json_encode(['id' => $pdo->lastInsertId()]);
    exit;
}

if ($method === 'PUT') {
    if (!$input || !isset($input['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing id']);
        exit;
    }
    // Must be authenticated to update
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        exit;
    }

    // Check ownership
    $check = $pdo->prepare('SELECT user_id FROM blogPost WHERE id = ?');
    $check->execute([$input['id']]);
    $row = $check->fetch();
    if (!$row) { http_response_code(404); echo json_encode(['error' => 'Post not found']); exit; }
    if ($row['user_id'] != $_SESSION['user_id']) { http_response_code(403); echo json_encode(['error' => 'Forbidden']); exit; }

    $stmt = $pdo->prepare('UPDATE blogPost SET title = ?, content = ? WHERE id = ?');
    $stmt->execute([$input['title'] ?? '', $input['content'] ?? '', $input['id']]);
    echo json_encode(['updated' => true]);
    exit;
}

if ($method === 'DELETE') {
    // DELETE may send body or query param id
    $id = null;
    if (isset($_GET['id'])) $id = $_GET['id'];
    elseif ($input && isset($input['id'])) $id = $input['id'];
    else {
        // fallback: parse raw input for form-style body
        parse_str(file_get_contents('php://input'), $parsed);
        if (isset($parsed['id'])) $id = $parsed['id'];
    }

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing id']);
        exit;
    }

    // Must be authenticated to delete
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        exit;
    }

    // Check ownership
    $check = $pdo->prepare('SELECT user_id FROM blogPost WHERE id = ?');
    $check->execute([$id]);
    $row = $check->fetch();
    if (!$row) { http_response_code(404); echo json_encode(['error' => 'Post not found']); exit; }
    if ($row['user_id'] != $_SESSION['user_id']) { http_response_code(403); echo json_encode(['error' => 'Forbidden']); exit; }
    $stmt = $pdo->prepare('DELETE FROM blogPost WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['deleted' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
