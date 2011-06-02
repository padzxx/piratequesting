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

	/**
	 * publishes the ship data to the sidebar. data comes from info stored by scraper/other sources 
	 * @private
	 */
	var publish = function () {
		try {
		var sbcd = sidebar.contentDocument; 		
	
		if (piratequesting.sidebar) {
			//tests the parent, first and last child... should be enough. if need be, 'll assign them all to variable and test/use them
			if (sbcd.getElementById('Ship_tabpanel') && sbcd.getElementById('shipnameval') && sbcd.getElementById('cannonsval')) {
				sbcd.getElementById('shipnameval').value = name;
				sbcd.getElementById('shiptypeval').value = type;
				sbcd.getElementById('crewlevelval').value = crewLevel + " [" + progress+"%]";
				sbcd.getElementById('shiphpval').value = hp;
				sbcd.getElementById('cargoval').value = currentCargo +" / " + maxCargo;
				sbcd.getElementById('armourval').value = armour;
				sbcd.getElementById('cannonsval').value = cannons;
			}
		}
		} catch (e) {
				dumpError(e);
			}
	};

	
	return {
		/**
		 * @param {Document} doc
		 */
		process : function(doc) {
			try {
				if (piratequesting.baseTheme == piratequesting.DEFAULT_THEME) {
					var sb = doc.getElementById("shipbox");
					if (!sb) return; 
					//new page style as of 2009/04/29
					
					name = doc.evaluate('./div[@class="profile_ship_top"]//a[@href="index.php?on=ship"]', sb, null, XPathResult.STRING_TYPE, null).stringValue;
					
					var type_lookup = [
						"Sloop", 
						"Schooner", 
						"Barques", 
						"Warship",
						"Merchant Galleon",
						"English Galleon",
						"Spanish Galleon",
						"Caravel",
						"Row Boat",
						"French Galleon",
						null, //no ship for id 11
						"Phantom Galleon",
						null, //no ship for id 13
						"Marauder Galleon"
						];
					
					//type = doc.evaluate('.//div[@class="user_ship"]//img/@title', sb, null, XPathResult.STRING_TYPE, null).stringValue; //just My ship for now. need to ask FM to change this.
					
					var type_id = doc.evaluate('substring-after(substring-before(.//div[@class="user_ship"]//img/@src,"-small.gif"),"ships/")', sb, null, XPathResult.NUMBER_TYPE, null).numberValue;
					
					//minus one as array is zero indexed. should be replaced by a more abstract system
					type = type_lookup[type_id-1];
					
					crewLevel = doc.evaluate('id("header_sea_level")', doc, null, XPathResult.STRING_TYPE, null).stringValue.toNumber();
					progress = doc.evaluate('substring-before(substring-after(id("header_sea_progress")/@style,"width: "),"%")', doc, null, XPathResult.STRING_TYPE, null).stringValue;
					hp = doc.evaluate('id("seastatbars")//tbody/tr[2]/td/div[@class="ship-prog-empty"]/@title', sb, null, XPathResult.STRING_TYPE, null).stringValue;
					var cargo = doc.evaluate('id("seastatbars")//tbody/tr[6]/td/div[@class="ship-prog-empty"]/@title', sb, null, XPathResult.STRING_TYPE, null).stringValue.split(' / ');
					currentCargo = cargo[0];
					maxCargo = cargo[1];
					cannons = doc.evaluate('id("ship-prog-bar-cannons")/@title', sb, null, XPathResult.STRING_TYPE, null).stringValue;
					name = doc.evaluate('//div[@class="user_role"]//a[@href="/index.php?on=ship"]/text()', sb, null, XPathResult.STRING_TYPE, null).stringValue;
					armour = "N/A";
				}
				else 
					if (piratequesting.baseTheme == piratequesting.CLASSIC_THEME) {
						var si = doc.getElementById("ship_info");
						if (!si) {
							return;
						}
						
						type = doc.evaluate('.//table/tbody/tr[1]/td//a', si, null, XPathResult.STRING_TYPE, null).stringValue;
						name = doc.evaluate('.//table/tbody/tr[1]/td//strong/text()', si, null, XPathResult.STRING_TYPE, null).stringValue;
						hp = doc.evaluate('.//table/tbody/tr[2]/td[2]', si, null, XPathResult.STRING_TYPE, null).stringValue.toNumber();
						var cargo = doc.evaluate('.//table/tbody/tr[3]/td[2]', si, null, XPathResult.STRING_TYPE, null).stringValue.split('/');
						currentCargo = cargo[0];
						maxCargo = cargo[1];
						cannons = doc.evaluate('.//table/tbody/tr[4]/td[2]//strong/text()', si, null, XPathResult.STRING_TYPE, null).stringValue.toNumber();
						armour = doc.evaluate('.//table/tbody/tr[5]/td[2]//strong/text()', si, null, XPathResult.STRING_TYPE, null).stringValue.toNumber();
						var crew = doc.evaluate('.//table/tbody/tr[6]/td[2]//strong/text()', si, null, XPathResult.STRING_TYPE, null).stringValue;
						crew = /(\d*?) \[(\d{1,3})%\]/.exec(crew);
						crewLevel = crew[1];
						progress = crew[2];
						
					}	
				publish();
			} catch (e) {
				dumpError(e);
			}
			
			
		},
		processRaw: function(text) {
			try {
				if (text) {
					var response_object = JSON.parse(text);
					
					cannons = response_object.cannons + " / " + response_object.cannons_max;
					
					response_object = toNumberSet(response_object);
					
					crewLevel = response_object.crew_level;
					progress = response_object.crew;
					
					publish();
				}
			} 
			catch (error) {
				dumpError(error);
			}
	}
		
	}
}();

piratequesting.addLoadProcess("", piratequesting.Ship.process);
piratequesting.addRawProcessor(/index.php\?ajax=(events_ajax&action=all_status_update|train|items&json)/, piratequesting.Ship.processRaw, piratequesting.Ship);
