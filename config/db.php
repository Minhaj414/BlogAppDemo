<?php
// config/db.php
// Connect to MySQL, create the blog database if needed, and ensure the schema exists.

$host = getenv('DB_HOST') ?: 'localhost';
$db   = getenv('DB_NAME') ?: 'blog_db';
$charset = 'utf8mb4';

// XAMPP defaults.
$db_user = getenv('DB_USER') ?: 'root';
$db_pass = getenv('DB_PASS') ?: '';

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $serverDsn = "mysql:host=$host;charset=$charset";
    $pdo = new PDO($serverDsn, $db_user, $db_pass, $options);

    $pdo->exec(
        "CREATE DATABASE IF NOT EXISTS `$db`
         CHARACTER SET $charset
         COLLATE utf8mb4_unicode_ci"
    );

    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=$charset", $db_user, $db_pass, $options);

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS `user` (
            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `username` VARCHAR(100) NOT NULL,
            `email` VARCHAR(255) NOT NULL,
            `password` VARCHAR(255) NOT NULL,
            `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `uniq_user_username` (`username`),
            UNIQUE KEY `uniq_user_email` (`email`)
        ) ENGINE=InnoDB DEFAULT CHARSET=$charset COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS `blogPost` (
            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `user_id` INT UNSIGNED NOT NULL,
            `title` VARCHAR(255) NOT NULL,
            `content` LONGTEXT NOT NULL,
            `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_blogPost_user_id` (`user_id`),
            CONSTRAINT `fk_blogPost_user`
                FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=$charset COLLATE=utf8mb4_unicode_ci"
    );
} catch (PDOException $e) {
    die('Database connection failed: ' . $e->getMessage());
}

return $pdo;
