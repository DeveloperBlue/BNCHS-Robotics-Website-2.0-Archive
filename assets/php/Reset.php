<?php

// Reset Password

require 'db.php';
session_start();

if (isset($_GET['osis']) && !empty($_GET['osis']) AND isset($_GET['key']) && !empty($_GET['key'])){

	$osis = $mysqli->escape_string($_GET['osis']);
	$hash = $mysqli->escape_string($_GET['hash']);

	// Select user with matching email who hasn't activated their account yet
	$result = $mysqli->query("SELECT * FROM users WHERE osis='$osis' AND activation_key='$key'");

	if ($results->num_rows == 0){

		$_SESSION['message'] = "You have entered an invalid URL for password reset.";
		header("location: error.php");

	} else {

		$_SESSION['message'] = "Your account has been activated!";

		// Set the user active status to 1.
		$mysqli->query("UPDATE users SET active='1' WHERE osis='$osis'") or die($mysqli->error);
		$_SESSION['active'] = 1;

		header("location: success.php");
	}

} else {
	$_SESSION['message'] = "Sorry, verification failed. Try again.";
	header("location: error.php");
}

?>