var piratequesting = top.piratequesting;
piratequesting.Fight = function() {

	function printFight(doc, fight) {
		
		if (piratequesting.baseTheme == piratequesting.DEFAULT_THEME) {
			var table = fight.toTable(doc);
			
			var bi = doc.createElement("div");
			bi.setAttribute("id", "battle-info");
			var d1 = doc.createElement("div");
			var d2 = doc.createElement("div");
			
			d2.appendChild(table);
			d1.appendChild(d2);
			bi.appendChild(d1);
				
			var battle = doc.getElementById("pirate-battle");
	
			function toggle(event) {
				var element = battle;
				if (element.style.display && element.style.display == "none") {
					element.style.display = null;
				} else {
					element.style.display = "none";
				}
			}
			var a = doc.createElement("a");
			a.appendChild(doc.createTextNode("Show/Hide original report."))
			battle.parentNode.insertBefore(bi, battle);
			d2.appendChild(a);
			a.setAttribute("onclick", "return false;");
			a.setAttribute("href", "#");
			a.addEventListener("click", toggle, false);
			a.style.display = "block";
	
			battle.style.display = "none";
			// battle.parentNode.removeChild(battle);
		}
	}
	
	return {
		process : function(doc, data) {
			if (piratequesting.prefs.getBoolPref("FormatFightReports")) {
				pqdump("PQ: Fight Processed\n\tLogging data to console\n", PQ_DEBUG_STATUS);
				data = JSON.parse(data);
				pqlog(doc, PQ_DEBUG_STATUS);
				pqlog(data, PQ_DEBUG_STATUS);
				try {
					var fight = new Fight();
					fight._import(data);
					printFight(doc, fight);
						//piratequesting.FightProcessor.print(doc);
				} catch (e) {
					dumpError(e);
				}
			}
		},
		
		observe: function(subject, topic, data) {
		    if (topic == "piratequesting-on-process-fight") {
		        piratequesting.Fight.process(subject, data); //invoke the custom method here
		    }
		},
		
		get observerService() {
			return Components.classes["@mozilla.org/observer-service;1"]
			                          .getService(Components.interfaces.nsIObserverService);

		},
		
		register: function() {
			this.observerService.addObserver(this, "piratequesting-on-process-fight", false);
		}

	}
}();
piratequesting.Fight.register();
//document.addEventListener("piratequesting:FightUpdated",piratequesting.Fight.process, false);