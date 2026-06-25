<?php
// login.php
require_once __DIR__ . '/includes/auth.php';
$pdo = require_once __DIR__ . '/config/db.php';

// Redirect if already logged in
if (isLoggedIn()) {
    header('Location: index.php');
    exit;
}

$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($email === '' || $password === '') {
        $errors['general'] = 'Invalid email or password.';
    } else {
        try {
            $stmt = $pdo->prepare('SELECT id, username, password FROM `user` WHERE email = :email LIMIT 1');
            $stmt->execute([':email' => $email]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password'])) {
                // Successful login
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];

                header('Location: index.php');
                exit;
            } else {
                $errors['general'] = 'Invalid email or password.';
            }
        } catch (PDOException $e) {
            $errors['general'] = 'Database error: ' . $e->getMessage();
        }
    }
}

// Show success message if redirected from registration
$registered = isset($_GET['registered']) && $_GET['registered'] == '1';
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Login</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 class="text-2xl font-semibold mb-6 text-center">Sign in to your account</h1>

        <?php if ($registered): ?>
            <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded mb-4">
                Registration successful. Please log in.
            </div>
        <?php endif; ?>

        <?php if (!empty($errors['general'])): ?>
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
                <?= htmlspecialchars($errors['general']) ?>
            </div>
        <?php endif; ?>

        <form method="post" novalidate>
            <div class="mb-4">
                <label class="block text-sm font-medium mb-1" for="email">Email</label>
                <input id="email" name="email" type="email" value="<?= isset($_POST['email']) ? htmlspecialchars($_POST['email']) : '' ?>" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
            </div>

            <div class="mb-6">
                <label class="block text-sm font-medium mb-1" for="password">Password</label>
                <input id="password" name="password" type="password" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
            </div>

            <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Log in</button>
        </form>

        <p class="text-center text-sm text-gray-600 mt-4">Don't have an account? <a href="register.php" class="text-indigo-600 hover:underline">Register</a></p>
    </div>
</body>
</html>
