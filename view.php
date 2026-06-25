<?php
// view.php
require_once __DIR__ . '/includes/auth.php';
$pdo = require_once __DIR__ . '/config/db.php';

$id = $_GET['id'] ?? null;
if ($id === null || !ctype_digit((string)$id)) {
    $notFound = true;
    $post = null;
} else {
    try {
        $stmt = $pdo->prepare('SELECT blogPost.*, user.username FROM blogPost JOIN user ON blogPost.user_id = user.id WHERE blogPost.id = ? LIMIT 1');
        $stmt->execute([(int)$id]);
        $post = $stmt->fetch();
        $notFound = !$post;
    } catch (PDOException $e) {
        $notFound = true;
        $post = null;
    }
}
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title><?= isset($post['title']) ? htmlspecialchars($post['title']) : 'Post' ?></title>
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

    <main class="max-w-4xl mx-auto px-4 py-8">
        <?php if (!empty($notFound)): ?>
            <div class="bg-white p-6 rounded shadow text-center">
                <h2 class="text-xl font-semibold mb-4">Post not found</h2>
                <a href="index.php" class="text-indigo-600 hover:underline">Back to home</a>
            </div>
        <?php else: ?>
            <article class="bg-white p-8 rounded-lg shadow">
                <h1 class="text-3xl font-bold mb-2"><?= htmlspecialchars($post['title']) ?></h1>
                <div class="text-sm text-gray-500 mb-6">By <?= htmlspecialchars($post['username']) ?> · <?= htmlspecialchars(date('F j, Y, g:i A', strtotime($post['created_at']))) ?></div>

                <div class="prose max-w-none text-gray-800">
                    <?= nl2br(htmlspecialchars($post['content'])) ?>
                </div>

                <?php if (isLoggedIn() && isset($_SESSION['user_id']) && $_SESSION['user_id'] == $post['user_id']): ?>
                    <div class="mt-6 flex items-center space-x-3">
                        <a href="editor.php?id=<?= urlencode($post['id']) ?>" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Edit</a>

                        <form method="post" action="delete.php" onsubmit="return confirm('Are you sure you want to delete this post?');" class="inline">
                            <input type="hidden" name="id" value="<?= htmlspecialchars($post['id']) ?>">
                            <button type="submit" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete</button>
                        </form>
                    </div>
                <?php endif; ?>

                <div class="mt-6">
                    <a href="index.php" class="text-indigo-600 hover:underline">Back to home</a>
                </div>
            </article>
        <?php endif; ?>
    </main>
</body>
</html>
