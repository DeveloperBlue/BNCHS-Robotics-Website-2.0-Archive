<?php

// Register.php

require 'db.php';
session_start();

$_SESSION["email"] = $mysqli->escape_string($_POST["email"]);
$_SESSION["OSIS"] = $mysqli->escape_string($_POST["OSIS"]);

// Escale variables to protect against SQL injections

$password = $mysqli->escape_string(password_hash($_POST["password"], PASSWORD_BCRYPT));
$password_re = $mysqli->escape_string(password_hash($_POST["password_re"], PASSWORD_BCRYPT));
$activation_key = $mysqli->escape_string( md5 ( rand(0, 1000)));

$first_name = $mysqli->escape_string($_POST["first_name"]);
$last_name = $mysqli->escape_string($_POST["last_name"]);

$OSIS = $mysqli->escape_string($_POST["OSIS"]);
$OSIS_re = $mysqli->escape_string($_POST["OSIS_re"]);

$result = $mysqli->query("SELECT * FROM users WHERE osis='$osis' OR email='$email' LIMIT 1") or die($mysqli->error());
$existing_user = mysqli_fetch_assoc($result);

if ( ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
	echo "Invalid email address. Please check the email you entered.";
	die();
}

if ($password != $password_re){
	echo "Password mismatch. Please check the passwords you have entered.";
	die();
}

if (strlen($OSIS) != 9){
	echo "Invalid Student ID. Please double check the Student ID you have entered.";
	die();
}

if ($OSIS != $OSIS_re){
	echo "Student ID mismatch. Please check that you have entered your Student ID correctly twice";
	die();
}

if ($existing_user){

	if ($user['osis'] === $osis){
		echo "An account with this Student ID already exists.";
		die();
	}

	if ($user['email'] === $email){
		echo "An account with this email address already exists.";
		die();
	}
} else {

	$sql = "INSERT INTO users (email, osis, first_name, last_name, password, activation_key, facebook_auth, discord_auth)"
		. "VALUES ('$email', '$osis', '$first_name', '$last_name', '$password', '$activation_key', 0, 0 )";

	if ($mysqli->query(sql)){

		$_SESSION['logged_in'] = true;
		$_SESSION['active'] = 0;
		echo "A confirmation email has been sent to ".$email.", please verify your account by clicking the link in the message.";

		// Send confirmation message link (verify.php)

		$to = $email;
		$subject = "Account Verification - Cardozo Robotics - Team 5599 - The Sentinels";
		$headers = "From: accounts@team5599.com";
		$message_body = '
		Hello '.$first_name.',

		Your account has been created at www.team5599.com.

		Please click the following link to activate your account:

		http://www.team5599/SignUp.html/Verify.php?osis=$'.$osis.'$key='.$activation_key;

		mail( $to, $subject, $message_body, $headers);
		header("location: Account.html");

	} else {

		echo "REGISTRATION FAILED!";
		die();

	}
}

?>