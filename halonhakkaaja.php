<?php
	include("config.php");

	function get_directory($server, $name) {
		global $log_locations;
		return str_replace("@channel", '#'.$name,
			str_replace("@server", $server, $log_locations));
	}

	function get_title() {
		if(!isset($_GET['channel']))
			return "Halonhakkaaja 4";
		return "#" . $_GET['channel'] . " " .
			$_GET['day'] . "/" . $_GET['month'] . "/" . $_GET['year'];
	}

	function process_log_format(&$regex, &$labels) {
		global $log_format;

		for($f = 0, $q = 0; $f < strlen($log_format); $f++)
			if(strpos("mdY", $log_format[$f]) === false)
				$regex .= "\\".$log_format[$f];
			else {
				$regex .= "([0-9]+)";
				$labels[$q] = $log_format[$f];
				$q++;
			}
	}

	function determine_date($string) {
		global $log_format_regex, $log_format_labels;
		$results = array();
		if(!preg_match("/".$log_format_regex."/", $string, $results))
			return 0;
		for($i = 0; $i < count($results); $i++)
			$results[$log_format_labels[$i]] = $results[$i + 1];
		return strtotime($results['d'].'-'.$results['m'].'-'.$results['Y']);
	}

	function fetch_dates($server, $channel) {
		global $log_extension;
	
		$directory = get_directory($server, $channel);
		$dates = array();
		foreach(glob($directory . "/*" . $log_extension) as $file) {
			$d = determine_date(basename($file, $log_extension));
			if($d)
				array_push($dates, $d);
		}
		sort($dates);
		return $dates;
	}

	function get_filename($year, $month, $day) {
		global $log_format, $log_extension;
		$made = mktime(0, 0, 0, $month, $day, $year);
		return date($log_format, $made).$log_extension;
	}

	function get_location($server, $name, $year, $month, $day) {
		return get_directory($server, $name)."/".get_filename($year, $month, $day);
	}

	function update_datelist($server, $channel) {
		$filename = "loglists/" . $server . "_" . $channel;
		$directory = get_directory($server, $channel);
		
		if(!file_exists($directory) || (file_exists($filename) && filemtime($filename) >= filemtime($directory)))
			return;
		
		$file = fopen($filename, "w");
		foreach(fetch_dates($server, $channel) as $d)
			fwrite($file, $d . "000\n");
		fclose($file);
	}

	function get_latest($server, $channel) {
		global $my_url;
		$list = "loglists/" . $server . "_" . $channel;
		if(!file_exists($list)) {
			header("location: " . $my_url . "/nonexisting@log/4/0/4/");
			return false;
		}
		
		$file = file($list, FILE_IGNORE_NEW_LINES);
		header("location: " . $my_url . "/" . $_GET['channel'] . "@" . $_GET['server'] . "/" . date("Y/n/j/", $file[count($file) - 1] / 1000));
		return true;
	}

	function generate_js() {
		if(!isset($_GET['channel']))
			return "var halonhakkaaja = new Halonhakkaaja({});\n";
		return "
			var halonhakkaaja = new Halonhakkaaja({
				server: '{$_GET['server']}',
				channel: '{$_GET['channel']}',
				year: {$_GET['year']},
				month: {$_GET['month']},
				day: {$_GET['day']}
			});\n\n";
	}
	
	$log_format_regex = '';
	$log_format_labels = array();
	process_log_format($log_format_regex, $log_format_labels);
?>