<?php

// Grabs data for Robots, Team, Sponsors, Contact, and Splash Page Headers.

require 'db.php';

$request = $mysqli->escape_string($_POST["request"]);
$dataObject = $mysqli->escape_string($_POST["$objectData"]);

$query;

if ($request == "robotData"){

	$query = "SELECT * FROM robots";

} else if ($request == "teamData"){

	$query = "SELECT * FROM leadership";

} else if ($request == "sponsorData"){

	$query = "SELECT * FROM sponsors";

} else if ($request == "contactData"){

	$query = "SELECT * FROM contacts";

} else if ($request == "splashPageData"){

	// $query = "SELECT * FROM logs";

} else if ($request == "logData"){

	$query = "SELECT * FROM logs";

} else {

	echo "Invalid Request -> '" . $request . "'";
}

if ($result->num_rows > 0) {

	$result = $mysqli->query($query) or die(mysqli_error($mysqli));

	$data = array();
	while($r = mysqli_fetch_assoc($result)) {
		$data[] = $r;
	}

	echo json_encode( $data );

} else {
	
	echo "0 results for request '" . $request . "'";
}

?>