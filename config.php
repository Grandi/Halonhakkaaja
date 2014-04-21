<?php
	/* Halonhakkaaja 4.0 config file
	 * - Remember to edit the .htaccess file as well!
	 * - Everything is case-sensitive!
	 */

	/* Base URL of your site and page. */
	$my_url = 'http://mysite.com/halonhakkaaja';

	/* Base directory for the logfiles. @server and @channel will be changed by the scripts. */
	$log_locations = '/home/grandi/irclogs/@server/@channel';
	
	/* Date format string for log files. Only supports PHP date()'s "m", "d" and "Y" since
     * I personally don't need anything else. If you want something fancier, code it yourself. */
	$log_format = 'm-d-Y';
	
	$log_extension = '.log';
	
	/* So in the above example configuration:
	 *    User accesses URL http://mysite.com/halonhakkaaja/awesome@freenode/2011/5/21/
	 *    A log is fetched from /home/grandi/irclogs/freenode/#awesome/05-21-2011.log
	 *
	 * If no date is determined in the URL (only http://mysite.com/halonhakkaaja/awesome@freenode/),
	 * the most recent log will be shown from the channel in question.
	 */
?>