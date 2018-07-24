<?php

// Grabs data for Robots, Team, Sponsors, Contact, and Splash Page Headers.

require 'db.php';

// $request = $mysqli->escape_string($_POST["request"]);
$request = $_POST["request"];

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

$result = $mysqli->query($query) or die(mysqli_error($mysqli));

if ($result->num_rows > 0) {

	$data = array();
	while($r = mysqli_fetch_assoc($result)) {
		$data[] = $r;
	}

	echo '{status: 200, message : "' . json_encode( $data ) . '"}';
	exit();

} else {

	echo '{status: 200, message : "0 results for request ' . $request . '"}';
	exit();
}

?>