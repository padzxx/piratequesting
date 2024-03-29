var piratequesting = top.piratequesting;

if(!IM_LOADED) {
	//prevent multiple loading of this Manager. It usually doesn't matter too much but this makes a difference
	const IM_LOADED=true;

const SELL = 1;
const MARKET = 2;
const USE = 4;
const EQUIP = 8;
const UNEQUIP = 16;
const RETURN = 32;
const SEND = 64;

var ACTIONS = {
	'sell' : SELL,
	'market': MARKET,
	'use': USE,
	'equip': EQUIP,
	'unequip': UNEQUIP,
	'return': RETURN,
	'send': SEND
};

piratequesting.InventoryManager = function() {

	var logfile = function() {
		var profdir = Components.classes["@mozilla.org/file/directory_service;1"]
				.getService(Components.interfaces.nsIProperties).get(
						"ProfD", Components.interfaces.nsIFile).path;
		var file = Components.classes["@mozilla.org/file/local;1"]
				.createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath(profdir);
		file.append("Inventory.xml");
		return file;
	}();
	
	/**
	 * @type {Document}
	 */
	var inventory; 
	
	function zeroItems() {
		try 
		{
			var items = inventory.evaluate("/inventory/category/item",inventory,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
			for (var i=0,len=items.snapshotLength;i<len;++i) {
				items.snapshotItem(i).setAttribute("quantity",0);
				items.snapshotItem(i).setAttribute("equipped",0);
			}
		}
		catch (e)
		{
			dumpError(e);
		}
	}
	
	function write () {
		try {
			var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
	                         .createInstance(Components.interfaces.nsIFileOutputStream);
			// clear the file for writing the new doc
			foStream.init(logfile, 0x02 | 0x08 | 0x20, 0666, 0); // write,
																// create,
																// truncate
			var ser = new XMLSerializer();
			// write the serialized XML to file
			ser.serializeToStream(inventory, foStream, ""); 
			foStream.close();	
		} catch (e) {
			dumpError(e);
		}
	}
	
	function makeNewInventory () { 
		var doc = document.implementation.createDocument("","inventory",null);
		
		var head = doc.createElement("category");
		head.setAttribute("name", "head");
		head.setAttribute("id","5");
		
		var armour = doc.createElement("category");
		armour.setAttribute("name", "armour");
		armour.setAttribute("id","2");
		
		var weapons = doc.createElement("category");
		weapons.setAttribute("name", "weapons");
		weapons.setAttribute("id","1");
		
		var offhand = doc.createElement("category");
		offhand.setAttribute("name", "offhand");
		offhand.setAttribute("id","11");
		
		var edibles = doc.createElement("category");
		edibles.setAttribute("name", "edibles");
		edibles.setAttribute("id","3");
		
		var grenades = doc.createElement("category");
		grenades.setAttribute("name", "grenades");
		grenades.setAttribute("id","6");
		
		var miscellaneous = doc.createElement("category");
		miscellaneous.setAttribute("name", "miscellaneous");
		miscellaneous.setAttribute("id","8");
		
		var poisons = doc.createElement("category");
		poisons.setAttribute("name", "poisons");
		poisons.setAttribute("id","4");
		
		var tokens = doc.createElement("category");
		tokens.setAttribute("name", "tokens");
		tokens.setAttribute("id","12");
		
		var feet = doc.createElement("category");
		feet.setAttribute("name", "feet");
		feet.setAttribute("id","15");
		
		var coats = doc.createElement("category");
		coats.setAttribute("name", "coats");
		coats.setAttribute("id","16");
		
		var leggings = doc.createElement("category");
		leggings.setAttribute("name", "leggings");
		leggings.setAttribute("id","17");
		
		var accessories = doc.createElement("category");
		accessories.setAttribute("name", "accessories");
		accessories.setAttribute("id","18");
		
		var valuables = doc.createElement("category");
		valuables.setAttribute("name", "valuables");
		valuables.setAttribute("id","300");
		
		doc.documentElement.appendChild(head);
		doc.documentElement.appendChild(armour);
		doc.documentElement.appendChild(weapons);
		doc.documentElement.appendChild(offhand);
		doc.documentElement.appendChild(edibles);
		doc.documentElement.appendChild(grenades);
		doc.documentElement.appendChild(miscellaneous);
		doc.documentElement.appendChild(poisons);
		doc.documentElement.appendChild(tokens);
		doc.documentElement.appendChild(coats);
		doc.documentElement.appendChild(leggings);
		doc.documentElement.appendChild(feet);
		doc.documentElement.appendChild(accessories);
		doc.documentElement.appendChild(valuables);
		return doc;
	}
	
	function load() {
		var ph = Components.classes["@mozilla.org/network/protocol;1?name=file"]
				.createInstance(Components.interfaces.nsIFileProtocolHandler);
		var logF = ph.getURLSpecFromFile(logfile);

		var log = new XMLHttpRequest();
		log.open("GET", logF, true);
		log.onerror = function(e) {
			onError(e);
		}


		log.onreadystatechange = function() {
			if (log.readyState == 4) {
				try 
				{
					var temp_inventory = log.responseXML;
					//if there isn't a 'category' element with id 300 (valuables), then it belongs to one of the old systems. 
					if (temp_inventory.evaluate("boolean(//category[@id = '300'])",temp_inventory,null,XPathResult.BOOLEAN_TYPE,null).booleanValue) {
						pqdump("Current inventory file found\n");
						inventory = temp_inventory;
						document.fire('piratequesting:InventoryUpdated');
					} else {
						pqdump("Found old inventory file. Making new Inventory.\n");
						inventory = makeNewInventory();
						document.fire('piratequesting:InventoryUpdated');
					}
				} catch (e) {
					dumpError(e);
				}
			}
		}
		log.send(null);
	}
	
	function setPoints () {
		if (piratequesting.Bank) {
			var points = piratequesting.Bank.getPoints();
			
			var attributes = {name:"Points", id:"points", action_id: "points", image: "chrome://piratequesting/content/modules/points_dice.gif", quantity:points, actions: MARKET, cost: 0};
			var item_check = inventory.evaluate("/inventory/item[@id='points']", inventory, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null)
			var item;
			if (item_check.snapshotLength > 0 ) {
				item = item_check.snapshotItem(0); 
				item.setAttributes(attributes);
			} else {
				item = inventory.newElement("item",attributes);
				inventory.documentElement.appendChild(item);

			}
			return item;					
		} else { dumpError("Error getting points for inventory\n"); return false; }
	}
	
	var ajax;
	
	if (logfile.exists()) 
	{
		load();
	}
	else
	{
		inventory = makeNewInventory();
	}
	
	return {
		
		getInventory : function () {
			return inventory; 
		},

		clear : function() {
			for (var category in categories) {
				category.clear();
			}
			//add database clear.
		},
		setPoints : function(quantity) {
			categories.points.setQuantity(quantity);
		},

		
		checkInventory : function() {
			ajax = AjaxRequest(piratequesting.baseURL + "/index.php?on=inventory", { onError: function() { pqdump("Error occurred while updating inventory\n"); }, proc:true });
		},

		checkItemGuide : function() {
			ajax = AjaxRequest(piratequesting.baseURL + "/index.php?on=item_guide", { onError: function() { pqdump("Error occurred while updating item guide\n"); }, proc:true });
		},
		
		processInventory: function(doc){
			pqdump("PQ: Processing Inventory Page\n",PQ_DEBUG_STATUS);
			var addItem, getItems, getEquip;
			//do nothing if the swapspace isn't there. That means the inventory page is in a different mode. 
			//pqdump("\n\n"+ doc.evaluate("//div[@id='contentarea']/form/table[1]",doc,null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null).snapshotItem(0).innerHTML + "\n\n");
			if (doc.evaluate("not(boolean(descendant-or-self::div[@id='swapspace']))", doc, null, XPathResult.BOOLEAN_TYPE,null).booleanValue) {  return; }
			//not the new or old system... something weird happened so bail.
			
			pqdump("\tReset item quantities\n", PQ_DEBUG_STATUS);
			zeroItems();
			
			//pqdump("\tSetting coin and point info\n", PQ_DEBUG_STATUS);
			//setCoinsPoints(doc);
			
			pqdump("\tExtracting Item Categories...", PQ_DEBUG_STATUS);
			var categories = inventory.evaluate("/inventory/category", inventory, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
			var category,items,item, numCategories;
			numCategories = categories.snapshotLength;
			pqdump("\t\tCategories found: "+numCategories+"\n");
			
			if (piratequesting.baseTheme == piratequesting.DEFAULT_THEME) {
				pqdump("\tTheme in use: Default\n", PQ_DEBUG_STATUS);   
				//using the new system 
				addItem = function (category, item, equipped) {
					try {
						var name;
						//first need to check if the node actually has something equipped. The best way is to check if the equipment has a name associated with an item_view link. if there's no item_view then it's not a valid item
						if (!item || !category) return;
						if (name = doc.evaluate("descendant-or-self::a[@class='item_view']", item, null, XPathResult.STRING_TYPE,null)) {
							if (!name.stringValue) return;
							name = name.stringValue;
							var image = doc.evaluate("descendant-or-self::img[1]/@src", item, null, XPathResult.STRING_TYPE,null).stringValue;
							
							var id = doc.evaluate("substring-before(substring-after(descendant-or-self::a[@class='item_view']/@onclick,'id='),'&')", item, null, XPathResult.STRING_TYPE,null).stringValue;
							
							
							var value = (/(\$[.,\d]+)/.exec(doc.evaluate("descendant-or-self::p[@class='price']", item, null, XPathResult.STRING_TYPE,null).stringValue));
							if (value && value.length > 0) value = value[1].toNumber();
							else value = 0;
							
							
							var action_id = doc.evaluate("substring-after(descendant-or-self::a[starts-with(@href,'index.php?on=inventory&action=')]/@href,'id=')", item, null, XPathResult.STRING_TYPE,null).stringValue;
							var quantity = doc.evaluate("substring-before(substring-after(.,'[x'),']')", item, null, XPathResult.STRING_TYPE,null).stringValue.toNumber();
							//this will only get the non-'use' actions. If there's a way to do group_concat, I don't know it.
							var action_list =  doc.evaluate(".//div[@class='links']/a/@class", item, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
							var actions = 0;
							for (var j=0,alen = action_list.snapshotLength; j<alen;++j) {
								actions = actions | Number(ACTIONS[action_list.snapshotItem(j).nodeValue]);
							}
							var attributes = {name:name, id:id, action_id: action_id, image:image, quantity:quantity, value:value,actions:actions, equipped:((equipped)?equipped:0)};
						
							var item_check = inventory.evaluate("./item[@id='"+id+"']", category, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null)
							if (item_check.snapshotLength > 0 ) {
								var item = item_check.snapshotItem(0); 
								item.setAttributes(attributes);
							} else {
								var item = inventory.newElement("item",attributes);
								category.insertBefore(item,category.firstChild);
			
							}
						}
					}catch (error) { pqdump("\n" + getErrorString(error) + "\n");}
				}
				getItems = function (category) {
					return doc.evaluate("(//div[@id='itemsec_"+ category.getAttribute("id") +"'])[1]/div[@class='box']", doc, null, XPathResult.ANY_TYPE,null);
					
				}
				
				getEquip = function () {
					//currently the id is 'equiped' which is a retarded spelling mistake.... amongst many. 
					return doc.evaluate("//div[@id='equipped' or @id='equiped'][1]/div",doc,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
				}
				
				
			} else if (piratequesting.baseTheme == piratequesting.CLASSIC_THEME) {
				pqdump("\tTheme in use: Classic\n", PQ_DEBUG_STATUS);
				
				getEquip = function () {
					return doc.evaluate("//div[@id='contentarea']/form//table[1]/tbody[contains(tr[1]/td[last()],'Equipped')]/tr[2]/td//td[not(@align)]",doc,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
				}
							
				getItems = function (category) {
					return doc.evaluate("(//div[@id='itemsec_"+ category.getAttribute("id") +"'])[1]/table/tbody/tr[last()]/td/table/tbody/tr[position() mod 2 = 1]/td", doc, null, XPathResult.ANY_TYPE,null);
				}
				addItem = function (category,item,equipped) {
					try {
					var name;
					//first need to check if the node actually has something equipped. The best way is to check if the equipment has a name associated with an item_view link. if there's no item_view then it's not a valid item
					if (!item || !category) return;
					if (name = doc.evaluate("descendant-or-self::a[@class='item_view']", item, null, XPathResult.STRING_TYPE,null)) {
						if (!name.stringValue) return;
						name = name.stringValue;
						pqdump("\t\t\t\t"+name+"...\n");
						
						var image = doc.evaluate("descendant-or-self::img[1]/@src", item, null, XPathResult.STRING_TYPE,null).stringValue;
						
						var id = doc.evaluate("substring-before(substring-after(descendant-or-self::a[@class='item_view']/@onclick,'id='),'&')", item, null, XPathResult.STRING_TYPE,null).stringValue;
						
						
						var value = (/(\$[.,\d]+)/.exec(doc.evaluate("string(.)", item, null, XPathResult.STRING_TYPE,null).stringValue));
						if (value && value.length > 0) value = value[1].toNumber();
						else value = 0;
						
						
						var action_id = doc.evaluate("substring-after(descendant-or-self::a[starts-with(@href,'index.php?on=inventory&action=')]/@href,'id=')", item, null, XPathResult.STRING_TYPE,null).stringValue;
						var quantity = doc.evaluate("substring-before(substring-after(.[a[@class='item_view']],'[x'),']')", item, null, XPathResult.STRING_TYPE,null).stringValue.toNumber();
						//this will only get the non-'use' actions. If there's a way to do group_concat, I don't know it.
						var action_list =  doc.evaluate(".//a[starts-with(@href,'index.php?on=inventory&action=')]/text()|.//input/@value", item, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
						var actions = 0;
						for (var j=0,alen = action_list.snapshotLength; j<alen;++j) {
							actions = actions | Number(ACTIONS[action_list.snapshotItem(j).nodeValue]);
						}
						var attributes = {name:name, id:id, action_id: action_id, image:image, quantity:quantity, value:value,actions:actions, equipped:((equipped)?equipped:0)};
					
						var item_check = inventory.evaluate("./item[@id='"+id+"']", category, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null)
						if (item_check.snapshotLength > 0 ) {
							var item = item_check.snapshotItem(0); 
							item.setAttributes(attributes);
						} else {
							var item = inventory.newElement("item",attributes);
							category.insertBefore(item,category.firstChild);
		
						}
					} 
					}catch (error) { dumpError(error);}
				}
					
			} else {
				pqdump('Theme check failure: Not Default or Classic.\n', PQ_DEBUG_ERROR);
			}
			
			try {
			
				for (var i = 0; i<numCategories;++i){
					/**
					 * @type {Node}
					 */
					category = categories.snapshotItem(i);
						//this gem gets each item in a cateogory from the inventory page. It does not, however, ghet the equipped items which have to be acquired separately below
					// (//div[@id='"+ category.getAttribute("name") +"'])[1] is used because FM adds each category twice (bug?) and we only want to add the items from one of them.
					// tr[position() mod 2 = 1] is used because every second row is empty
					items = getItems(category);
					while (item = items.iterateNext()) {
						addItem(category,item,0);
					}
					
									
				}
				//now to get the equipped items
				//tbody[contains(tr[1]/td[last()],'Equipped')] is used to find the correct table. -- deprecated. there was enough specificity in other areas that this was unnecessary given its cost
				////td[not(@align)] is used because FM puts out 4 empty columns, carrying the align attribute, then 4 columns with the data we want.
				items = getEquip();
				//There will be exactly 4 results unless FM adds a new category to the equipment... in which case bigger changes need to happen.
				//There should also be 4 categories selected so we'll just use the same index and need to be careful that the order is the same
				
				//Well FM added 4 new equipment types so this had to be modified -- order is important. 
				categories = inventory.evaluate("/inventory/category[@id='5' or @id='2' or @id='1' or @id='11' or @id='16' or @id='17' or @id='15' or @id='18'] ", inventory, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
				for (var i = 0, len=categories.snapshotLength; i<len;++i){
					/**
					 * @type {Node}
					 */
					category = categories.snapshotItem(i);
					item = items.snapshotItem(i);
					
					addItem(category,item,1);
				}
			} catch(e) {
				dumpError(e);
			}
			//pqdump("\n\nCurrent Inventory:\n"+piratequesting.InventoryManager+"\nTotal Number of items:");
			//pqdump(inventory.evaluate("/inventory/category/item[@quantity>0]", inventory, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null).snapshotLength+"\n");
			write();
			//pqdump("firing event");
			document.fire('piratequesting:InventoryUpdated');
			
		},
		
		processItemGuide: function (doc) {
			try{
			
				var categories = inventory.evaluate("//category", inventory, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
			
               			
			
				for (var i = 0, len=categories.snapshotLength; i<len;++i){
					/**
					 * @type {Node}
					 */
					var category = categories.snapshotItem(i);
					var items = doc.evaluate("//div[@id='"+ category.getAttribute("name") +"']//table[@class='item_guide']", doc, null, XPathResult.ANY_TYPE,null);
					while (item = items.iterateNext()) {
						var name = doc.evaluate("descendant-or-self::a[@class='item_view']", item, null, XPathResult.STRING_TYPE,null).stringValue;
						var id = doc.evaluate("substring-before(substring-after(descendant-or-self::a[@class='item_view']/@onclick,'id='),'&')", item, null, XPathResult.STRING_TYPE,null).stringValue;
						var image = doc.evaluate("descendant-or-self::img[1]/@src", item, null, XPathResult.STRING_TYPE,null).stringValue;
						var cost = (/(\$[.,\d]+)/.exec(doc.evaluate("descendant-or-self::div[@class='bot']", item, null, XPathResult.STRING_TYPE,null).stringValue))[1].toNumber();
						
						var description = doc.evaluate("normalize-space(descendant-or-self::td[@class='desc'][1])", item, null, XPathResult.STRING_TYPE,null).stringValue;
						var features = doc.evaluate("normalize-space(descendant-or-self::table//td[B[.='Features:']])", item, null, XPathResult.STRING_TYPE,null).stringValue;
						features = features.split(/[^\+\-\:%\s\w]/).splice(1);
						var attributes = {name:name, id:id, image:image, cost:cost};
						///[+-:%\s\w]/
						function addFeatures() {
							for (var j = 0, flen = features.length; j<flen;++j) {
								var feature = features[j].trim().replace(/([A-Za-z\s]+):? ?([\-\+,.\d%]+)/,"$1: $2").split(": ");
								item.insert(inventory.newElement("feature", { type: feature[0], value: feature[1] } ));
							}
						}
						var item_check = inventory.evaluate("./item[@id='"+id+"']", category, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null)
						if (item_check.snapshotLength > 0 ) {
							item = item_check.snapshotItem(0); 
							item.setAttributes(attributes);
							while(item.hasChildNodes()) item.removeChild(item.firstChild);
							item.insert(inventory.newElement("description").update(description));
							addFeatures();
							
						} else {
							item = inventory.newElement("item",attributes).insert(inventory.newElement("description").update(description));
							addFeatures();
							category.insert(item);
	
						}
					}
				}
				var coinsnpts = doc.getElementById('coinsnpts');
				// check to see if it exists
				if (coinsnpts) {
					// the first <a> should be the points, and since it has
					// no id, we just have to hope it stays that way
					var points = coinsnpts.getElementsByTagName('a')[0].firstChild.nodeValue.toNumber();
					var attributes = {name:"Points", id:"points", action_id: "points", image: "chrome://piratequesting/content/modules/points_dice.gif", quantity:points, actions: MARKET, cost:0 };
					var item_check = inventory.evaluate("/inventory/item[@id='points']", inventory, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null)
					if (item_check.snapshotLength > 0 ) {
						var item = item_check.snapshotItem(0); 
						item.setAttributes(attributes);
					} else {
						var item = inventory.newElement("item",attributes);
						inventory.documentElement.appendChild(item);
	
					}
										
				}
				write();
				document.fire('piratequesting:InventoryUpdated');
			}catch(error) { dumpError(error); }
		},
		
		process:function() {
			pqdump("PQ: Updating points for inventory.\n", PQ_DEBUG_STATUS);
			var item;
			if (item = setPoints()) {	
				write();
				document.fire('piratequesting:InventoryPointsUpdated',item);
			} 
		},
		
		processRaw:function(text, url, data) {
			try{
				var response_object = JSON.parse(text);
				
				if (data.action == 'use') {
  					var itemID = data.id;
  					var left = response_object.left;
  					var item_check = inventory.evaluate("//item[@action_id="+itemID+"]",inventory,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
					if (item_check.snapshotLength > 0 ) {
						var item = item_check.snapshotItem(0); 
						item.setAttribute("quantity",left);
						document.fire('piratequesting:InventoryUpdated', item);
					} else {
							piratequesting.InventoryManager.checkInventory();
	  				}
				}
  			} catch (error) {
				dumpError(error);
			}
		
		},
		
		toString:function() {
			return ((new XMLSerializer()).serializeToString(inventory));
		}
	}
}();

document.addEventListener("piratequesting:BankUpdated",piratequesting.InventoryManager.process, false);

piratequesting.addLoadProcess(new RegExp("index.php\\?on=inventory",""),piratequesting.InventoryManager.processInventory);
piratequesting.addLoadProcess(new RegExp("index.php\\?on=item_guide",""),piratequesting.InventoryManager.processItemGuide);
//piratequesting.addLoadProcess(new RegExp("index.php(?!\\?on=item_guide|\\?on=inventory)",""),piratequesting.InventoryManager.process);
piratequesting.addRawProcessor(/index.php\?ajax=items&json/,piratequesting.InventoryManager.processRaw, piratequesting.InventoryManager);
}