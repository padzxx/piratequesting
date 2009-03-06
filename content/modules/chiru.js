var piratequesting = top.piratequesting;

/**
 * Chirugeon page processing<br>
 * Changes time reamining into countdown timers<br>
 * Also adds links to attack and mug the players
 * 
 * @namespace
 */
piratequesting.Chirugeon = {

	/**
	 * Standard Module Page Processor
	 * 
	 * @param {nsIDOMDocument}
	 *            doc
	 */
	process : function(doc) {
		// regex used when converting FM's time remaining into seconds
		var timex = /([0-9]+)m\s*([0-9]+)s/i;
		var idex = /user=([0-9]+)/i;
		var ca = doc.getElementById("contentarea");
		var chirutable = ca.getElementsByTagName("table")[0];
		var rows = chirutable.getElementsByTagName("tr");
		// note row[0] is the heading information.
		var cells, cell, time, seconds, timers = [], obj, player_id;
		cell = doc.createElement("th");
		cell.appendChild(doc.createTextNode("Actions"));
		rows[0].appendChild(cell);
		for (var i = 1; i < rows.length; i++) {
			try {
				// now get the last cell
				cells = rows[i].getElementsByTagName("td");
				player_id = idex.exec(cells[1].innerHTML)[1];
				cell = cells[cells.length - 1];
				time = timex.exec(cell.firstChild.nodeValue);
				seconds = (Number(time[1]) * 60) + Number(time[2]);
				obj = new Timer();
				obj.index = Number(seconds);
				obj.Interval = 1000;
				obj.document = doc;
				obj.target = cell;
				obj.Tick = timer_tick;
				obj.Start();
				timers.push(obj);
				cell = doc.createElement("td");
				cell.innerHTML = "<a href='/index.php?on=attack&id="
						+ player_id
						+ "'>" + piratequesting.strings.Chirugeon
						.getString("attack") +"</a> <a href='/index.php?on=mug&id="
						+ player_id + "'>" + piratequesting.strings.Chirugeon
						.getString("mug") + "</a>";
				rows[i].appendChild(cell);
			} catch (e) {
				// fubar. let's die quietly
			}
		}

		function timer_tick() {
			// alert(this);
			this.index--;
			this.target.innerHTML = Math.floor(this.index / 60) + "m "
					+ (this.index % 60) + "s";

			if (this.index == 0) {
				this.Stop();
				delete this;
			}
		}

	}
};

piratequesting.addLoadProcess(new RegExp("index\\.php\\?on=hospital", ""),
		piratequesting.Chirugeon.process);
