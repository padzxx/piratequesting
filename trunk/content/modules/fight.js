var piratequesting = top.piratequesting;
piratequesting.Fight = function() {

	return {
		process : function(doc) {
			// check if the fight has been changed since we last processed it
			// (as we don't know who will process the fight first)
			try {
				if (piratequesting.prefs.getBoolPref("extensions.piratequesting.FormatFightReports"))
					piratequesting.FightProcessor.print(doc);

			} catch (e) {
				alert(getErrorString(e))
			}

		}

	}
}();

document.addEventListener("piratequesting:FightUpdated",function(event){ piratequesting.Fight.process(event.relatedTarget); }, false);