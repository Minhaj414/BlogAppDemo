<?php
// register.php
require_once __DIR__ . '/includes/auth.php';
$pdo = require_once __DIR__ . '/config/db.php';

// Redirect if already logged in
if (isLoggedIn()) {
    header('Location: index.php');
    exit;
}

$errors = [];
$old = ['username' => '', 'email' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    $old['username'] = $username;
    $old['email'] = $email;

    // Basic validation
    if ($username === '') {
        $errors['username'] = 'Username is required.';
    }
    if ($email === '') {
        $errors['email'] = 'Email is required.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Invalid email address.';
    }
    if ($password === '') {
        $errors['password'] = 'Password is required.';
    }

    if (empty($errors)) {
        try {
            // Check username
            $stmt = $pdo->prepare('SELECT id FROM `user` WHERE username = :username LIMIT 1');
            $stmt->execute([':username' => $username]);
            if ($stmt->fetch()) {
                $errors['username'] = 'Username is already taken.';
            }

            // Check email
            $stmt = $pdo->prepare('SELECT id FROM `user` WHERE email = :email LIMIT 1');
            $stmt->execute([':email' => $email]);
            if ($stmt->fetch()) {
                $errors['email'] = 'An account with this email already exists.';
            }

            if (empty($errors)) {
                $passwordHash = password_hash($password, PASSWORD_BCRYPT);

                $insert = $pdo->prepare('INSERT INTO `user` (username, email, password) VALUES (:username, :email, :password)');
                $insert->execute([
                    ':username' => $username,
                    ':email' => $email,
                    ':password' => $passwordHash,
                ]);

                // Redirect to login with success flag
                header('Location: login.php?registered=1');
                exit;
            }
        } catch (PDOException $e) {
            $errors['general'] = 'Database error: ' . $e->getMessage();
        }
    }
}
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Register</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 class="text-2xl font-semibold mb-6 text-center">Create an account</h1>

        <?php if (!empty($errors['general'])): ?>
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
                <?= htmlspecialchars($errors['general']) ?>
            </div>
        <?php endif; ?>

        <form method="post" novalidate>
            <div class="mb-4">
                <label class="block text-sm font-medium mb-1" for="username">Username</label>
                <input id="username" name="username" type="text" value="<?= htmlspecialchars($old['username']) ?>" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                <?php if (!empty($errors['username'])): ?>
                    <p class="text-red-600 text-sm mt-1"><?= htmlspecialchars($errors['username']) ?></p>
                <?php endif; ?>
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium mb-1" for="email">Email</label>
                <input id="email" name="email" type="email" value="<?= htmlspecialchars($old['email']) ?>" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                <?php if (!empty($errors['email'])): ?>
                    <p class="text-red-600 text-sm mt-1"><?= htmlspecialchars($errors['email']) ?></p>
                <?php endif; ?>
            </div>

            <div class="mb-6">
                <label class="block text-sm font-medium mb-1" for="password">Password</label>
                <input id="password" name="password" type="password" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                <?php if (!empty($errors['password'])): ?>
                    <p class="text-red-600 text-sm mt-1"><?= htmlspecialchars($errors['password']) ?></p>
                <?php endif; ?>
            </div>

            <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Register</button>
        </form>

        <p class="text-center text-sm text-gray-600 mt-4">Already have an account? <a href="login.php" class="text-indigo-600 hover:underline">Log in</a></p>
    </div>
</body>
</html>
