var piratequesting = top.piratequesting;

/**
 * Item creates a new inventory item
 * 
 * @class
 * @param {String}
 *            item_name - name of the inventory item
 * @param {String}
 *            item_type - type of the inventory item (e.g. "weapon")
 * @param {Integer}
 *            item_quantity - quantity of the inventory item
 * @param {String}
 *            item_imgsrc - source of the image for the inventory item
 * @param {String}
 *            item_price - price of the inventory item
 * @param {String}
 *            item_actions - Array of Strings of actions available
 */
function Item(item_name, item_type, item_quantity, item_imgsrc, item_id, item_price, item_actions) {
	var type = item_type;
	var imgsrc = item_imgsrc;
	var name = item_name;
	var quantity = item_quantity;
	var id = item_id;
	var price = item_price;
	var actions = item_actions;

	this.setQuantity = function(qty) {
		quantity = addCommas(qty);
	};
	/**
	 * @param {Number}
	 *            how_much
	 */
	this.reduce = function(how_much) {
		quantity = stripCommas(quantity) - how_much;
		if (quantity < 0)
			quantity = 0;
		quantity = addCommas(quantity);
		return quantity;
	};

	this.hasAction = function(action_type) {
		var rv = false;
		for (var action in actions) {
			if (action == action_type) {
				rv = true;
				break;
			}
		}
		return rv;
	};

	this.output = function() {
		return {
			type : type,
			imgsrc : imgsrc,
			name : name,
			quantity : quantity,
			id : id,
			price : price,
			actions : actions
		}
	};

	this.clear = function() {
		quantity = 0;
	};

	this.generateXML = function(xmlDoc) {
		var newNode = xmlDoc.createElement("item");
		var newName = xmlDoc.createElement("name");
		var newType = xmlDoc.createElement("type");
		var newQuantity = xmlDoc.createElement("quantity");
		var newSource = xmlDoc.createElement("imgsrc");
		var newID = xmlDoc.createElement("id");
		var newPrice = xmlDoc.createElement("price");
		var newActions = xmlDoc.createElement("actions");

		newName.appendChild(xmlDoc.createTextNode(name));
		newType.appendChild(xmlDoc.createTextNode(type));
		newQuantity.appendChild(xmlDoc.createTextNode(quantity));
		newSource.appendChild(xmlDoc.createTextNode(imgsrc));
		newID.appendChild(xmlDoc.createTextNode(id));
		newPrice.appendChild(xmlDoc.createTextNode(price));
		newActions.appendChild(xmlDoc.createTextNode(actions.join("|")));

		newNode.appendChild(newName);
		newNode.appendChild(newType);
		newNode.appendChild(newQuantity);
		newNode.appendChild(newSource);
		newNode.appendChild(newID);
		newNode.appendChild(newPrice);
		newNode.appendChild(newActions);

		return newNode;
	};

}

/**
 * Category creates a collection of Inventory items
 * 
 * @constructor
 * @param (String)
 *            type - Text identifier of the category type
 * @param (Integer)
 *            cat_number - Number identifying the associated item market
 *            category
 */
function Category(type, cat_number) {
	var items = new Array();
	this.type = type;
	this.cat = cat_number;

	/**
	 * 
	 * @param {Item} item
	 */
	this.AddItem = function(item) {
		items.push(item);
	};
	this.GetItemAtIndex = function(index) {
		return items[index];
	};
	this.RemoveItemAtIndex = function(index) {
		items.splice(index, 1);
	};
	this.HasItems = function() {
		return (items.length > 0);
	};
	this.FirstItem = function() {
		return (items.length > 0) ? items[0] : null;
	};
	this.LastItem = function() {
		return (items.length > 0) ? items[items.length - 1] : null;
	};
	this.clear = function() {
		items = new Array();
	};
	this.count = function() {
		return items.length;
	};

	this.GetItemById = function(id) {
		var i = null;
		for (var item in items) {
			if (item.id == id) {
				i = item;
				break;
			}
		}
		return i;
	};

	/**
	 * generateXML creates xml objects for the components of this category
	 * 
	 * @param (XMLDocument)
	 *            xmlDoc - xml document in which to create the items
	 * @returns newNode
	 * @type (Node)
	 * @member Category
	 */
	this.generateXML = function(xmlDoc) {
		var newNode = xmlDoc.createElement("category");
		var newCat = xmlDoc.createElement("cat");
		var newType = xmlDoc.createElement("type");

		newCat.appendChild(xmlDoc.createTextNode(this.cat));
		newType.appendChild(xmlDoc.createTextNode(this.type));

		newNode.appendChild(newCat);
		newNode.appendChild(newType);
		for (var item in items) {
			newNode.appendChild(item.generateXML(xmlDoc));
		}

		return newNode;
	}
}

piratequesting.Inventory = function() {

	var categories = {
		edibles : new Category("edibles", 3),
		equipment : new Category("equipment", null),
		head : new Category("head", 5),
		weapons : new Category("weapon", 1),
		armour : new Category("armor", 2),
		offhand : new Category("offhand", 11),
		grenades : new Category("grenade", 6),
		miscellaneous : new Category("miscellaneous", 8),
		poisons : new Category("poison", 4),
		tokens : new Category("tokens", 12),
		points : new Item("Points", "point", 0,
				"chrome://piratequesting/content/points_dice.gif", "points",
				null, ["market"])
	}

	return {

		clear : function() {
			for (var category in categories) {
				category.clear();
			}
		},
		setPoints : function(quantity) {
			categories.points.setQuantity(quantity);
		},

		//TODO replace this with database 
		exists : function() {
			var profdir = Components.classes["@mozilla.org/file/directory_service;1"]
					.getService(Components.interfaces.nsIProperties).get(
							"ProfD", Components.interfaces.nsIFile).path;
			var file = Components.classes["@mozilla.org/file/local;1"]
					.createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(profdir);
			file.append("Inventory.xml");

			var ph = Components.classes["@mozilla.org/network/protocol;1?name=file"]
					.createInstance(Components.interfaces.nsIFileProtocolHandler);
			var logfile = ph.getURLSpecFromFile(file);

			return file.exists();
		},
		//TODO replace this with database
		clear : function() {
			piratequesting.Inventory.clearAll();
			try {
				var profd = Components.classes["@mozilla.org/file/directory_service;1"]
						.getService(Components.interfaces.nsIProperties).get(
								"ProfD", Components.interfaces.nsIFile).path;
				var file = Components.classes["@mozilla.org/file/local;1"]
						.createInstance(Components.interfaces.nsILocalFile);
				file.initWithPath(profd);
				file.append("Inventory.xml");
				file.remove(true);
			} catch (e) {
				alert(e.message);
			}
		},

		//TODO be sure to pass the check on to global parsing
		checkInventory : function(extra) {
			piratequesting.Inventory.checked = true;
			var http = new XMLHttpRequest();
			var url = piratequesting.baseurl + "/index.php?on=inventory";
			// alert(url);
			http.open("GET", url, true);
			http.onerror = function(e) {
				onError(e);
			}
			piratequesting.AJAX.edibleshttp = http;
			http.onreadystatechange = function() {
				if (http.readyState == 4) {
					if (http.status == 200) {
						// debugResponse(http.responseText);
						piratequesting.Inventory.update(http.responseText);
						piratequesting.Player.parse(http.responseText);
						if (extra != null)
							eval(extra);
					} else {
						alert("Inventory update failed due to error");
						if (extra != null)
							eval(extra);
					}
				}
			}
			http.send(null);
		},

		//XXX Move the adjusted stuff out into a different module. Tools section probably
		adjustedStrength : function() {
			var item, adj, stat, total = 0;
			stat = piratequesting.Player.attributes.strength;
			stat = stripCommas(stat);
			total = Number(stat);
			for (var i = 0; i < piratequesting.Inventory.equipment.count(); i++) {
				if (piratequesting.Inventory.equipment.GetItemAtIndex(i).name != "Nothing") {
					item = piratequesting.ItemGuide
							.getItemByName(piratequesting.Inventory.equipment
									.GetItemAtIndex(i).name);
					for (var j = 0; j < item.count(); j++) {
						adj = item.getAdjustment(j);
						if (adj.type == "Strength") {
							total = total + adj.adjust(stat);
						}
					}
				}
			}
			return Math.round((Number(total)) * 10) / 10;
		},

		adjustedDefense : function() {
			var item, adj, stat, total = 0;
			stat = piratequesting.Player.attributes.defense;
			stat = stripCommas(stat);
			total = Number(stat);
			for (var i = 0; i < piratequesting.Inventory.equipment.count(); i++) {
				if (piratequesting.Inventory.equipment.GetItemAtIndex(i).name != "Nothing") {
					item = piratequesting.ItemGuide
							.getItemByName(piratequesting.Inventory.equipment
									.GetItemAtIndex(i).name);
					for (var j = 0; j < item.count(); j++) {
						adj = item.getAdjustment(j);
						if (adj.type == "Defense") {
							total = total + adj.adjust(stat);
						}
					}
				}
			}
			return Math.round((Number(total)) * 10) / 10;
		},

		adjustedSpeed : function() {
			var item, adj, stat, total = 0;
			stat = piratequesting.Player.attributes.speed;
			stat = stripCommas(stat);
			total = Number(stat);
			// alert(total);
			// alert(piratequesting.Inventory.equipment.count());
			for (var i = 0; i < piratequesting.Inventory.equipment.count(); i++) {
				if (piratequesting.Inventory.equipment.GetItemAtIndex(i).name != "Nothing") {
					item = piratequesting.ItemGuide
							.getItemByName(piratequesting.Inventory.equipment
									.GetItemAtIndex(i).name);
					// alert(item.count());
					for (var j = 0; j < item.count(); j++) {
						adj = item.getAdjustment(j);
						if (adj.type == "Speed") {
							total = total + adj.adjust(total);
							// alert(total);
						}
					}
				}
			}
			return Math.round((Number(total)) * 10) / 10;
		},

		adjustedTotal : function() {
			return Math.round(piratequesting.Inventory.adjustedStrength()
					+ piratequesting.Inventory.adjustedDefense()
					+ piratequesting.Inventory.adjustedSpeed());
		},

		//TODO Privatize!
		makeTooltip : function(id, text) {
			var tt, vb, l;
			var labelset;
			var emptytest = /^[\s]*$/;
			tt = document.createElement("tooltip");
			vb = document.createElement("vbox");
			labelset = text.split("<br>");
			for (var label in labelset) {
				if (!emptytest.test(label)) {
					l = document.createElement("label");
					l.setAttribute("value", label);
					vb.appendChild(l);
				}
			}
			tt.setAttribute("id", "tt" + id);
			tt.position = "end_before";
			tt.appendChild(vb);

			return tt;
		},
		//TODO Privatize!
		updateEdiblesList : function() {
			var createEdible = function(label, value) {
				var menuitem = document.createElement('menuitem');
				menuitem.setAttribute('label', label);
				menuitem.setAttribute('value', value);
				return menuitem;
			};
			var edibleitems = document.getElementById('edibleitems');
			var edibleslist = document.getElementById('edibleslist');
			var edible;
			var pickme;
			try {
				if (edibleitems.hasChildNodes())
					pickme = edibleslist.selectedItem.value;
			} catch (e) {
				// this is here just in case the user hasn't selected
				// anything before the second update
			}
			// remove the old edibles
			while (edibleitems.hasChildNodes()) {
				edibleitems.removeChild(edibleitems.childNodes[0]);
			}
			for (var i = 0; i < piratequesting.Inventory.edibles.count(); i++) {
				edible = piratequesting.Inventory.edibles.GetItemAtIndex(i);
				edibleitems.appendChild(createEdible(edible.name + ' [x'
								+ edible.quantity + ']', edible.id));
				if (edible.id == pickme)
					edibleslist.selectedIndex = i;
			}
		},
		/*
		 * var updatePoints = function (value) { this.points = new
		 * Item("Points", "point", value,
		 * "chrome://piratequesting/content/points_dice.jpg", l, null, null,
		 * ["market"]); }
		 */
		//TODO Privatize!
		updateInventoryList : function() {

			var newInventoryItem = function(item, cat) {

				// start by create all of the elements and setting their
				// attributes.
				var container = document.createElement("hbox");
				container.setAttribute("align", "center");

				var image = document.createElement("image");
				image.setAttribute("src", item.imgsrc);
				image.setAttribute("height", "50");
				image.setAttribute("width", "50");

				var labelbox = document.createElement("vbox");
				labelbox.setAttribute("flex", "1");

				var itemlabel = document.createElement("label");
				itemlabel.setAttribute("type", "bold");
				itemlabel.setAttribute("value", item.name + "  [x"
								+ item.quantity + "]");

				var actioncontainer = document.createElement("hbox");
				actioncontainer.setAttribute("flex", "1");

				if (item.hasAction("use")) {
					var uselink = document.createElement("label");
					uselink.setAttribute("value", "Use");
					uselink.setAttribute("type", "link");
					uselink.setAttribute("flex", "1");
					uselink.setAttribute("onclick",
							'piratequesting.Inventory.useItem("' + item.id
									+ '");');
					actioncontainer.appendChild(uselink);
				}

				if (item.hasAction("sell")) {
					var selllink = document.createElement("label");
					selllink.setAttribute("value", "Sell");
					selllink.setAttribute("type", "link");
					selllink.setAttribute("flex", "1");
					selllink
							.setAttribute("onclick",
									'piratequesting.Inventory.showInventoryBox("'
											+ item.id + '","' + item.price
											+ '","' + item.name + '","'
											+ item.quantity + '");');
					actioncontainer.appendChild(selllink);
				}

				if (item.hasAction("market")) {
					var marketlink = document.createElement("label");
					marketlink.setAttribute("value", "Market");
					marketlink.setAttribute("type", "link");
					marketlink.setAttribute("flex", "1");
					marketlink.setAttribute("number", item.id);
					marketlink.setAttribute("onclick",
							'piratequesting.Inventory.showInventoryBox("'
									+ item.id + '","0","' + item.name + '","'
									+ item.quantity + '");');
					actioncontainer.appendChild(marketlink);
				}

				if (item.hasAction("market") || item.hasAction("sell")) {
					var checklink = document.createElement("label");
					checklink.setAttribute("value", "Check Prices");
					checklink.setAttribute("type", "link");
					checklink.setAttribute("flex", "1");
					checklink.setAttribute("onclick",
							'piratequesting.Inventory.showInventoryBox("'
									+ item.id + '","-1","' + item.name + '","'
									+ cat + '");');
					actioncontainer.appendChild(checklink);
				}

				if (item.hasAction("return")) {
					var returnlink = document.createElement("label");
					returnlink.setAttribute("value", "Return");
					returnlink.setAttribute("type", "link");
					returnlink.setAttribute("flex", "1");
					returnlink.setAttribute("onclick",
							'piratequesting.Inventory.returnItem("' + item.id
									+ '");');
					actioncontainer.appendChild(returnlink);
				}

				// put the item info and actions together
				labelbox.appendChild(itemlabel);
				labelbox.appendChild(actioncontainer);

				// put the image and various labels together
				container.appendChild(image);
				container.appendChild(labelbox);

				// return our happy new container
				return container;
			};

			var inventoryList = document.getElementById("inventorylist");

			// clear the list
			while (inventoryList.hasChildNodes())
				inventoryList.removeChild(inventoryList.firstChild);

			// First add the Head items
			// assume the head item is the first item in equipment (it is
			// for now.. unless they add new euipment types).. also check if
			// it's empty...
			// waiting for confirmation that we can add the equipment to the
			// marketable items so they are currently not included

			inventoryList.appendChild(newInventoryItem(
					piratequesting.Inventory.points, "points"));

			// if (equipment.GetItemAtIndex(0).name != "Nothing")
			// inventoryList.appendChild(newInventoryItem(equipment.GetItemAtIndex(0)));
			for (var i = 0; i < piratequesting.Inventory.head.count(); i++)
				inventoryList.appendChild(newInventoryItem(
						piratequesting.Inventory.head.GetItemAtIndex(i),
						piratequesting.Inventory.head.cat));

			// then the armour
			// if (equipment.GetItemAtIndex(1).name != "Nothing")
			// inventoryList.appendChild(newInventoryItem(equipment.GetItemAtIndex(1)));
			for (var i = 0; i < piratequesting.Inventory.armour.count(); i++)
				inventoryList.appendChild(newInventoryItem(
						piratequesting.Inventory.armour.GetItemAtIndex(i),
						piratequesting.Inventory.armour.cat));

			// then the weapons
			// if (equipment.GetItemAtIndex(2).name != "Nothing")
			// inventoryList.appendChild(newInventoryItem(equipment.GetItemAtIndex(2)));
			for (var i = 0; i < piratequesting.Inventory.weapons.count(); i++)
				inventoryList.appendChild(newInventoryItem(
						piratequesting.Inventory.weapons.GetItemAtIndex(i),
						piratequesting.Inventory.weapons.cat));

			// then the offhand
			// if (equipment.GetItemAtIndex(3).name != "Nothing")
			// inventoryList.appendChild(newInventoryItem(equipment.GetItemAtIndex(3)));
			for (var i = 0; i < piratequesting.Inventory.offhand.count(); i++)
				inventoryList.appendChild(newInventoryItem(
						piratequesting.Inventory.offhand.GetItemAtIndex(i),
						piratequesting.Inventory.offhand.cat));

			// now do the non-equipment items
			for (var i = 0; i < piratequesting.Inventory.edibles.count(); i++)
				inventoryList.appendChild(newInventoryItem(
						piratequesting.Inventory.edibles.GetItemAtIndex(i),
						piratequesting.Inventory.edibles.cat));

			for (var i = 0; i < piratequesting.Inventory.grenades.count(); i++)
				inventoryList.appendChild(newInventoryItem(
						piratequesting.Inventory.grenades.GetItemAtIndex(i),
						piratequesting.Inventory.grenades.cat));

			for (var i = 0; i < piratequesting.Inventory.poisons.count(); i++)
				inventoryList.appendChild(newInventoryItem(
						piratequesting.Inventory.poisons.GetItemAtIndex(i),
						piratequesting.Inventory.poisons.cat));

			for (var i = 0; i < piratequesting.Inventory.miscellaneous.count(); i++)
				inventoryList.appendChild(newInventoryItem(
						piratequesting.Inventory.miscellaneous
								.GetItemAtIndex(i),
						piratequesting.Inventory.miscellaneous.cat));

			for (var i = 0; i < piratequesting.Inventory.tokens.count(); i++)
				inventoryList.appendChild(newInventoryItem(
						piratequesting.Inventory.tokens.GetItemAtIndex(i),
						piratequesting.Inventory.tokens.cat));

			// done :)
		},

		//TODO replace this with database
		write : function() {

			var profdir = Components.classes["@mozilla.org/file/directory_service;1"]
					.getService(Components.interfaces.nsIProperties).get(
							"ProfD", Components.interfaces.nsIFile).path
			var file = Components.classes["@mozilla.org/file/local;1"]
					.createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(profdir);
			file.append("Inventory.xml");

			// get the local file:// url
			var ph = Components.classes["@mozilla.org/network/protocol;1?name=file"]
					.createInstance(Components.interfaces.nsIFileProtocolHandler);
			var logfile = ph.getURLSpecFromFile(file);

			// load the log and add our new values
			var xmlDoc = document.implementation.createDocument("",
					"Inventory", null);

			// has to be done for each category
			// piratequesting.Inventory.armour;
			xmlDoc.documentElement.appendChild(piratequesting.Inventory.armour
					.generateXML(xmlDoc));
			xmlDoc.documentElement.appendChild(piratequesting.Inventory.edibles
					.generateXML(xmlDoc));
			xmlDoc.documentElement
					.appendChild(piratequesting.Inventory.grenades
							.generateXML(xmlDoc));
			xmlDoc.documentElement.appendChild(piratequesting.Inventory.head
					.generateXML(xmlDoc));
			xmlDoc.documentElement
					.appendChild(piratequesting.Inventory.miscellaneous
							.generateXML(xmlDoc));
			xmlDoc.documentElement.appendChild(piratequesting.Inventory.offhand
					.generateXML(xmlDoc));
			xmlDoc.documentElement.appendChild(piratequesting.Inventory.poisons
					.generateXML(xmlDoc));
			xmlDoc.documentElement.appendChild(piratequesting.Inventory.tokens
					.generateXML(xmlDoc));
			xmlDoc.documentElement.appendChild(piratequesting.Inventory.weapons
					.generateXML(xmlDoc));
			xmlDoc.documentElement
					.appendChild(piratequesting.Inventory.equipment
							.generateXML(xmlDoc));

			var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
					.createInstance(Components.interfaces.nsIFileOutputStream);
			// clear the file for writing the new doc
			foStream.init(file, 0x02 | 0x08 | 0x20, 0666, 0); // write,
			// create,
			// truncate
			var ser = new XMLSerializer();
			// write the serialized XML to file
			ser.serializeToStream(xmlDoc, foStream, "");
			foStream.close();
		},
		
		//TODO this needs massive changes. Say goodbye to friday 
		update : (function() {
			// piratequesting.Inventory.checked=true;

			function load() {
				var profdir = Components.classes["@mozilla.org/file/directory_service;1"]
						.getService(Components.interfaces.nsIProperties).get(
								"ProfD", Components.interfaces.nsIFile).path;
				var file = Components.classes["@mozilla.org/file/local;1"]
						.createInstance(Components.interfaces.nsILocalFile);
				file.initWithPath(profdir);
				file.append("Inventory.xml");

				var ph = Components.classes["@mozilla.org/network/protocol;1?name=file"]
						.createInstance(Components.interfaces.nsIFileProtocolHandler);
				var logfile = ph.getURLSpecFromFile(file);

				var log = new XMLHttpRequest();
				log.open("GET", logfile, true);
				log.onerror = function(e) {
					onError(e);
				}

				piratequesting.Inventory.weapons = new Category("weapon", 1);
				piratequesting.Inventory.armour = new Category("armor", 2);
				piratequesting.Inventory.edibles = new Category("edibles", 3);
				piratequesting.Inventory.poisons = new Category("poison", 4);
				piratequesting.Inventory.head = new Category("head", 5);
				piratequesting.Inventory.grenades = new Category("grenade", 6);
				piratequesting.Inventory.miscellaneous = new Category(
						"miscellaneous", 8);
				piratequesting.Inventory.offhand = new Category("offhand", 11);
				piratequesting.Inventory.tokens = new Category("tokens", 12);
				piratequesting.Inventory.equipment = new Category("equipment",
						null);
				piratequesting.Inventory.points = new Item("Points", "point",
						(piratequesting.Player.points != "")
								? piratequesting.Player.points
								: document.getElementById("pointsval").value,
						"chrome://piratequesting/content/points_dice.gif",
						"points", null, ["market"]);

				log.onreadystatechange = function() {
					if (log.readyState == 4) {
						var xmlDoc = log.responseXML;
						try {

							var cats = xmlDoc.getElementsByTagName("category");
							var catno, type, items;

							for (var i = 0; i < cats.length; i++) {
								catno = cats[i].firstChild;
								type = catno.nextSibling;
								item = type.nextSibling;
								if (catno.firstChild == null) {
									// equipment
									while (item != null) {
										piratequesting.Inventory.equipment
												.AddItem(new Item(
														item.childNodes[0].firstChild.nodeValue,
														item.childNodes[1].firstChild.nodeValue,
														item.childNodes[2].firstChild.nodeValue,
														item.childNodes[3].firstChild.nodeValue,
														item.childNodes[4].firstChild.nodeValue,
														item.childNodes[5].firstChild.nodeValue,
														item.childNodes[6].firstChild.nodeValue
																.split("|")));
										item = item.nextSibling;
									}
								} else {
									switch (catno.firstChild.nodeValue) {
										case '1' :
											// weapons
											while (item != null) {
												piratequesting.Inventory.weapons
														.AddItem(new Item(
																item.childNodes[0].firstChild.nodeValue,
																item.childNodes[1].firstChild.nodeValue,
																item.childNodes[2].firstChild.nodeValue,
																item.childNodes[3].firstChild.nodeValue,
																item.childNodes[4].firstChild.nodeValue,
																item.childNodes[5].firstChild.nodeValue,
																item.childNodes[6].firstChild.nodeValue
																		.split("|")));
												item = item.nextSibling;
											}
										case '2' :
											// armour
											while (item != null) {
												piratequesting.Inventory.armour
														.AddItem(new Item(
																item.childNodes[0].firstChild.nodeValue,
																item.childNodes[1].firstChild.nodeValue,
																item.childNodes[2].firstChild.nodeValue,
																item.childNodes[3].firstChild.nodeValue,
																item.childNodes[4].firstChild.nodeValue,
																item.childNodes[5].firstChild.nodeValue,
																item.childNodes[6].firstChild.nodeValue
																		.split("|")));
												item = item.nextSibling;
											}
										case '3' :
											// edibles
											while (item != null) {
												piratequesting.Inventory.edibles
														.AddItem(new Item(
																item.childNodes[0].firstChild.nodeValue,
																item.childNodes[1].firstChild.nodeValue,
																item.childNodes[2].firstChild.nodeValue,
																item.childNodes[3].firstChild.nodeValue,
																item.childNodes[4].firstChild.nodeValue,
																item.childNodes[5].firstChild.nodeValue,
																item.childNodes[6].firstChild.nodeValue
																		.split("|")));
												item = item.nextSibling;
											}
										case '4' :
											// poison
											while (item != null) {
												piratequesting.Inventory.poisons
														.AddItem(new Item(
																item.childNodes[0].firstChild.nodeValue,
																item.childNodes[1].firstChild.nodeValue,
																item.childNodes[2].firstChild.nodeValue,
																item.childNodes[3].firstChild.nodeValue,
																item.childNodes[4].firstChild.nodeValue,
																item.childNodes[5].firstChild.nodeValue,
																item.childNodes[6].firstChild.nodeValue
																		.split("|")));
												item = item.nextSibling;
											}
										case '5' :
											// head
											while (item != null) {
												piratequesting.Inventory.head
														.AddItem(new Item(
																item.childNodes[0].firstChild.nodeValue,
																item.childNodes[1].firstChild.nodeValue,
																item.childNodes[2].firstChild.nodeValue,
																item.childNodes[3].firstChild.nodeValue,
																item.childNodes[4].firstChild.nodeValue,
																item.childNodes[5].firstChild.nodeValue,
																item.childNodes[6].firstChild.nodeValue
																		.split("|")));
												item = item.nextSibling;
											}
										case '6' :
											// grenade
											while (item != null) {
												piratequesting.Inventory.grenades
														.AddItem(new Item(
																item.childNodes[0].firstChild.nodeValue,
																item.childNodes[1].firstChild.nodeValue,
																item.childNodes[2].firstChild.nodeValue,
																item.childNodes[3].firstChild.nodeValue,
																item.childNodes[4].firstChild.nodeValue,
																item.childNodes[5].firstChild.nodeValue,
																item.childNodes[6].firstChild.nodeValue
																		.split("|")));
												item = item.nextSibling;
											}
										case '8' :
											// miscellaneous
											while (item != null) {
												piratequesting.Inventory.miscellaneous
														.AddItem(new Item(
																item.childNodes[0].firstChild.nodeValue,
																item.childNodes[1].firstChild.nodeValue,
																item.childNodes[2].firstChild.nodeValue,
																item.childNodes[3].firstChild.nodeValue,
																item.childNodes[4].firstChild.nodeValue,
																item.childNodes[5].firstChild.nodeValue,
																item.childNodes[6].firstChild.nodeValue
																		.split("|")));
												item = item.nextSibling;
											}
										case '11' :
											// offhand
											while (item != null) {
												piratequesting.Inventory.offhand
														.AddItem(new Item(
																item.childNodes[0].firstChild.nodeValue,
																item.childNodes[1].firstChild.nodeValue,
																item.childNodes[2].firstChild.nodeValue,
																item.childNodes[3].firstChild.nodeValue,
																item.childNodes[4].firstChild.nodeValue,
																item.childNodes[5].firstChild.nodeValue,
																item.childNodes[6].firstChild.nodeValue
																		.split("|")));
												item = item.nextSibling;
											}
										case '12' :
											// tokens
											while (item != null) {
												piratequesting.Inventory.tokens
														.AddItem(new Item(
																item.childNodes[0].firstChild.nodeValue,
																item.childNodes[1].firstChild.nodeValue,
																item.childNodes[2].firstChild.nodeValue,
																item.childNodes[3].firstChild.nodeValue,
																item.childNodes[4].firstChild.nodeValue,
																item.childNodes[5].firstChild.nodeValue,
																item.childNodes[6].firstChild.nodeValue
																		.split("|")));
												item = item.nextSibling;
											}
									}
								}
							}
							if (!updateMenu("weapon_menu",
									piratequesting.Inventory.weapons)) {
								piratequesting.ItemGuide.checkItemGuide();
								// try only one more time
								updateMenu("weapon_menu",
										piratequesting.Inventory.weapons);
							}

							if (!updateMenu("head_menu",
									piratequesting.Inventory.head)) {
								piratequesting.ItemGuide.checkItemGuide();
								updateMenu("head_menu",
										piratequesting.Inventory.head);
							}

							if (!updateMenu("armor_menu",
									piratequesting.Inventory.armour)) {
								piratequesting.ItemGuide.checkItemGuide();
								updateMenu("armor_menu",
										piratequesting.Inventory.armour);
							}

							if (!updateMenu("offhand_menu",
									piratequesting.Inventory.offhand)) {
								piratequesting.ItemGuide.checkItemGuide();
								updateMenu("offhand_menu",
										piratequesting.Inventory.offhand);
							}

							piratequesting.Inventory.updateEdiblesList();
							piratequesting.Inventory.updateInventoryList();
						} catch (e) {
							alert(getErrorString(e));
						}
					}
				}
				log.send(null);

			}

			//TODO Privatize!
			//TODO Could probably be made much more efficient as well. I guess that's saturday gone, too
			/**
			 * updateMenu Creates the equipment list and the popup menus for
			 * each equipment slot
			 * 
			 * @param (String)
			 *            menu_id - weapon_menu, armor_menu, head_menu,
			 *            offhand_menu
			 * @param (String)
			 *            category - the associated Category object
			 */
			var updateMenu = function(menu_id, category, skip) {
				skip = (skip) ? true : false;
				var wm = document.getElementById(menu_id);
				var mi, tt, igr;
				var eqi = null;
				var ttbox = document.getElementById("ttbox");
				// clear menu
				var success = true;
				while (wm.hasChildNodes())
					wm.removeChild(wm.childNodes[0]);

				// clear tooltips
				// while(ttbox.hasChildNodes())
				// ttbox.removeChild(ttbox.childNodes[0]);

				// determine whether or not the associated equipment slot has an
				// item
				for (var i = 0; i < piratequesting.Inventory.equipment.count(); i++) {
					if (piratequesting.Inventory.equipment.GetItemAtIndex(i).type == category.type) {
						if (piratequesting.Inventory.equipment
								.GetItemAtIndex(i).name != "Nothing") {
							eqi = piratequesting.Inventory.equipment
									.GetItemAtIndex(i);
						}
						break;
					}
				}
				// add the unequiiped items to the menu, create the associated
				// labels, values and oncommand action
				if (eqi == null)
					for (var i = 0; i < category.count(); i++) {
						igr = piratequesting.ItemGuide.getItemByName(category
								.GetItemAtIndex(i).name);
						if ((!skip) && (igr == null))
							return false; // item not found,
						// get the item
						// guide and start
						// over
						else if (igr != null) {
							mi = document.createElement("menuitem");
							mi.setAttribute("label", "Equip "
											+ category.GetItemAtIndex(i).name);
							mi.setAttribute("value",
									category.GetItemAtIndex(i).id);
							// set the oncommand based on whether or not there
							// is an
							// item in the slot already
							mi
									.setAttribute(
											"oncommand",
											(eqi == null)
													? "piratequesting.Inventory.equip(this.value)"
													: "swap(this.value,"
															+ eqi.id + ")");
							tt = igr.makeTooltip("tt"
									+ category.GetItemAtIndex(i).id);
							document.getElementById('ttbox').appendChild(tt);
							mi.setAttribute("tooltip", "tt"
											+ category.GetItemAtIndex(i).id);
							mi.setAttribute("popupanchor", "topright");
							wm.appendChild(mi);
						}
					}

				// add the equipped item, if present, to the menu and set its
				// associated label, value, and oncommand action
				if (eqi != null) {
					// if (category.HasItems())
					// wm.appendChild(document.createElement("menuseparator"));
					mi = document.createElement("menuitem");
					mi.setAttribute("label", "Unequip " + eqi.name);
					mi.setAttribute("value", eqi.id);
					mi.setAttribute("oncommand",
							"piratequesting.Inventory.unequip(this.value)");
					wm.appendChild(mi);
				}
				return true;
			};

			var updateEdibles = function(text) {
				// should find and retrieve the full names (in
				// match[1]+match[2]) and quantities in match[3]. Meant to be
				// run until unsuccessful. array ids will be modified when we
				// remove the plain text
				var stripex = /<h2>Edibles<\/h2>[\s\S]*?<\/table>/i;
				updateStandard(text, piratequesting.Inventory.edibles, stripex);
				piratequesting.Inventory.updateEdiblesList();
			};

			var updateEquipment = function(text) {
				var stripex = /<h2>Items Worn or Held \(Equipped\)<\/h2>[\s\S]*?<\/table>/i;
				// first check if this is even the right page... or if the
				// equipment section is now gone (PQ Devs changed?)
				if (piratequesting.Inventory.equipment.HasItems())
					piratequesting.Inventory.equipment.ClearItems();
				while (document.getElementById('ttbox').hasChildNodes())
					document.getElementById('ttbox').removeChild(document
							.getElementById('ttbox').firstChild);
				if (stripex.test(text)) {
					var text = stripex.exec(text)[0];
					var item;

					// note: testPattern must not use the g flag.
					// extra note. the following patterns use ['"] because, for
					// some reason, firefox returns both cases for the same
					// page. the actual page code, of course, should not be
					// different.

					var testPattern = /<td><strong>([\s\S]*?):<\/strong><br ?\/?><br ?\/?><img src=['"]([\S]*?)["'][\s\S]*?<a class=['"]item_view["'][\s\S]*?>([\s\S]*?)<\/a><br ?\/?>\[x([,0-9]+)\][\s\S]*?(\$[,0-9]+)<br ?\/?>[\s\S]*?id=([0-9]+)[\s\S]*?<\/td>|<td><b>([\s\S]*?)<\/b><br ?\/?><br ?\/?><img src=['"]([\S]*?)['"][\s\S]*?<em>Nothing Equipped!<\/em>/;
					var equipmentPattern = /<td><strong>([\s\S]*?):<\/strong><br ?\/?><br ?\/?><img src=['"]([\S]*?)["'][\s\S]*?<a class=['"]item_view["'][\s\S]*?>([\s\S]*?)<\/a><br ?\/?>\[x([,0-9]+)\][\s\S]*?(\$[,0-9]+)<br ?\/?>[\s\S]*?id=([0-9]+)[\s\S]*?<\/td>|<td><b>([\s\S]*?)<\/b><br ?\/?><br ?\/?><img src=['"]([\S]*?)['"][\s\S]*?<em>Nothing Equipped!<\/em>/g;
					// var testPattern =
					// /<td><strong>([\s\S]*?):<\/strong><br><br><img
					// src=['"]([\S]*?)['"][\s\S]*?<a
					// class=['"]item_view['"][\s\S]*?>([\s\S]*?)<\/a><br>\[x([,0-9]+)\]<br
					// \/>[\s\S]*?(\$[,0-9]+)<br>[\s\S]*?id=([0-9]+)[\s\S]*?<\/td>|<td><b>([\s\S]*?)<\/b><br><br><img
					// src=['"]([\S]*?)['"][\s\S]*?<em>Nothing Equipped!<\/em>/;
					// var equipmentPattern =
					// /<td><strong>([\s\S]*?):<\/strong><br><br><img
					// src=['"]([\S]*?)['"][\s\S]*?<a
					// class=['"]item_view['"][\s\S]*?>([\s\S]*?)<\/a><br>\[x([,0-9]+)\]<br
					// \/>[\s\S]*?(\$[,0-9]+)<br>[\s\S]*?id=([0-9]+)[\s\S]*?<\/td>|<td><b>([\s\S]*?)<\/b><br><br><img
					// src=['"]([\S]*?)['"][\s\S]*?<em>Nothing
					// Equipped!<\/em>/g;

					if (testPattern.test(text)) {
						var match = equipmentPattern.exec(text);
						var elnum = 0;
						while (match != null) {
							// assigns a real or empty item depending on state
							// of 'match'
							item = (match[7] == null) ? new Item(match[3],
									stripWhitespace(match[1]).toLowerCase(),
									match[4], fixURL(piratequesting.baseurl
											+ '/' + match[2]), match[6],
									match[5], ["none"]) : new Item("Nothing",
									(match[7]).toLowerCase(), 0,
									fixURL(piratequesting.baseurl + '/'
											+ match[8]), " ", " ", ["none"]);
							piratequesting.Inventory.equipment.AddItem(item);
							// alert("IT: " + item.type);
							document.getElementById(item.type + "_image")
									.setAttribute("src", item.imgsrc);
							document.getElementById(item.type + "_label")
									.setAttribute("value", item.name);
							elnum++;
							match = equipmentPattern.exec(text);
						}
					}
				}
			};

			var updateStandard = function(text, category, stripex) {
				// first check if this is even the right page... or if the
				// equipment section is now gone (PQ Devs changed?)
				if (category.HasItems())
					category.ClearItems();
				if (stripex.test(text)) {
					var text = stripex.exec(text)[0];
					var item;
					// note: testPattern must not use the g flag.
					// extra note. the following patterns use ['"] because, for
					// some reason, firefox returns both cases for the same
					// page. the actual page code, of course, should not be
					// different.
					var testPattern = /<td[\s\S]*?<img src=['"]([\S]*?)['"][\s\S]*?<a class=['"]item_view['"][\s\S]*?>([\s\S]*?)<\/a><br ?\/?>[\s\S]*?\[x([,0-9]+)\][\s\S]*?(\$[,0-9]+)<br ?\/?>[\s\S]*?id=([0-9]+)[\s\S]*?<\/td>/;
					var standardPattern = /<td[\s\S]*?<img src=['"]([\S]*?)['"][\s\S]*?<a class=['"]item_view['"][\s\S]*?>([\s\S]*?)<\/a><br ?\/?>[\s\S]*?\[x([,0-9]+)\][\s\S]*?(\$[,0-9]+)<br ?\/?>[\s\S]*?id=([0-9]+)[\s\S]*?<\/td>/g;
					// debugResponse(text);
					if (testPattern.test(text)) {
						var match = standardPattern.exec(text);
						var elnum = 0;
						while (match != null) {
							// we're gonna use the links to determine the
							// actions to use....
							var actionex = /on=inventory&action=([\S]*?)&id=/g;
							var action = actionex.exec(match[0]);
							var actions = new Array();
							while (action != null) {
								actions.push(action[1]);
								action = actionex.exec(match[0]);
							}
							// alert(match[0]);
							// Special check for "Use" after the change on Dec
							// 30th, 2008
							var use_regex = /<input[\s\S]*?value=['"]use['"][\s\S]*?type=['"]button['"]/i;
							if (use_regex.test(match[0]))
								actions.push("use");

							item = new Item(match[2], category.type, match[3],
									fixURL(piratequesting.baseurl + '/'
											+ match[1]), match[5], match[4],
									actions);
							category.AddItem(item);
							elnum++;
							match = standardPattern.exec(text);
						}
					}
				}

			};

			var updateWeapons = function(text) {
				var stripex = /<h2>Weapons<\/h2>[\s\S]*?<\/table>/i;
				// debugResponse(stripex.exec(text)[0]);
				updateStandard(text, piratequesting.Inventory.weapons, stripex);
				updateMenu("weapon_menu", piratequesting.Inventory.weapons);
			};

			var updateHead = function(text) {
				var stripex = /<h2>Head<\/h2>[\s\S]*?<\/table>/i;
				updateStandard(text, piratequesting.Inventory.head, stripex);
				updateMenu("head_menu", piratequesting.Inventory.head);
			};

			var updateArmour = function(text) {
				var stripex = /<h2>Armour<\/h2>[\s\S]*?<\/table>/i;
				updateStandard(text, piratequesting.Inventory.armour, stripex);
				updateMenu("armor_menu", piratequesting.Inventory.armour);
			};

			var updateOffhand = function(text) {
				var stripex = /<h2>OffHand<\/h2>[\s\S]*?<\/table>/i;
				updateStandard(text, piratequesting.Inventory.offhand, stripex);
				updateMenu("offhand_menu", piratequesting.Inventory.offhand);
			};

			var updateGrenades = function(text) {
				var stripex = /<h2>Grenades<\/h2>[\s\S]*?<\/table>/i;
				updateStandard(text, piratequesting.Inventory.grenades, stripex);
			};

			var updatePoisons = function(text) {
				var stripex = /<h2>Poisons<\/h2>[\s\S]*?<\/table>/i;
				updateStandard(text, piratequesting.Inventory.poisons, stripex);
			};

			var updateTokens = function(text) {
				var stripex = /<h2>Tokens<\/h2>[\s\S]*?<\/table>/i;
				updateStandard(text, piratequesting.Inventory.tokens, stripex);
			};

			var updateMiscellaneous = function(text) {
				var stripex = /<h2>Miscellaneous<\/h2>[\s\S]*?<\/table>/i;
				updateStandard(text, piratequesting.Inventory.miscellaneous,
						stripex);
			};

			var upd = function(text) {
				// first make sure we haven't been sent back to port or
				// something
				var invcheck = /<h2>Items Worn or Held \(Equipped\)<\/h2>/;
				if (invcheck.test(text)) {
					piratequesting.Inventory.edibles = new Category("edibles",
							3);
					piratequesting.Inventory.equipment = new Category(
							"equipment", null);
					piratequesting.Inventory.head = new Category("head", 5);
					piratequesting.Inventory.weapons = new Category("weapon", 1);
					piratequesting.Inventory.armour = new Category("armor", 2);
					piratequesting.Inventory.offhand = new Category("offhand",
							11);
					piratequesting.Inventory.grenades = new Category("grenade",
							6);
					piratequesting.Inventory.miscellaneous = new Category(
							"miscellaneous", 8);
					piratequesting.Inventory.poisons = new Category("poison", 4);
					piratequesting.Inventory.tokens = new Category("tokens", 12);
					piratequesting.Inventory.points = new Item("Points",
							"point", piratequesting.Player.points,
							"chrome://piratequesting/content/points_dice.gif",
							"points", null, ["market"]);
					// updatePoints();
					updateEdibles(text);
					updateEquipment(text);
					updateWeapons(text);
					updateHead(text);
					updateArmour(text);
					updateOffhand(text);
					updateGrenades(text);
					updatePoisons(text);
					updateMiscellaneous(text);
					updateTokens(text);
					piratequesting.Inventory.updateInventoryList();
					piratequesting.Inventory.checked = true;
					piratequesting.Inventory.write();
				} else if (text == null) {
					load();
				} else {
					// not the inventory page... grrrr...
					alert("Failed updating inventory as the page returned \nwas not, in fact, the inventory page.");
				}
			}

			return upd;
		})(),

		//TODO can probably cut this
		checkedInventory : function() {
			return piratequesting.Inventory.checked;
		},

		//TODO Move this to the Inventory Module
		showInventoryBox : function(id, price, name, qty) {
			document.getElementById("invdeck").setAttribute("selectedIndex",
					"1");
			var invd = document.getElementById("invdetails");

			// clear the details
			while (invd.hasChildNodes())
				invd.removeChild(invd.firstChild);

			var prn = Number(priceToNumber(price));
			if (prn > 0) {
				// selling
				var msg1 = document.createElement("description");
				msg1
						.setAttribute("value", "You have " + qty + " " + name
										+ ".");
				var msg3 = document.createElement("description");
				msg3.setAttribute("value", "How many would you like to sell?");
				invd.appendChild(msg1);
				invd.appendChild(msg3);

				var sellbox = document.createElement("hbox");
				sellbox.setAttribute("align", "center");

				var qtyin = document.createElement("textbox");
				qtyin.setAttribute("type", "number");
				qtyin.setAttribute("width", "50");
				qtyin.setAttribute("id", "qtyin");
				qtyin.setAttribute("max", qty);
				qtyin.setAttribute("min", 0);

				var hiddenpricein = document.createElement("textbox");
				hiddenpricein.setAttribute("value", prn);
				hiddenpricein.setAttribute("id", "pricein");
				hiddenpricein.setAttribute("type", "hide");

				var hiddenid = document.createElement("textbox");
				hiddenid.setAttribute("value", id);
				hiddenid.setAttribute("id", "item_id");
				hiddenid.setAttribute("type", "hide");

				var pricelabel = document.createElement("label");
				pricelabel.setAttribute("value", " @ " + price + " each");

				var totalbox = document.createElement("hbox");
				totalbox.setAttribute("align", "center");

				var totallabel = document.createElement("label");
				totallabel.setAttribute("value", "Total: $");

				var resultlabel = document.createElement("label");
				resultlabel.setAttribute("value", "0");
				resultlabel.setAttribute("id", "result");

				var buttonbox = document.createElement("hbox");
				buttonbox.setAttribute("align", "center");

				var actionbutton = document.createElement("button");
				actionbutton.setAttribute("label", "Sell");
				actionbutton.setAttribute("id", "actionbutton");
				actionbutton.setAttribute("maxwidth", "70");
				actionbutton
						.setAttribute(
								"oncommand",
								'if (confirm("Are you sure you want to do this?"))  piratequesting.Inventory.sellitem()');

				var cancelbutton = document.createElement("button");
				cancelbutton.setAttribute("label", "Cancel");
				cancelbutton.setAttribute("id", "cancelbutton");
				cancelbutton.setAttribute("maxwidth", "70");
				cancelbutton.setAttribute("oncommand",
						'piratequesting.Inventory.hideInventoryBox()');

				// now put them in the doc
				totalbox.appendChild(totallabel);
				totalbox.appendChild(resultlabel);

				sellbox.appendChild(qtyin);
				sellbox.appendChild(pricelabel);
				sellbox.appendChild(hiddenpricein);

				invd.appendChild(hiddenid);
				invd.appendChild(sellbox);
				invd.appendChild(totalbox);

				buttonbox.appendChild(actionbutton);
				buttonbox.appendChild(cancelbutton);
				invd.appendChild(buttonbox);
				document.getElementById("qtyin").addEventListener("change",
						piratequesting.Inventory.giveResult, true);
				document.getElementById("qtyin").addEventListener("input",
						piratequesting.Inventory.giveResult, true);
				document.getElementById('qtyin').addEventListener('keypress',
						piratequesting.Inventory.HandleKeyPressItems, true);
				document.getElementById("qtyin").focus();
				// document.getElementById("qtyin").addEventListener("command",
				// function () {
				// document.getElementById("sellbutton").doCommand(); }, true);

			} else if (prn == 0) {
				// marketing

				var msg1 = document.createElement("description");
				msg1
						.setAttribute("value", "You have " + qty + " " + name
										+ ".");
				var msg2 = document.createElement("description");
				msg2.setAttribute("value",
						"How many would you like to put on the market?");
				var msg3 = document.createElement("description");
				msg3.setAttribute("value", "And for how much?");
				invd.appendChild(msg1);
				invd.appendChild(msg2);
				invd.appendChild(msg3);

				var sellbox = document.createElement("hbox");
				sellbox.setAttribute("align", "center");

				var qtyin = document.createElement("textbox");
				qtyin.setAttribute("type", "number");
				qtyin.setAttribute("width", "50");
				qtyin.setAttribute("id", "qtyin");
				qtyin.setAttribute("max", qty);
				qtyin.setAttribute("min", 0);

				var pricein = document.createElement("textbox");
				// pricein.setAttribute("value",prn);
				pricein.setAttribute("id", "pricein");
				pricein.setAttribute("wdith", "70");

				var hiddenid = document.createElement("textbox");
				hiddenid.setAttribute("value", id);
				hiddenid.setAttribute("id", "item_id");
				hiddenid.setAttribute("type", "hide");

				var pricelabel = document.createElement("label");
				pricelabel.setAttribute("value", " @ $");

				var pricelabel2 = document.createElement("label");
				pricelabel2.setAttribute("value", " each");

				var totalbox = document.createElement("hbox");
				totalbox.setAttribute("align", "center");

				var totallabel = document.createElement("label");
				totallabel.setAttribute("value", "Total: $");

				var resultlabel = document.createElement("label");
				resultlabel.setAttribute("value", "0");
				resultlabel.setAttribute("id", "result");

				var buttonbox = document.createElement("hbox");
				buttonbox.setAttribute("align", "center");

				var actionbutton = document.createElement("button");
				actionbutton.setAttribute("label", "Market");
				actionbutton.setAttribute("id", "actionbutton");
				actionbutton.setAttribute("maxwidth", "70");
				actionbutton
						.setAttribute(
								"oncommand",
								'if (confirm("Are you sure you want to do this?"))  piratequesting.Inventory.marketitem()');

				var cancelbutton = document.createElement("button");
				cancelbutton.setAttribute("label", "Cancel");
				cancelbutton.setAttribute("id", "cancelbutton");
				cancelbutton.setAttribute("maxwidth", "70");
				cancelbutton.setAttribute("oncommand",
						'piratequesting.Inventory.hideInventoryBox()');

				// now put them in the doc
				totalbox.appendChild(totallabel);
				totalbox.appendChild(resultlabel);

				sellbox.appendChild(qtyin);
				sellbox.appendChild(pricelabel);
				sellbox.appendChild(pricein);
				sellbox.appendChild(pricelabel2);

				invd.appendChild(hiddenid);
				invd.appendChild(sellbox);
				invd.appendChild(totalbox);

				buttonbox.appendChild(actionbutton);
				buttonbox.appendChild(cancelbutton);
				invd.appendChild(buttonbox);

				document.getElementById("qtyin").addEventListener("change",
						piratequesting.Inventory.giveResult, true);
				document.getElementById("qtyin").addEventListener("input",
						piratequesting.Inventory.giveResult, true);
				document.getElementById('qtyin').addEventListener('keypress',
						piratequesting.Inventory.HandleKeyPressItems, true);
				document.getElementById("pricein").addEventListener("input",
						piratequesting.Inventory.giveResult, true);
				document.getElementById('pricein').addEventListener('keypress',
						piratequesting.Inventory.HandleKeyPressItems, true);
				document.getElementById("qtyin").focus();
			} else if (prn < 0) {
				// checking prices
				// note qty is treated at the category number for the item
				// market here.
				var cat = qty;
				var msg1 = document.createElement("description");
				msg1.setAttribute("value", "Current market prices for:");
				var msg2 = document.createElement("description");
				msg2.setAttribute("value", name);
				msg2.setAttribute("style", "padding-left:20px;")

				invd.appendChild(msg1);
				invd.appendChild(msg2);

				var buttonbox = document.createElement("hbox");
				buttonbox.setAttribute("align", "center");

				var cancelbutton = document.createElement("button");
				cancelbutton.setAttribute("label", "Close");
				cancelbutton.setAttribute("id", "cancelbutton");
				cancelbutton.setAttribute("maxwidth", "70");
				cancelbutton.setAttribute("oncommand",
						'piratequesting.Inventory.hideInventoryBox()');

				buttonbox.appendChild(cancelbutton);

				var pricebox = document.createElement("hbox");
				var pricelist = document.createElement("listbox");
				pricelist.setAttribute("id", "pricelist");
				var spacer = document.createElement("box");
				spacer.setAttribute("flex", "1");
				// pricelist.setAttribute("style","");
				// pricelist.setAttribute("max-height", "120");

				pricebox.appendChild(pricelist);
				pricebox.appendChild(spacer);
				invd.appendChild(pricebox);
				invd.appendChild(buttonbox);
				piratequesting.Inventory.getPrices(cat, name);
			}

		},

		//TODO Move this to the inventory module (and probably refactor/privatize)
		getPrices : function(cat, name) {
			piratequesting.Inventory.disableInventory();
			var http = new XMLHttpRequest();
			piratequesting.AJAX.inventoryhttp = http;
			if (cat == "points")
				var url = piratequesting.baseurl
						+ "/index.php?on=points_market";
			else
				var url = piratequesting.baseurl
						+ "/index.php?ajax=item_market&category=" + cat;
			http.open("GET", url, true);
			http.onerror = function(e) {
				onError(e);
				piratequesting.Inventory.enableInventory();
			}

			http.onreadystatechange = function() {
				document.getElementById('invmeter').setAttribute(
						'value',
						Number(document.getElementById('invmeter')
								.getAttribute('value'))
								+ 25);
				if (http.readyState == 4) {
					if (http.status == 200) {
						if (cat == "points")
							piratequesting.Player.parse(http.responseText);
						piratequesting.Inventory.processPrices(name,
								http.responseText);
					} else {
						alert("Price list request failed due to error");
					}
				}
			}
			http.send(null);
		},

		//TODO Privatize!
		processPrices : function(name, text) {
			var pricelist = document.getElementById("pricelist");
			var stripex;// = /<h2>Item Market<\/h2>[\s\S]*?(<table
			// class=['"]one['"]>[\s\S]*?<\/table>)/;
			// var stripex2 = /<h2>Points Market<\/h2><\/span>[\s\S]*?(<table
			// class=['"]one['"]>[\s\S]*?<\/table>)/;
			if (name == "Points") {
				stripex = /<h2>Points Market<\/h2><\/span>[\s\S]*?(<table class=['"]one['"]>[\s\S]*?<\/table>)/;
				if (stripex.test(text)) {
					text = stripex.exec(text)[1];
					var itemex = new RegExp(
							"<td class=['\"]textl[\"']>([,0-9]+)<\\/td>[\\s\\S]*?<td class=['\"]textl[\"']>(\\$[.,0-9]+)<\\/td>",
							"g");
					var match = itemex.exec(text);
					var li;
					var order = 0;
					while (match != null) {
						order++;
						li = document.createElement("listitem");
						li.setAttribute("label", match[1] + "  " + match[2]);
						li.setAttribute("order", (order % 2) ? "odd" : "even");
						pricelist.appendChild(li);
						match = itemex.exec(text);
					}
				} else
					alert("Error retrieving prices. Page returned by server\nwas not the points market.");
			} else {
				stripex = /<div id=['"]citemmkt['"]>[\s\S]*?(<table[\s\S]*?<\/table>)/;
				if (stripex.test(text)) {
					text = stripex.exec(text)[1];
					// now look for rows that contain our item name and add
					// their
					// prices to the list
					var itemex = new RegExp(
							"<td class=['\"]hlink_adjust[\"']>[\\s\\S]*?>"
									+ RegExp.escape(name)
									+ "<[\\s\\S]*?(\[x[,0-9]+\])[\\s\\S]*?(\\$[.,0-9]+)",
							"g");
					var match = itemex.exec(text);
					var li;
					var order = 0;
					while (match != null) {
						order++;
						li = document.createElement("listitem");
						li.setAttribute("label", match[1] + "  " + match[2]);
						li.setAttribute("order", (order % 2) ? "odd" : "even");
						pricelist.appendChild(li);
						match = itemex.exec(text);
					}
				} else
					alert("Error retrieving prices. Page returned by server\nwas not the item market");
			}

			piratequesting.Inventory.enableInventory();
		},

		//TODO Move to Inventory Module
		hideInventoryBox : function() {
			document.getElementById("invdeck").setAttribute("selectedIndex",
					"0");
			var invd = document.getElementById("invdetails");
			content.focus();
			// clear the details
			while (invd.hasChildNodes())
				invd.removeChild(invd.firstChild);

		},

		//TODO Move to Inventory Module
		HandleKeyPressItems : function(e) {
			switch (e.keyCode) {
				case e.DOM_VK_RETURN :
				case e.DOM_VK_ENTER :
					document.getElementById("actionbutton").doCommand();
				case e.DOM_VK_ESCAPE :
					content.focus();
					return;
			}
		},

		//TODO Move to Inventory Module
		giveResult : function() {
			var qty = Number(document.getElementById("qtyin").value);
			var price = Number(document.getElementById("pricein").value);
			var result = addCommas(String(qty * price));

			document.getElementById("result").setAttribute("value", result);
		},

		//TODO Move to Inventory Module
		sellitem : function() {
			piratequesting.Inventory.disableInventory();
			var qty = document.getElementById("qtyin").value;
			var id = document.getElementById("item_id").value;

			var http = new XMLHttpRequest();
			var url = piratequesting.baseurl
					+ "/index.php?on=inventory&action=sell&id=" + id;;
			var params = "quantity=" + qty + "&sell=Sell";
			http.open("POST", url, true);

			// Send the proper header information along with the request
			http.setRequestHeader("Content-type",
					"application/x-www-form-urlencoded");
			http.setRequestHeader("Content-length", params.length);
			http.setRequestHeader("Connection", "close");
			http.onerror = function(e) {
				onError(e);
				piratequesting.Inventory.enableInventory();
			}
			piratequesting.AJAX.inventoryhttp = http;
			http.onreadystatechange = function() {
				document.getElementById('invmeter').setAttribute(
						'value',
						Number(document.getElementById('invmeter')
								.getAttribute('value'))
								+ 25);
				if (http.readyState == 4) {
					if (http.status == 200) {
						piratequesting.Inventory
								.checkInventory("piratequesting.Inventory.hideInventoryBox(); piratequesting.Inventory.enableInventory();");
					} else {
						alert("Sale failed due to error");
					}
				}
			}
			http.send(params);
			// hideInvBox();
		},

		//TODO Move to Inventory Module
		marketitem : function() {
			piratequesting.Inventory.disableInventory();
			var qty = document.getElementById("qtyin").value;
			var id = document.getElementById("item_id").value;
			var price = document.getElementById("pricein").value;
			var url;
			var http = new XMLHttpRequest();
			if (id != "points")
				url = piratequesting.baseurl
						+ "/index.php?on=inventory&action=market&id=" + id;
			else
				url = piratequesting.baseurl + "/index.php?on=points_market";
			var params = "quantity=" + qty + "&cost=" + price + "&market=Add";
			http.open("POST", url, true);
			http.onerror = function(e) {
				onError(e);
				piratequesting.Inventory.enableInventory();
			}
			piratequesting.AJAX.inventoryhttp = http;
			// Send the proper header information along with the request
			http.setRequestHeader("Content-type",
					"application/x-www-form-urlencoded");
			http.setRequestHeader("Content-length", params.length);
			http.setRequestHeader("Connection", "close");

			http.onreadystatechange = function() {
				document.getElementById('invmeter').setAttribute(
						'value',
						Number(document.getElementById('invmeter')
								.getAttribute('value'))
								+ 25);
				if (http.readyState == 4) {
					if (http.status == 200) {
						piratequesting.Inventory
								.checkInventory("piratequesting.Inventory.hideInventoryBox(); piratequesting.Inventory.enableInventory();");
					} else {
						alert("Marketing failed due to error");
					}
				}
			}
			http.send(params);
			// hideInvBox();
		},

		//TODO Move to Equipment Module
		unequip : function(id) {
			piratequesting.Inventory.disableEquip();
			var http = new XMLHttpRequest();
			var url = piratequesting.baseurl + "/index.php";

			var params = '?on=inventory&action=unequip&id=' + id;
			http.open("GET", url + params, true);
			http.onerror = function(e) {
				onError(e);
				piratequesting.Inventory.enableEquip();
			}
			piratequesting.AJAX.equipmenthttp = http;
			http.onreadystatechange = function() {
				document.getElementById('eqmeter').setAttribute(
						'value',
						Number(document.getElementById('eqmeter')
								.getAttribute('value'))
								+ 25);
				if (http.readyState == 4) {
					if (http.status == 200) {
						piratequesting.Inventory
								.checkInventory("piratequesting.Inventory.enableEquip()");
					} else {
						alert("Unequipping failed due to error");
					}
				}
			}
			http.send(null);
		},

		//TODO Move to Equipment Module
		equip : function(id) {
			piratequesting.Inventory.disableEquip();
			var http = new XMLHttpRequest();
			var url = piratequesting.baseurl + "/index.php";

			var params = '?on=inventory&action=equip&id=' + id;
			http.open("GET", url + params, true);
			http.onerror = function(e) {
				onError(e);
				piratequesting.Inventory.enableEquip();
			}
			piratequesting.AJAX.equipmenthttp = http;
			http.onreadystatechange = function() {
				document.getElementById('eqmeter').setAttribute(
						'value',
						Number(document.getElementById('eqmeter')
								.getAttribute('value'))
								+ 25);
				if (http.readyState == 4) {
					if (http.status == 200) {
						piratequesting.Inventory
								.checkInventory("piratequesting.Inventory.enableEquip()");
					} else {
						alert("Equipping failed due to error");
					}
				}
			}
			http.send(null);
		},

		//TODO Move to Equipment Module
		returnItem : function(id) {
			piratequesting.Inventory.disableInventory();
			var http = new XMLHttpRequest();
			var url = piratequesting.baseurl + "/index.php";

			var params = '?on=inventory&action=return&id=' + id;
			http.open("GET", url + params, true);
			http.onerror = function(e) {
				onError(e);
				piratequesting.Inventory.enableInventory();
			}
			piratequesting.AJAX.inventoryhttp = http;
			http.onreadystatechange = function() {
				document.getElementById('invmeter').setAttribute(
						'value',
						Number(document.getElementById('invmeter')
								.getAttribute('value'))
								+ 25);
				if (http.readyState == 4) {
					if (http.status == 200) {
						piratequesting.Inventory
								.checkInventory("piratequesting.Inventory.enableInventory()");
					} else {
						alert("Returning failed due to error");
					}
				}
			}
			http.send(null);
		},

		//TODO Move to Inventory Module
		useItem : function(id) {
			piratequesting.Inventory.disableInventory();
			var http = new XMLHttpRequest();
			var url = piratequesting.baseurl + "/index.php?ajax=items";

			var params = 'useamount=1&action=use&id=' + id;
			http.open("post", url, true);
			http.setRequestHeader("Content-type",
					"application/x-www-form-urlencoded");
			http.setRequestHeader("Content-length", params.length);
			http.setRequestHeader("Connection", "close");

			http.onerror = function(e) {
				onError(e);
				piratequesting.Inventory.enableInventory();
			}
			piratequesting.AJAX.inventoryhttp = http;
			http.onreadystatechange = function() {
				document.getElementById('invmeter').setAttribute(
						'value',
						Number(document.getElementById('invmeter')
								.getAttribute('value'))
								+ 25);
				if (http.readyState == 4) {
					if (http.status == 200) {
						var xmlRes = http.responseXML;
						var item = piratequesting.Inventory.edibles
								.GetItemById(id);
						if (item != null) {
							item
									.setQuantity(xmlRes
											.getElementsByTagName('left')[0].firstChild.nodeValue);
							piratequesting.Inventory.updateInventoryList();
							piratequesting.Inventory.updateEdiblesList();
							piratequesting.Inventory.write();
						}

						piratequesting.Inventory.enableInventory();
					} else {
						alert("Returning failed due to error");
					}
				}
			}
			http.send(params);
		},

		//TODO Move to Equipment Module
		disableEquip : function() {
			document.getElementById('equiplist').setAttribute("type", "cover");
			document.getElementById('eqcb').setAttribute("type", "cbox");
			document.getElementById('eqmeter').setAttribute('value', '0');
		},

		//TODO Move to Equipment Module
		enableEquip : function() {
			document.getElementById('equiplist').setAttribute("type", "");
			document.getElementById('eqcb').setAttribute("type", "hide");
		},

		//TODO Move to Inventory Module
		disableInventory : function() {
			document.getElementById('invdeck').setAttribute("type", "cover");
			document.getElementById('invcb').setAttribute("type", "cbox");
			document.getElementById('invmeter').setAttribute('value', '0');
		},

		//TODO Move to Inventory Module
		enableInventory : function() {
			document.getElementById('invdeck').setAttribute("type", "");
			document.getElementById('invcb').setAttribute("type", "hide");
		},

		//TODO Move to Equipment/Inventory/PointsEdibles Modules
		abort : function() {

		}
	}
}();
