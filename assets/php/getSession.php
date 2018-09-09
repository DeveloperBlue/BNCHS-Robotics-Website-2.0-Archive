<?php 

// Get Session

require 'db.php';
session_start();

$request = $_POST["request"];

if ($request == "log_out"){

	$_SESSION['logged_in'] = false;

	session_unset(); 
	session_destroy();

	echo '{"status":200}';
	
	die();

}


$session = $_SESSION['logged_in'];

if ($session == true){

	$osis = intval($_SESSION['osis']);

	$result = $mysqli->query("SELECT * FROM users WHERE osis='$osis' LIMIT 1");

	if ($result->num_rows == 0){
		// User doesn't exist . . .
		echo '{"status":404, "message":"Invalid OSIS. A user with that OSIS \'' . $osis . '\' does not exist."}';
		die();

	} else {
		// User does exist . . .

		$user = $result->fetch_assoc();

		$first_name = $_SESSION['first_name'];
		$last_name = $_SESSION['last_name'];
		$active = $user['active'];

		echo '{"status": 200, "message" : { "osis" : "' . $osis . '", "first_name" : "' . $first_name . '", "last_name" : "' . $last_name . '", "active" : "' . $active . '"}}';
		die();
	}

} else {
	echo '{"status":403}';
	die();
}

?>