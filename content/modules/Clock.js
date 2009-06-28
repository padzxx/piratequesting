var piratequesting = top.piratequesting;

/**
 * 
 * @namespace
 */
piratequesting.Clock = function() {
	/**
	 * time in milliseconds since the epoch
	 * @private
	 * @type Integer
	 */
	var time = 0;

	/**
	 * Timer to update the time every second
	 * @private
	 * @type Timer
	 */
	var obj = new Timer();
	obj.Interval = 1000;
	obj.Tick = showtime;
	obj.Start();

	/**
	 * Function to run every tick of the timer (every 1000 msec)
	 * @inner
	 * @private
	 */
	function showtime() {
		// create a Date from the stored time
		var stime = new Date(time);

		// break it into its components
		var hours = stime.getHours();
		var minutes = stime.getMinutes();
		var seconds = stime.getSeconds();

		// build the human-readable format
		var timeValue = "" + ((hours > 12) ? hours - 12 : hours);
		timeValue += ((minutes < 10) ? ":0" : ":") + minutes;
		timeValue += ((seconds < 10) ? ":0" : ":") + seconds;
		timeValue += (hours >= 12) ? " pm" : " am";

		// display the new time value
		
		var clockElement;
		if ((piratequesting.sidebar) && (clockElement = sidebar.contentDocument.getElementById('servertime')))
			clockElement.setAttribute("value", timeValue);
		time = time + 1000;
	}

	return /** @lends piratequesting.Clock */{
		/**
		 * Standard Module Page Processor
		 */
		process : function(doc) {
			var regex, match, ltime;
			try {
				if (piratequesting.baseTheme == "classic") {
					// regex for the time info on the page and get the match
					
					ltime = doc.getElementsByClassName('time')[0];
					if (!ltime)
						return;
					ltime = ltime.firstChild.nodeValue;
					regex = /Time: ([0-9]{1,2}):([0-9]{1,2})([apm]{2})/;
				} else if (piratequesting.baseTheme == "default") {
					ltime = doc.evaluate("id('finalmotive')/div[@class='center']", doc, null, XPathResult.STRING_TYPE, null).stringValue;
					if (!ltime) return;
					regex = /Game Time:\s*([0-9]{1,2}):([0-9]{1,2})\s*([apm]{2})/i;
				}
				match = regex.exec(ltime);

				// create a new date and set our values
				var somedate = new Date();
				somedate.setHours((match[3] == "am") ? ((match[1] == 12)
						? 0
						: match[1]) : ((match[1] == 12) ? 12 : Number(match[1])
						+ 12));
				somedate.setMinutes(match[2]);
				somedate.setSeconds(0);

				var otime = new Date(time);
				if ((otime.getMinutes() != somedate.getMinutes())
						|| (otime.getHours() != somedate.getHours())) {
					// get the number of milliseconds from somedate and assign
					time = somedate.getTime();
				}

			} catch (error) {
				alert(getErrorString(error));
			}

		}
	}
}();
piratequesting.addLoadProcess("", piratequesting.Clock.process);
if(!mainWindow)
var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow);
var sidebar = mainWindow.document.getElementById("sidebar");