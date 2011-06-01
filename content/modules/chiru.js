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
		var time_cells = [];
		try {
			var ca = doc.getElementById("contentarea");
			var chirutable = ca.getElementsByTagName("table")[0];
			var rows = chirutable.getElementsByTagName("tr");
			// note row[0] is the heading information.
			var cell, cells,action_cell, time, time_cell, obj, player_id;
			cell = doc.createElement("th");
			cell.appendChild(doc.createTextNode("Actions"));
			rows[0].appendChild(cell);
			for ( var i = 1; i < rows.length; i++) {
				try {
					// now get the last cell
					cells = rows[i].getElementsByTagName("td");
					player_id = idex.exec(cells[1].innerHTML)[1];
					time_cell = cells[cells.length - 1];
					time = timex.exec(time_cell.innerHTML);
					time_cell.pqseconds = (Number(time[1]) * 60) + Number(time[2]);  
					time_cells.push(time_cell);
					action_cell = doc.createElement("td");
					action_cell.innerHTML = "<a href='/index.php?on=attack&id=" + player_id + "'>" + piratequesting.strings.Chirugeon.getString("attack") + "</a> <a href='/index.php?on=mug&id=" + player_id + "'>" + piratequesting.strings.Chirugeon.getString("mug") + "</a>";
					rows[i].appendChild(action_cell);
				} catch (e) {
					dumpError(e);
				}
			}
			obj = new Timer(timer_tick.curry(time_cells));
			obj.Start();
			
		} catch (e) {
			dumpError(e);
		}

		function timer_tick(cells, seconds) {
			var time_cell, time, seconds, time_left;
			var all_done = true;
			for(var i=0, len=cells.length; i<len;++i) {
				time_cell = cells[i];
				time_left = --time_cell.pqseconds;
				if (time_left >= 0) {
					time_cell.innerHTML = Math.floor(time_left / 60) + "m " + (time_left % 60) + "s";
					all_done = false;
				}
			}
			if (all_done) {
				obj.Stop();
			}
		}
	}
};

piratequesting.addLoadProcess(new RegExp("index\\.php\\?on=hospital", ""),
		piratequesting.Chirugeon.process);
