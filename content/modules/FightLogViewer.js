/*******************************************************************************
 * ***** BEGIN LICENSE BLOCK Version: MPL 1.1/GPL 2.0/LGPL 2.1
 * 
 * The contents of this file are subject to the Mozilla Public License Version
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for
 * the specific language governing rights and limitations under the License.
 * 
 * The Original Code is Pirate Questing.
 * 
 * The Initial Developer of the Original Code is Jonathan Fingland. Portions
 * created by the Initial Developer are Copyright (C) 2008 the Initial
 * Developer. All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or the
 * GNU Lesser General Public License Version 2.1 or later (the "LGPL"), in which
 * case the provisions of the GPL or the LGPL are applicable instead of those
 * above. If you wish to allow use of your version of this file only under the
 * terms of either the GPL or the LGPL, and not to allow others to use your
 * version of this file under the terms of the MPL, indicate your decision by
 * deleting the provisions above and replace them with the notice and other
 * provisions required by the GPL or the LGPL. If you do not delete the
 * provisions above, a recipient may use your version of this file under the
 * terms of any one of the MPL, the GPL or the LGPL.
 * 
 * ***** END LICENSE BLOCK *****
 */

var fightLog = new LogViewer();
fightLog.tableName = "fightlog";
fightLog.query = "SELECT fight.id as id, me.name as me, opp.name as opponent, win.name as winner, me.strength as myStrength, me.defense as myDefense, me.speed as mySpeed, opp.strength as theirStrength, opp.defense as theirDefense, opp.speed as theirSpeed, prize, experience, fight.datetime FROM fight inner join player as me on fight.my_id = me.id inner join player as opp on fight.opponent_id = opp.id inner join player as win on fight.winner_id = win.id order by fight.datetime desc limit 100";
fightLog.copy = function() {
	var idList = fightLog.selectionMenu();
	if (idList.length == 0) {
		alert("No records selected.");
		return;
	}
	var text;
	var query = "SELECT opponent, winner, prize, experience, myStrength, myDefense, mySpeed, theirStrength,theirDefense,theirSpeed, datetime(datetime,'unixepoch') as dt FROM "
			+ fightLog.tableName
			+ " WHERE uid IN ("
			+ idList.join(",")
			+ ") ORDER BY datetime desc";
	document.getElementById("store").value = "Opponent, Winner, prize, experience, My Strength, My Defense, My Speed, Opponent Strength, Opponent Defense, Opponent Speed, Date/Time\n";
	var stmt = fightLog.DBConn.createStatement(query);
	while (stmt.executeStep()) {
		text = stmt.getString(0) + ", " + stmt.getString(1) + ", "
				+ stmt.getInt32(2) + ", " + stmt.getInt32(3) + ", "
				+ stmt.getDouble(4) + ", " + stmt.getDouble(5) + ", "
				+ stmt.getDouble(6) + ", " + stmt.getDouble(7) + ", "
				+ stmt.getDouble(8) + ", " + stmt.getDouble(9) + ", "
				+ stmt.getString(10) + "\n";
		document.getElementById("store").value = document
				.getElementById("store").value
				+ text;
	}
	document.getElementById("store").focus();
	document.getElementById("store").select();
	goDoCommand("cmd_copy");
	stmt.reset();
	document.getElementById("store").value = "";
	document.getElementById("store").blur();
};

fightLog.makeOppReports = function() {
	var idList = fightLog.selectionMenu();
	if (idList.length == 0) {
		alert("No records selected.");
		return;
	}
	var text;
	var query = "SELECT opponent, theirStrength,theirDefense,theirSpeed, datetime(datetime,'unixepoch') as dt FROM "
			+ fightLog.tableName
			+ " WHERE uid IN ("
			+ idList.join(",")
			+ ") ORDER BY datetime desc";
	var stmt = fightLog.DBConn.createStatement(query);
	var round = 0;
	while (stmt.executeStep()) {
		text = stmt.getString(0) + "\nStrength: " + stmt.getDouble(1)
				+ "\nDefense: " + stmt.getDouble(2) + "\nSpeed: "
				+ stmt.getDouble(3) + "\n\n";
		document.getElementById("store").value = document
				.getElementById("store").value
				+ text;
	}
	// remove trailing line feeds
	document.getElementById("store").value = document.getElementById("store").value
			.replace(/\n\n$/, "");
	document.getElementById("store").focus();
	document.getElementById("store").select();
	goDoCommand("cmd_copy");
	stmt.reset();
	document.getElementById("store").value = "";
	document.getElementById("store").blur();

};
