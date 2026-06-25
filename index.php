<?php
// index.php
require_once __DIR__ . '/includes/auth.php';
$pdo = require_once __DIR__ . '/config/db.php';

$posts = [];
try {
    $sql = 'SELECT blogPost.*, user.username FROM blogPost JOIN user ON blogPost.user_id = user.id ORDER BY blogPost.created_at DESC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $posts = $stmt->fetchAll();
} catch (PDOException $e) {
    $error = 'Failed to load posts: ' . $e->getMessage();
}

function preview_text($content, $len = 150) {
    $plain = strip_tags($content);
    if (mb_strlen($plain) <= $len) return $plain;
    return mb_substr($plain, 0, $len) . '...';
}
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Blog Home</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen">
    <nav class="bg-white shadow">
        <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="index.php" class="text-xl font-semibold text-gray-800">My Blog</a>
            <div class="space-x-4">
                <?php if (isLoggedIn()): ?>
                    <a href="editor.php" class="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">New Blog</a>
                    <span class="text-gray-700">Hello, <?= htmlspecialchars($_SESSION['username'] ?? '') ?></span>
                    <a href="logout.php" class="inline-block text-sm text-red-600 hover:underline">Logout</a>
                <?php else: ?>
                    <a href="login.php" class="text-indigo-600 hover:underline">Login</a>
                    <a href="register.php" class="text-indigo-600 hover:underline">Register</a>
                <?php endif; ?>
            </div>
        </div>
    </nav>

    <main class="max-w-6xl mx-auto px-4 py-8">
        <?php if (!empty($error)): ?>
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-6">
                <?= htmlspecialchars($error) ?>
            </div>
        <?php endif; ?>

        <?php if (empty($posts)): ?>
            <div class="text-center text-gray-600">No posts yet.</div>
        <?php else: ?>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <?php foreach ($posts as $post): ?>
                    <article class="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
                        <a href="view.php?id=<?= urlencode($post['id']) ?>" class="text-xl font-semibold text-gray-800 hover:underline"><?= htmlspecialchars($post['title']) ?></a>
                        <div class="text-sm text-gray-500 mt-2">By <?= htmlspecialchars($post['username']) ?> · <?= htmlspecialchars(date('F j, Y, g:i A', strtotime($post['created_at']))) ?></div>
                        <p class="text-gray-700 mt-4"><?= htmlspecialchars(preview_text($post['content'], 150)) ?></p>
                        <div class="mt-4">
                            <a href="view.php?id=<?= urlencode($post['id']) ?>" class="text-indigo-600 hover:underline">Read more</a>
                        </div>
                    </article>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </main>
</body>
</html>
