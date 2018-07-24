<?php

// User login process. Checks if the user exists and the password is correct.

require 'db.php';
session_start();

// SQL Injection Protection

$username = $mysqli->escape_string($_POST['username']);
$result = $mysqli->query("SELECT * FROM users WHERE email='$username' OR osis='$username'");

if ($result->num_rows == 0){
	// User doesn't exist . . .
	echo '{"status": 400, "message":"An account with that OSIS/Email does not exist!"}';
	die();

} else {
	// User does exist . . .

	$user = $result->fetch_assoc();

	if (password_verify($_POST['password'], $user['password'])){

		$_SESSION['osis'] = $user['osis'];
		$_SESSION['first_name'] = $user['first_name'];
		$_SESSION['last_name'] = $user['last_name'];
		$_SESSION['active'] = $user['active'];

		$_SESSION['logged_in'] = true;

		echo '{"status": 200}';
		header("location: http://www.team5599.com/Account.html");
	} else {

		echo '{"status": 400, "message": "You have entered an incorrect password. Please try again."}';
		die();
		
	}

	mysqli_close($mysqli);
	exit();
}

?>