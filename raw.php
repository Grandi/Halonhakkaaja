<?php
	include("halonhakkaaja.php");

	$location = get_location($_GET['server'], $_GET['channel'], $_GET['year'], $_GET['month'], $_GET['day']);
	header('Content-type: text/plain; charset=utf-8');
	
	file_exists($location) || die("");
	die(file_get_contents($location));
?>