<?php 

// Get Session

require 'db.php';
session_start();

$request = $mysqli->escape_string($_POST["request"]);

$session = $_SESSION['logged_in'];

if ($request == "getSession"){

	if ($session == true){
		echo '{status: 200, message : "' + $_SESSION['osis'] + '"}';
		die();
	}

	echo '{status: 401, message: "User is not logged in."}';

} else if ($request == "isConfirmed"){

	if ($session == true){

		$osis = $_SESSION['osis'];

		$result = $mysqli->query("SELECT FROM users WHERE osis='$osis' LIMIT 1");

		if ($result->num_rows == 0){
			// User doesn't exist . . .
			echo '{status:404, message:"Invalid OSIS. A user with that OSIS does not exist."}';
			die();

		} else {
			// User does exist . . .

			$user = $result->fetch_assoc();

			$active = $user['active'];

			if (($active != 0) && ($active != null)){
				echo '{status:200, message: "Success."}';
				die();
			}

			echo '{status:401}';
			die();
		}

	} else {
		echo '{status:403}';
		die();
	}

} else if ($request == "log_out"){

	session_destroy();

	echo '{status:200}';
	header("location: http://www.team5599.com/SignIn.html");
	exit();

}

?>