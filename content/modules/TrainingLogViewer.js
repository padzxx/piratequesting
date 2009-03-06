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

trainingLog = new LogViewer();
trainingLog.tableName = "training";
trainingLog.query = 'SELECT training.id as id, IFNULL(level,"") as level, awake, port, chance, rolled, IFNULL(round(SUM(increase)/SUM(energy),4), "") as ratio, IFNULL(SUM(energy),"") as energy , IFNULL(group_concat(attribute, ", "),"") as attributes, IFNULL(round(sum(increase),4),"") as increase, datetime FROM training left join training_result on training.id = training_id group by training.id order by datetime desc limit 100';
//trainingLog.query = "SELECT uid, attribute, energy, awake, increase, ratio, rolled, chance, port, datetime(datetime,'unixepoch') as dt FROM trainlog ORDER BY datetime desc LIMIT 100";
trainingLog.copyPQ = function() {
	var idList = trainingLog.selectionMenu();
	if (idList.length == 0) {
		alert("No records selected.");
		return;
	}
	var text;
	var query = "SELECT attribute, energy, increase, rolled, chance FROM "
			 " training left join training_result on training.id = training_id WHERE training.id IN (" + idList.join(",")
			+ ") group by training.id ORDER BY datetime desc";
	// document.getElementById("store").value = "Attribute, Energy, Awake,
	// Increase, Ratio, Port, Date/Time\n";
	var stmt = trainingLog.DBConn.createStatement(query);
	while (stmt.executeStep()) {
		if (stmt.getInt32(1) > 0) {
			text = "Trained " + stmt.getInt32(1) + " times and gained "
					+ stmt.getDouble(2) + " " + stmt.getString(0) + "\n";
		} else {
			text = "Failed: Number rolled: " + stmt.getInt32(3)
					+ ". Success chance: " + stmt.getInt32(4) + "." + "\n";
		}
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

trainingLog.copyLog = function() {
	var idList = trainingLog.selectionMenu();
	if (idList.length == 0) {
		alert("No records selected.");
		return;
	}
	var text;
	var query = 'SELECT IFNULL(level,"") as level, awake, port, chance, rolled, IFNULL(SUM(energy),"") as energy , IFNULL(group_concat(energy, ", "),"") as attributes, IFNULL(sum(increase),"") as increase, datetime, IFNULL(round(SUM(increase)/SUM(energy),4), "") as ratio FROM training left join training_result on training.id = training_id '
			+ " WHERE training.id IN ("
			+ idList.join(",")
			+ ") group by training.id ORDER BY datetime desc";
	document.getElementById("store").value = "Level, Attributes, Energy, Awake, Increase, Ratio, Port, Date/Time\n";
	var stmt = trainingLog.DBConn.createStatement(query);
	while (stmt.executeStep()) {
		text = stmt.getInt32(0) + ", " + stmt.getString(7) + ", "
				+ stmt.getInt32(5) + ", " + stmt.getInt32(1) + ", "
				+ stmt.getDouble(8) + ", " + stmt.getString(2) + ", "
				+ stmt.getDouble(10) + ", " + stmt.getString(9) + "\n";
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
