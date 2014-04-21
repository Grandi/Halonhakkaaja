<?php
	include("halonhakkaaja.php");
	
	if(isset($_GET['server'])) {
		update_datelist($_GET['server'], $_GET['channel']);
		if(!isset($_GET['day']))
			get_latest($_GET['server'], $_GET['channel']);
	}

?><!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="fi" lang="fi">
	<head>
		<meta http-equiv="Content-type" content="text/html; charset=utf-8" />
		<title><?= get_title() ?></title>
		<link rel="stylesheet" type="text/css" href="resources/swag.css" />
		<script src="http://code.jquery.com/jquery-1.11.0.min.js"></script>
		<script src="resources/halonhakkaaja.js"></script>
		<script type="text/javascript">
			<?= generate_js() ?>
		</script>
	</head>
	<body>
		<script type="text/javascript">
			halonhakkaaja.plant_in(document.body);
		</script>
	</body>
</html>