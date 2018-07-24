<?php

// Register.php

require 'db.php';
session_start();

$_SESSION["email"] = $mysqli->escape_string($_POST["email"]);
$_SESSION["OSIS"] = $mysqli->escape_string($_POST["OSIS"]);

// Escale variables to protect against SQL injections

$email = $mysqli->escape_string($_POST["email"]);

$password = $mysqli->escape_string($_POST["password"]);
$password_re = $mysqli->escape_string($_POST["password-re"]);
$activation_key = $mysqli->escape_string( md5 ( rand(0, 1000)));

$first_name = $mysqli->escape_string($_POST["firstname"]);
$last_name = $mysqli->escape_string($_POST["lastname"]);

$OSIS = $mysqli->escape_string($_POST["OSIS"]);
$OSIS_re = $mysqli->escape_string($_POST["OSIS-re"]);

$result = $mysqli->query("SELECT * FROM users WHERE osis='$OSIS' OR email='$email' LIMIT 1") or die($mysqli->error());
$existing_user = mysqli_fetch_assoc($result);

$email = filter_var($email, FILTER_SANITIZE_EMAIL);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
	echo '{status: 400, message:"Invalid email address. Please check the email address you have entered. ' . $email . '"}';
	die();
}

if ($password !== $password_re){
	echo '{status: 400, message:"Password mismatch. Please check the passwords you have entered."}';
	die();
}

$password = password_hash($password, PASSWORD_BCRYPT);

if (strlen($OSIS) != 9){
	echo '{status: 400, message:"Invalid Student ID. Please double check the Student ID you have entered."}';
	die();
}

if ($OSIS !== $OSIS_re){
	echo '{status: 400, message:"Student ID mismatch. Please check that you have entered your Student ID correctly twice"}';
	die();
}

if ($existing_user){

	$confirmed = $user['active'];
	$confirmed_email = $user['email'];

	if ($user['osis'] === $osis){
		if ($confirmed == 0){
			echo '{status: 400, message: "An account with this Student ID already exists.  Check your email ' . $confirmed_email . ' to activate your account."}';
		} else {
			echo '{status: 400, message: "An account with this Student ID already exists."}';
		}
		
		die();
	}

	if ($user['email'] === $email){
		if ($confirmed == 0){
			echo '{status: 400, message: "An account with this email address already exists. Check your email ' . $confirmed_email . ' to activate your account."}';
		} else {
			echo '{status: 400, message: "An account with this Student ID already exists."}';
		}
		die();
	}
} else {

	$sql_query = "INSERT INTO users (email, osis, password, first_name, last_name, active, activation_key, facebook_auth, discord_auth)"
		. "VALUES ('$email', '$OSIS', '$password', '$first_name', '$last_name', 0, '$activation_key', 0, 0 )";

	if ($mysqli->query($sql_query)){

		$_SESSION['logged_in'] = true;
		$_SESSION['active'] = 0;
		// echo "A confirmation email has been sent to ".$email.", please verify your account by clicking the link in the message.";

		// Send confirmation message link (verify.php)

		$to = $email;
		$subject = "Account Verification - Cardozo Robotics - Team 5599 - The Sentinels";
		$headers = "From: accounts@team5599.com";
		$message_body = '
		Hello '.$first_name.',

		Your account has been created at www.team5599.com.

		Please click the following link to activate your account:

		http://www.team5599.com/Verify.html?request=verify&osis='.$OSIS.'&key='.$activation_key;

		mail( $to, $subject, $message_body, $headers);

		echo '{status: 200}';

		header("location: http://www.team5599.com/Verify.html?request=notify");

	} else {

		echo '{status: 400, message:"An error has occured (' . sql_query . ') ' . mysqli_error($mysqli) . '"}';
		die();

	}

	mysqli_close($mysqli);
}

?>