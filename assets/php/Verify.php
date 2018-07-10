<?php

// Verifies registered user email, the link to this page is included in the register.php email message.

require 'db.php';
session_start();

$request = $mysqli->escape_string($_POST["$request"]);

if ($request=="verify"){

	if (isset($_GET['osis']) && !empty($_GET['osis']) AND isset($_GET['key']) && !empty($_GET['key'])){

		$osis = $mysqli->escape_string($_GET['osis']);
		$hash = $mysqli->escape_string($_GET['key']);

		// Select user with matching email who hasn't activated their account yet
		$result = $mysqli->query("SELECT * FROM users WHERE osis='$osis'");

		if ($results->num_rows == 0){

			// Invalid OSIS
			echo "The account you are trying to activate does not exist. Invalid OSIS.";
			die();

		} else {

			$user = $result->fetch_assoc();

			if ($user['activation_key'] != '$key'){
				// Invalid Key
				echo "Invalid activation key. Please contact webmaster@team5599.com with your OSIS.";
				die();
			}

			// Set the user active status to 1.
			$mysqli->query("UPDATE users SET active='1' WHERE osis='$osis'") or die($mysqli->error);
			$_SESSION['active'] = 1;

			echo "success";
			// header("location: http://www.team5599.com/Account.html");
		}

	} else {
		echo "Invalid parameters provided for account verification. Contact webmaster@team5599.com immediately.";
		die();
	}

} else if ($request == "forgot"){

	$email = $mysqli->escape_string($_POST["email"]);
	$OSIS = $mysqli->escape_string($_POST["OSIS"]);

	$result = $mysqli->query("SELECT * FROM users WHERE osis='$OSIS' OR email='$email' LIMIT 1") or die($mysqli->error());
	$existing_user = mysqli_fetch_assoc($result);

	if ($existing_user){

		$activation_key = $mysqli->escape_string( md5 ( rand(0, 1000)));

		$mysqli->query("UPDATE users SET activation_key='$activation_key' WHERE osis='$OSIS' OR email='$email'") or die($mysqli->error);
		$_SESSION['active'] = 0;

		$to = $email;
		$subject = "Password Reset - Cardozo Robotics - Team 5599 - The Sentinels";
		$headers = "From: accounts@team5599.com";
		$message_body = '
		Hello '.$first_name.',

		You have requested a password reset for your account at www.team5599.com.

		Please click the following link to reset your password:

		http://www.team5599/Verify.html?request=reset&osis='.$OSIS.'&key='.$activation_key;

		mail( $to, $subject, $message_body, $headers);
		echo "success-".$email;


	} else {
		echo "Failed to find an account with that Student ID or email address. Please check the information you have entered.";
		die();
	}



} else if ($request == "reset"){

	if (isset($_GET['osis']) && !empty($_GET['osis']) AND isset($_GET['key']) && !empty($_GET['key'])){

		$osis = $mysqli->escape_string($_GET['osis']);
		$hash = $mysqli->escape_string($_GET['key']);

		// Select user with matching email who hasn't activated their account yet
		$result = $mysqli->query("SELECT * FROM users WHERE osis='$osis'");

		if ($results->num_rows == 0){

			// Invalid OSIS
			echo "The account you are trying to activate does not exist. Invalid OSIS.";
			die();

		} else {

			$password = $mysqli->escape_string($_POST["password"]);
			$password_re = $mysqli->escape_string($_POST["password-re"]);

			if ($password !== $password_re){
				echo "Password mismatch. Please check the passwords you have entered. '$password' '$password_re'";
				die();
			}

			$password = password_hash($password, PASSWORD_BCRYPT);

			$user = $result->fetch_assoc();

			if ($user['activation_key'] != '$key'){
				// Invalid Key
				echo "Invalid reset key. Please contact webmaster@team5599.com with your OSIS.";
				die();
			}

			// Set the user active status to 1.
			$mysqli->query("UPDATE users SET password='$password' WHERE osis='$osis' AND activation_key='$key'") or die($mysqli->error);
			$_SESSION['active'] = 1;

			echo "success";
			// header("location: http://www.team5599.com/Account.html");
		}

	} else {
		echo "Invalid parameters provided for account verification. Contact webmaster@team5599.com immediately.";
		die();
	}

} else if ($request == "notify"){

	if ($_SESSION['logged_in'] = true){

		$email = $_SESSION["email"];
		$osis = $_SESSION["OSIS"];

		echo "An email was sent to ".$email.". Please open the email and click the activation link for the account ".osis.".";
		die();
	}

	$msg = $_SESSION["message"];

	if ($msg){
		echo $msg;
		die();
	}

	echo "An error has occured at Verify.php for NOTIFY.";
}

?>