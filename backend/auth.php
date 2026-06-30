<?php
require_once __DIR__ . '/dp.php';
if (session_status() === PHP_SESSION_NONE) session_start();

// Allow preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    exit;
}

$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true);

if ($action === 'register' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    // Registration  requires username, email and password
    if (!$input || !isset($input['username']) || !isset($input['password']) || !isset($input['email'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing username, email or password']);
        exit;
    }
    $username = trim($input['username']);
    $email = trim($input['email']);
    $password = $input['password'];
    if ($username === '' || $password === '' || $email === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid username, email or password']);
        exit;
    }

    // Check if username or email exists in `user` table
    $stmt = $pdo->prepare('SELECT id FROM `user` WHERE username = ? OR email = ?');
    $stmt->execute([$username, $email]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'User with that username or email already exists']);
        exit;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $ins = $pdo->prepare('INSERT INTO `user` (username, email, password, role) VALUES (?, ?, ?, ?)');
    $ins->execute([$username, $email, $hash, 'user']);
    echo json_encode(['id' => $pdo->lastInsertId()]);
    exit;
}

if ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!$input || !isset($input['username']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing username or password']);
        exit;
    }
    $username = $input['username'];
    $password = $input['password'];

    $stmt = $pdo->prepare('SELECT id, password, username FROM `user` WHERE username = ? OR email = ?');
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        exit;
    }

    // Login success
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    echo json_encode(['id' => $user['id'], 'username' => $user['username']]);
    exit;
}

if ($action === 'logout' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    session_unset();
    session_destroy();
    echo json_encode(['logged_out' => true]);
    exit;
}

if ($action === 'me' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!empty($_SESSION['user_id'])) {
        echo json_encode(['id' => $_SESSION['user_id'], 'username' => $_SESSION['username']]);
    } else {
        echo json_encode(null);
    }
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Invalid action']);

?>