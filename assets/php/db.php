<?php
// Database Connection Settings

$host = "localhost";
$username = "team5592_system";
$password = "databasekey5599";
$db = "team5592_database";

// Create connection
$mysqli = new mysqli($host, $username, $password, $db);

// Check connection
if ($mysqli->connect_error) {
	die("Connection failed: " . $mysqli->connect_error);
}

?>