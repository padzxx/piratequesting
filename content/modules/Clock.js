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
	var time = new Date();

	function clock_tick() {
		showTime();
		time.setTime(time.getTime() + 1000);
	}
	
	/**
	 * Timer to update the time every second
	 * @private
	 * @type Timer
	 */
	try {
		var obj = new Timer(clock_tick, 1000);
		obj.Start();
	} catch (e)	{
		dumpError(e);
	}
	/**
	 * Function to run every tick of the timer (every 1000 msec)
	 * @inner
	 * @private
	 */
	function showTime() {
		try {
			var hours = time.getUTCHours();
			var minutes = time.getUTCMinutes();
			var seconds = time.getUTCSeconds();
	
			// build the human-readable format
			var timeValue = "" + ((hours > 12) ? hours - 12 : hours);
			timeValue += ((minutes < 10) ? ":0" : ":") + minutes;
			timeValue += ((seconds < 10) ? ":0" : ":") + seconds;
			timeValue += (hours >= 12) ? " pm" : " am";
	
			var clockElement;
			if ((piratequesting.sidebar) && (clockElement = sidebar.contentDocument.getElementById('servertime'))) {
				clockElement.setAttribute("value", timeValue);
			}
		} 
		catch (e) {
			dumpError(e);
		}	
	}

	return /** @lends piratequesting.Clock */{
	
		getDate: function() {
			return time;
		},
		
		setDate: function(newTime) {
			if ((time.getMinutes() != newTime.getMinutes())
					|| (time.getHours() != newTime.getHours())) {
				// get the number of milliseconds from somedate and assign
				time = newTime;
				showTime();
			}
		}
	}
}();
if(!mainWindow)
var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow);
var sidebar = mainWindow.document.getElementById("sidebar");