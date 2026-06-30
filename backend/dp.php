<?php
// Database connection using config
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Get database connection from config
$pdo = getDatabaseConnection();

?>
