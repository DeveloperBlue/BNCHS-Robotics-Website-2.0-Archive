<?php

//Validate user and password
$email = $_POST["user"];
$password = $_POST["password"];
 
$stm = $dbh->prepare("select email from users where email=? and password=?");
$stm->bind_param("ss",$email,$password);
$stm->execute();
$login_error_message = "";
if ($stm->fetch()) {
    $_SESSION["user"] = $email;
    // Redirect user to the home page
    header( 'Location: http://example.com/' );
    return;
} else {
    // Display error message
        ...
}

?>