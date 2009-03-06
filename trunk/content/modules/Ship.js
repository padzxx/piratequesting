var piratequesting = top.piratequesting;
var mainWindow = mainWindow || window
			.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIWebNavigation)
			.QueryInterface(Components.interfaces.nsIDocShellTreeItem).rootTreeItem
			.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIDOMWindow);

var sidebar = sidebar || mainWindow.document.getElementById("sidebar");


/**
 * 
 * @namespace
 */
piratequesting.Ship = function() {

	/**
	 * @private
	 * @type String
	 */
	var name = "";
	/**
	 * @private
	 * @type String
	 */
	var type = "";
	/**
	 * @private
	 * @type Number
	 */
	var crewLevel = 0;
	/**
	 * @private
	 * @type Number
	 */
	var progress = 0;
	/**
	 * @private
	 * @type Number
	 */
	var hp = 0;
	/**
	 * @private
	 * @type Number
	 */
	var currentCargo = 0;
	/**
	 * @private
	 * @type Number
	 */
	var maxCargo = 0;
	/**
	 * @private
	 * @type Number
	 */
	var armour = 0;
	/**
	 * @private
	 * @type Number
	 */
	var cannons = 0;

	
	var publish = function () {
		try {
		var sbcd = sidebar.contentDocument; 		
	
		if (piratequesting.sidebar) {
			if (sbcd.getElementById('Ship_tabpanel')) {
				sbcd.getElementById('shipnameval').value = name;
				sbcd.getElementById('shiptypeval').value = type;
				sbcd.getElementById('crewlevelval').value = crewLevel + " [" + progress+"%]";
				sbcd.getElementById('shiphpval').value = hp;
				sbcd.getElementById('cargoval').value = currentCargo +"/" + maxCargo;
				sbcd.getElementById('armourval').value = armour;
				sbcd.getElementById('cannonsval').value = cannons;
			}
		}
		} catch (e) {
				alert(getErrorString(e));
			}
	};
	
	return {
		/**
		 * @param {Document} doc
		 */
		process : function(doc) {
			try {
				//exit if the section doesn't exist
				if (!doc.getElementById("ship_info")) { return; }
				
				var ship_tables = doc.getElementById("ship_info").getElementsByTagName('table');
				if (!ship_tables) {
					return;
				}
				/**
				 * @type HTMLDOMElement
				 */
				var ship_table = ship_tables[0];
				var cells = ship_table.getElementsByTagName('strong');
				
				//cells 0 = ship type and name, 1 = HP, 2 = Cargo, 3 = Cannons, 4 = Armour, 5 = crew level
				
				type= cells[0].getElementsByTagName('a')[0].firstChild.nodeValue
				name = cells[0].lastChild.nodeValue;
				hp = cells[1].firstChild.nodeValue;
				var cargo = cells[2].firstChild.nodeValue.split('/');
				currentCargo = cargo[0];
				maxCargo = cargo[1];
				cannons = cells[3].firstChild.nodeValue;
				armour = cells[4].firstChild.nodeValue;
				var crew = /(\d*?) \[(\d{1,3})%\]/.exec(cells[5].firstChild.nodeValue);
				crewLevel = crew[1];
				progress = crew[2];
				
				publish();
			} catch (e) {
				alert(getErrorString(e));
			}
			
			
		}
		
	}
}();

piratequesting.addLoadProcess("", piratequesting.Ship.process);
