<?php
// editor.php
require_once __DIR__ . '/includes/auth.php';
$pdo = require_once __DIR__ . '/config/db.php';

requireLogin();
$userId = $_SESSION['user_id'];

$errors = [];
$title = '';
$content = '';
$editing = false;
$postId = null;

// If editing, load the post and verify ownership
if (isset($_GET['id']) && ctype_digit((string)$_GET['id'])) {
    $postId = (int)$_GET['id'];
    try {
        $stmt = $pdo->prepare('SELECT * FROM blogPost WHERE id = ? LIMIT 1');
        $stmt->execute([$postId]);
        $post = $stmt->fetch();
        if (!$post) {
            header('Location: index.php');
            exit;
        }
        if ($post['user_id'] != $userId) {
            // Not the owner
            header('Location: index.php');
            exit;
        }
        $editing = true;
        $title = $post['title'];
        $content = $post['content'];
    } catch (PDOException $e) {
        $errors['general'] = 'Database error: ' . $e->getMessage();
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = trim($_POST['title'] ?? '');
    $content = $_POST['content'] ?? '';
    $postedId = isset($_POST['id']) && ctype_digit((string)$_POST['id']) ? (int)$_POST['id'] : null;

    if ($title === '') {
        $errors['title'] = 'Title is required.';
    }
    if ($content === '') {
        $errors['content'] = 'Content is required.';
    }

    if (empty($errors)) {
        try {
            if ($postedId) {
                // Update existing post; ensure user owns it
                $update = $pdo->prepare('UPDATE blogPost SET title = ?, content = ?, updated_at = NOW() WHERE id = ? AND user_id = ?');
                $update->execute([$title, $content, $postedId, $userId]);
                header('Location: view.php?id=' . urlencode($postedId));
                exit;
            } else {
                // Insert new post
                $insert = $pdo->prepare('INSERT INTO blogPost (user_id, title, content) VALUES (?, ?, ?)');
                $insert->execute([$userId, $title, $content]);
                header('Location: index.php');
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
    <title><?= $editing ? 'Edit Post' : 'New Post' ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://unpkg.com/easymde/dist/easymde.min.css">
</head>
<body class="bg-gray-100 min-h-screen">
    <nav class="bg-white shadow">
        <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="index.php" class="text-xl font-semibold text-gray-800">My Blog</a>
            <div class="space-x-4">
                <a href="logout.php" class="inline-block text-sm text-red-600 hover:underline">Logout</a>
            </div>
        </div>
    </nav>

    <main class="max-w-4xl mx-auto px-4 py-8">
        <div class="bg-white p-6 rounded-lg shadow">
            <h1 class="text-2xl font-semibold mb-4"><?= $editing ? 'Edit Post' : 'Create New Post' ?></h1>

            <?php if (!empty($errors['general'])): ?>
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
                    <?= htmlspecialchars($errors['general']) ?>
                </div>
            <?php endif; ?>

            <form method="post">
                <?php if ($editing && $postId): ?>
                    <input type="hidden" name="id" value="<?= htmlspecialchars($postId) ?>">
                <?php endif; ?>

                <div class="mb-4">
                    <label for="title" class="block text-sm font-medium mb-1">Title</label>
                    <input id="title" name="title" type="text" value="<?= htmlspecialchars($title) ?>" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <?php if (!empty($errors['title'])): ?>
                        <p class="text-red-600 text-sm mt-1"><?= htmlspecialchars($errors['title']) ?></p>
                    <?php endif; ?>
                </div>

                <div class="mb-4">
                    <label for="content" class="block text-sm font-medium mb-1">Content (Markdown supported)</label>
                    <textarea id="content" name="content" rows="10" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"><?= htmlspecialchars($content) ?></textarea>
                    <?php if (!empty($errors['content'])): ?>
                        <p class="text-red-600 text-sm mt-1"><?= htmlspecialchars($errors['content']) ?></p>
                    <?php endif; ?>
                </div>

                <div class="flex items-center space-x-3">
                    <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"><?= $editing ? 'Update' : 'Publish' ?></button>
                    <a href="index.php" class="text-gray-600 hover:underline">Cancel</a>
                </div>
            </form>
        </div>
    </main>

    <script src="https://unpkg.com/easymde/dist/easymde.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            var easyMDE = new EasyMDE({ element: document.getElementById('content'), spellChecker: false });
        });
    </script>
</body>
</html>
