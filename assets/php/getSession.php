<?php 

// Get Session

require 'db.php';
session_start();

$request = $mysqli->escape_string($_POST["$request"];

$session = $_SESSION['logged_in'];

if ($request == "getSession"){

	if ($session == true){
		echo $_SESSION['osis'];
		die();
	}

	echo false;

} else if ($request == "isConfirmed"){

	if ($session == true){

		$osis = $_SESSION['osis'];

		$result = $mysqli->query("SELECT FROM users WHERE osis='$osis' LIMIT 1");

		if ($result->num_rows == 0){
			// User doesn't exist . . .
			echo "404";
			die();

		} else {
			// User does exist . . .

			$user = $result->fetch_assoc();

			$active = $user['active'];

			if (($active != 0) && ($active != null)){
				echo "200";
				die();
			}

			echo "401";
			die()

	} else {
		echo "403";
		die()
	}

} else if ($request == "endSession"){

}

?>