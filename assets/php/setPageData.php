<?php

// Grabs data for Robots, Team, Sponsors, Contact, and Splash Page Headers.

require 'db.php';

$request = $mysqli->escape_string($_POST["request"]);
$dataObject = $mysqli->escape_string($_POST["$objectData"]);

// Authentication is only valid through SESSION

$osis = $_SESSION["osis"];

$authentication_check = $mysqli->query("SELECT * FROM users WHERE osis='$osis'") or die (mysqli_error($mysqli));

if ($authentication_check->num_rows == 0){

	echo '{status: 400, message : "Invalid Request -> User with the OSIS presented in SESSION does not exist."}';

	exit();
}

$user = $authentication_check->fetch_assoc();

$authentication_array = [
	"robotData" => "p11x",
	"teamData" => "p12x",
	"sponsorData" => "p13x",
	"contactData" => "p14x",
	"splashPageData" => "p15x",
	"logData" => "p16x",
];

if (array_key_exists($request, $authentication_array) == false){

	echo '{status: 400, message : "Invalid Request -> ' . $request . '"}';

	exit();

}

$isFullAdmin = strpos($user["permissions"],"p99x");
$isAuthenticated = strpos($user["permissions"], $authentication_array[$request]);

if (($isFullAdmin == false) && ($isAuthenticated == false)){
	echo '{status: 403, message: "Invalid Permissions -> Use with this OSIS ' . $osis . ' does not have the right permissions to make website changes."}';
	exit();
}


$databaseByRequest = [
	"robotData" => "robots",
	"teamData" => "leadership",
	"sponsorData" => "sponsors",
	"contactData" => "contacts",
	"splashPageData" => "",
	"logData" => "logs",
];

if (array_key_exists($request, $databaseByRequest) == false){

	echo '{status: 400, message : "Invalid Request -> ' . $request . '"}';

	exit();

}

$query = "SELECT * FROM " . $databaseByRequest[$request];

/*
if ($result->num_rows > 0) {

	$result = $mysqli->query($query) or die(mysqli_error($mysqli));

	$data = array();
	while($r = mysqli_fetch_assoc($result)) {
		$data[] = $r;
	}

	echo json_encode( $data );

	exit();

} else {
	
	echo "0 results for request '" . $request . "'";

	exit();
}
*/

?>