<?php

$activation_key = $_GET["activation"];
    $dbh = get_dbh();
    // Search the entry in the users table for the received activation key
    $stm = $dbh->prepare("select count(1) from users where activation_key=?");
    $stm->bind_param("s",$activation_key);
    $stm->bind_result($total);
    $message = "";
    $stm->execute();
    $stm->fetch();
    $stm->close();
    if ($total == 1) { // If found...
        // Retrieve the email address
        $stm = $dbh->prepare("select email from users where activation_key=?");
        $stm->bind_param("s",$activation_key);
        $stm->bind_result($email);
        $stm->execute();
        $stm->fetch();
        $stm->close();
        // Set the validated flag in the database
        $stm = $dbh->prepare("update users set validated=1 where activation_key=?");
        $stm->bind_param("s",$activation_key);
        $stm->execute();
        $stm->close();
        // Log the user into the session
        $_SESSION["user"] = $email;
        $message .= "Thank you for registering with us<br/><br/>" .
            "Welcome to example.com!<br/><br/>" .
            "<a href='http://example.com' class=\"btn\"'>Continue</a>";


?>