<?php

require 'db.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] == "POST"){

	$username = $mysqli->escape_string($_POST['username']);
	$results = $mysqli->query("SELECT * FROM users WHERE osis='$username' OR email='$username'");

	if ($results->num_rows == 0){

		$_SESSION['message'] = "An account with that OSIS/email does not exist!";
		echo '{"status": 200, "message": "An account with that OSIS/email does not exist. Please try again."}';
		
		die();

	} else {

		$user = $results->fetch_assoc();

		$osis = $user['osis'];
		$email = $user['email'];
		$activation_key = $user['activation_key'];
		$first_name = $user['first_name'];

		// Store session

		$_SESSION['message'] = "Please check your email $email for a confirmation link to reset your password.";

		// Send confirmation email (Reset.php)

		$to = $email;
		$subject = "Password Reset - Cardozo Robotics - Team 5599 - The Sentinels";
		$message_body = '
		Hello '.$first_name.',

		You have request a password reset.

		Please click the following link to reset your password

		http://www.team5599/Forgot.html/Reset.php?osis=$'.$osis.'$key='.$activation_key;

		mail( $to, $subject, $message_body);
		header("location: success.php");
	}
}

?>