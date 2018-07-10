<?php

// Grabs data for Robots, Team, Sponsors, Contact, and Splash Page Headers.

require 'db.php';

$request = $mysqli->escape_string($_POST["$request"]);

$result;

if ($request == "robotData"){

	$result = $mysqli->query("SELECT * FROM robots");

} else if ($request == "teamData"){

	$result = $mysqli->query("SELECT * FROM leaders");

} else if ($request == "sponsorData"){

	$result = $mysqli->query("SELECT * FROM sponsors");

} else if ($request == "contactData"){

	$result = $mysqli->query("SELECT * FROM contacts");

} else if ($request == "splashPageData"){

	// $result = $mysqli->query("SELECT * FROM contacts");

} else if ($request == "logData"){

	$result = $mysqli->query("SELECT * FROM logs");

} else {

	echo "Invalid Request -> " . $request;
}

echo json_encode($result);

?>