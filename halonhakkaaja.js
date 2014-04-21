
var link_pattern = "^https?\://.*";

function LazyAdder(element) {
	this.element = element;
	this.added = '';
	
	this.add = function(stuff) {
		this.added += stuff;
	}

	this.flush = function() {
		this.element.innerHTML += this.added;
		this.added = '';
	}
}

function binary_search(haystack, needle) {
	var lambda = function(a, b) {
		if(a > b) throw "Impossibru!";
		var c = Math.floor((a + b) / 2);
		if(haystack[c] == needle) return c;
		return haystack[c] < needle?
			lambda(c + 1, b):
			lambda(a, c - 1);
	}
	return lambda(0, haystack.length + 1);
}

function disable_HTML(string) {
	return string.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function splitception(target, max_length) {
	if(target.length <= max_length)
		return target;

	return target.substr(0, max_length) + "&shy;" +
		splitception(target.substr(max_length + 1, target.length), max_length);
}

function Halonhakkaaja(settings) {
	this.previousTime = 0;
	this.settings = settings;
	if(settings.channel)
		this.settings.source = document.URL + '/raw';
	else 
		this.settings.source = null;

	this.display_token = function(token) {
		token = disable_HTML(token);
		if(token.match(link_pattern))
			this.content.add(" <a href=\"" + token + "\" target=\"_blank\">" +
				token.substr(0, Math.min(60, token.length)) + (token.length > 60? "(...)": "") + "</a>");
		else
			this.content.add(" " + splitception(token, 50));
	}

	this.display_time = function(line) {
		var time = line.substr(0, line.indexOf(" "));
		if(this.previousTime != time)
			this.content.add("<td id=\"" + time.replace(":", "") + "\">" + time + "</td>");
		else
			this.content.add("<td><u>" + time + "</u></td>");
		this.previousTime = time;
	}

	this.display_chatline = function(line) {
		var nick = line.substr(2, line.indexOf('>'));
		var rest = line.substr(line.indexOf('>') + 2, line.length).split(" ");
		this.content.add("<td>&lt;" + nick);
		for(var i = 0; i < rest.length; i++)
			this.display_token(rest[i]);
		this.content.add("</td>");
	}

	this.display_nonmessage = function(line) {
		this.content.add("<td><span class=\"nonmessage\">" + line + "</span></td>");
	}

	this.get_label = function(channel, year, month, day) {
		if(this.settings.title) {
			return this.settings.title;
		} else if(this.settings.day) {
			var months = [
				"tammi", "helmi", "maalis", "huhti",
				"touko", "kesä", "heinä", "elo",
				"syys", "loka", "marras", "joulu"
			];
			return "<b>#" + this.settings.channel + "</b> " + this.settings.day + ". " + months[this.settings.month - 1] + "kuuta " + this.settings.year;
		} else 
			return "Nimetön logi";
	}

	this.url_to_date = function(year, month, day) {
		var beginning = document.URL.substr(0, document.URL.indexOf(this.settings.channel));
		return beginning + this.settings.channel + "@" + this.settings.server + "/" + year + "/" + month + "/" + day + "/";
	}

	this.display_date_link = function(dates, title, surplus) {
		var actual = new Date(this.settings.year, this.settings.month - 1, this.settings.day, 0, 0, 0, 0);
		var index = binary_search(dates, actual.getTime());

		if(index + surplus < 0 || index + surplus >= dates.length - 1)
			return;
			
		var d = new Date(parseInt(dates[index + surplus]));
		if(isNaN(d.getDay()))
			return;

		this.subcontent.add(" <a href=\"" + this.url_to_date(d.getFullYear(), d.getMonth() + 1, d.getDate()) + "\">" +  title + "</a> ");
	}

	this.add_dates_to_date_dialog = function(dates) {
		
		this.subcontent.add("<select name=\"goto\" id=\"x\" onchange='window.location.replace(document.getElementById(\"x\").value)'>");
		for(i = 0; i < dates.length - 1; i++) {
			var d = new Date(parseInt(dates[i]));
			
			this.subcontent.add("<option value=\"" + this.url_to_date(d.getFullYear(), d.getMonth() + 1, d.getDate()) + "\"");
			if(d.getFullYear() == this.settings.year && (d.getMonth() + 1) == this.settings.month && d.getDate() == this.settings.day)
				this.subcontent.add(" selected ");
			this.subcontent.add(">" + d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear() + "</option>");
		}
		this.subcontent.add("</select>");
	}

	this.display_date_dialog = function() {
		
		var me = this;
		$.get("resources/loglists/" + this.settings.server + "_" + this.settings.channel, function(content) {
			me.subcontent = new LazyAdder(document.getElementById('topbar'));

			var dates = content.split("\n");
			dates[dates.length - 1] = dates[dates.length - 2] + 1;

			me.subcontent.add(" | ");
			me.display_date_link(dates, "&laquo; edellinen", -1);
			me.add_dates_to_date_dialog(dates);
			me.display_date_link(dates, "seuraava &raquo;", 1);
			
			me.subcontent.flush();
		});
	}
	
	this.display_top_bar = function() {
		this.content.add("<div id=\"topbar\">");
		if(this.settings.day)
			this.display_date_dialog();
		
		this.content.add("<a href=\"" + this.settings.source + "\" id=\"rawlink\">raakaversio</a>");
		this.content.add("</div>");
	}

	this.display_line = function(line) {
		if(line.indexOf('--- ') == 0)
			return;
		this.content.add("<tr>");
		this.display_time(line);
		if(line.indexOf('<') == line.indexOf(' ') + 1)
			this.display_chatline(line.substr(line.indexOf(" "), line.length));
		else
			this.display_nonmessage(line.substr(line.indexOf(" "), line.length));
		this.content.add("</tr>");
	}

	this.display_log = function(lines) {
		var q = document.body;
		this.content.add("<table id=\"addedHTML\" cellspacing=\"0\" cellpadding=\"0\"><tr><td></td><td><h1>" + this.get_label() + "</h1>");
		this.display_top_bar();
		this.content.add("</td></tr>");
		for(var i = 0; i < lines.length; i++)
			this.display_line(lines[i]);
		this.content.add("</table>");
	}
	
	this.get_log = function(location) {
		var me = this;
		me.content = new LazyAdder(location);
		$.get(this.settings.source, function(content) {
		
			if(content != "")
				me.display_log(content.split("\n"));
			else {
				var beginning;
				if(me.settings.channel)
					beginning = document.URL.substr(0, document.URL.indexOf(me.settings.channel));
				else 
					beginning = document.URL.substr(0, document.URL.indexOf(me.settings.target));
				
				me.content.add("<div id=\"normalblock\"><h1>404</h1><p>Hakemaasi logitiedostoa ei löydy.</p><p><a href=\"" + beginning + "\">etusivulle &raquo;</a></p></div>");
			}
			me.content.flush();
		});
	}

	this.plant_in = function(location) {
		if(this.settings.source)
			this.get_log(location);
		else {
			location.innerHTML += "<div id=\"normalblock\"><h1>:-)</h1><p>Tämä on etusivu siinä missä me länsimaalaiset etusivun ymmärrämme.</p><p>Täällähän voisi olla vaikka luettelo sivun näyttämistä logeista.</p></div>";
		}
	}
}

