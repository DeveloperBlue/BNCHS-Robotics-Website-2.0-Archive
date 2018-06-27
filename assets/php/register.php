<?php
// Register.php
// Read form data

$email = $_POST["email"];
$password = $_POST["password"];
$password_re = $_POST["password-re"];


// Validation
$error_message = "";
if (strlen($password) < 6){
	$error_message = "Password too short. Please enter at least six characters.";
} else if ($password != $password_re){
	$error_message = "Password mismatch. Double check your enter passwords.";
}

if ( ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $error_message = "Invalid email address. Please check the email you entered.";
}

// Discord/Facebook check


// Insert user into database

$random_key = generate_random_key();

$stm = $dbh->prepare("insert into users (email,password,activation_key,validated,first_name, last_name, osis, facebook_auth, discord_auth) " .
                     "values ( ? , ? , ? , 0 , ?, ?, ?, 0, 0)");

$stm->bind_param("sss",$email,$password,$random_key);
if (!$stm->execute()) {
    // The insertion may fail if the user already exists in the database
    $error_message = "Sorry, an account with this email already exists in the database";
} else {
    // Send a confirmation email
    mail($email,"www.Team5599.com - The Sentinels - Account activation ",
        "Thank you for registering at www.team55999.com.

        Your account is created and must be activated before you can use it.
        To activate the account click on the following link or copy-paste it in your browser:
        http://www.team5599.com/Forgot.html/activate.php?type=activation&activation=".$random_key);
 
}

function generate_random_key() {
    $chars = "abcdefghijklmnopqrstuvwxyz0123456789";
 
    $new_key = "";
    for ($i = 0; $i < 32; $i++) {
        $new_key .= $chars[rand(0,35)];
    }
    return $new_key;
}

?>