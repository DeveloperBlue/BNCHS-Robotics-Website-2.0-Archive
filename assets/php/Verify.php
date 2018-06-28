<?php

// Verifies registered user email, the link to this page is included in the register.php email message.

require 'db.php';
session_start();

if (isset($_GET['osis']) && !empty($_GET['osis']) AND isset($_GET['key']) && !empty($_GET['key'])){

	$osis = $mysqli->escape_string($_GET['osis']);
	$hash = $mysqli->escape_string($_GET['hash']);

	// Select user with matching email who hasn't activated their account yet
	$result = $mysqli->query("SELECT * FROM users WHERE osis='$osis' AND activation_key='$key' AND active='0'");

	if ($results->num_rows == 0){

		$_SESSION['message'] = "The account has already been activated, or the URL is invalid.";
		header("location: error.php");

	} else {

		$_SESSION['message'] = "Your account has been activated!";

		// Set the user active status to 1.
		$mysqli->query("UPDATE users SET active='1' WHERE osis='$osis'") or die($mysqli->error);
		$_SESSION['active'] = 1;

		header("location: success.php");
	}

} else {
	$_SESSION['message'] = "Invalid parameters provided for account verification. Contact webmaster@team5599.com immediately.";
	header("location: error.php");
}

?>