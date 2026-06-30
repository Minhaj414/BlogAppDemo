<?php
// Simple migration helper for local development.
// Run this once by visiting http://localhost/Assignment/backend/migrate.php
// It will create `user` and `blogPost` tables (if missing).
require_once __DIR__ . '/dp.php';
header('Content-Type: text/html; charset=utf-8');
echo "<h2>Migration</h2>";
try {
    // Ensure `user` table exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS `user` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `username` VARCHAR(100) NOT NULL UNIQUE,
        `email` VARCHAR(255) DEFAULT NULL,
        `password` VARCHAR(255) NOT NULL,
        `role` VARCHAR(50) DEFAULT 'user',
        `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "<p>Ensured `user` table exists</p>";

    // Ensure `blogPost` table exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS `blogPost` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `user_id` INT NULL,
        `title` VARCHAR(255) NOT NULL,
        `content` TEXT NOT NULL,
        `image` LONGTEXT NULL,
        `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        KEY `user_id_idx` (`user_id`),
        CONSTRAINT `blogpost_user_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "<p>Ensured `blogPost` table exists</p>";

    // Add image column if missing
    $stmt = $pdo->prepare("SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'blogPost' AND COLUMN_NAME = 'image'");
    $stmt->execute();
    $hasImage = $stmt->fetchColumn();
    if (!$hasImage) {
        $pdo->exec("ALTER TABLE blogPost ADD COLUMN image LONGTEXT NULL AFTER content;");
        echo "<p>Added column `blogPost.image`</p>";
    } else {
        echo "<p>`blogPost.image` already exists</p>";
    }

    echo "<p>Migration completed.</p>";
} catch (PDOException $e) {
    echo "<pre>Migration error: " . htmlspecialchars($e->getMessage()) . "</pre>";
}

echo '<p><a href="/Assignment/frontend/index.html">Open frontend</a></p>';

?>
