var piratequesting = top.piratequesting;


/**
 * Item creates a new inventory item
 * 
 * @class
 * @param {String}
 *            name - name of the inventory item
 * @param {String}
 *            type - type of the inventory item (e.g. "weapon")
 * @param {Integer}
 *            quantity - quantity of the inventory item
 * @param {String}
 *            imgsrc - source of the image for the inventory item
 * @param {String}
 *            price - price of the inventory item
 * @param {String}
 *            actions - Array of Strings of actions available
 */
function Item(name, quantity, imgsrc, id, action_id, price, cost, actions,adjustments,description) {
	var imgsrc = imgsrc;
	var name = name;
	var quantity = quantity;
	var id = id;
	var action_id = action_id;
	var price = price;
	var cost = cost;
	var actions = actions;
	var adjustments = adjustments;
	var description = description;

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


}

/**
 * Category creates a collection of Inventory items
 * 
 * @constructor
 * @param (String)
 *            name - Text identifier of the category type
 * @param (Integer)
 *            cat_number - Number identifying the associated item market
 *            category
 */
function Category(name, cat_number) {
	var items = new Array();
	var name = name;
	

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

	//check Database for appropriate tables and create if missing, then force check inventory if baseURL is set
	/**
	 * @type {Document}
	 */
	var inventory = function() { 
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
						
						doc.documentElement.appendChild(head);
						doc.documentElement.appendChild(armour);
						doc.documentElement.appendChild(weapons);
						doc.documentElement.appendChild(offhand);
						doc.documentElement.appendChild(edibles);
						doc.documentElement.appendChild(grenades);
						doc.documentElement.appendChild(miscellaneous);
						doc.documentElement.appendChild(poisons);
						doc.documentElement.appendChild(tokens);
						return doc;
					}();

	function write() {
		//write current data to the database
		//replace into? insert on duplicate update?
		
		//2009/03/14 - replace into will lose data if our tree isn't complete 
		
	}
	
	function zeroItems() {
		var items = inventory.evaluate("//item",inventory,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
		for (var i=0,len=items.snapshotLength;i<len;++i) {
			items.snapshotItem(i).setAttribute("quantity",0);
		}
	}
	
	var ajax;
	
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
			ajax = AjaxRequest(piratequesting.baseURL + "/index.php?on=inventory", { onError: function() { alert('Error occurred while updating inventory'); } });
		},

		checkItemGuide : function() {
			ajax = AjaxRequest(piratequesting.baseURL + "/index.php?on=item_guide", { onError: function() { alert('Error occurred while updating item guide'); } });
		},




		//TODO replace this with database
		write : function() {
		},
		
		//TODO this needs massive changes. Say goodbye to friday.... make that sunday.. make the a whole week
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

		processInventory: function(doc){
			//do nothing if the swapspace isn't there. That means the inventory page is in a different mode. 
			//dump("\n\n"+ doc.evaluate("//div[@id='contentarea']/form/table[1]",doc,null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null).snapshotItem(0).innerHTML + "\n\n");
			if (doc.evaluate("not(boolean(descendant-or-self::div[@id='swapspace']))", doc, null, XPathResult.BOOLEAN_TYPE,null).booleanValue) {  return; }
			
						try{
							zeroItems();
							
				function addItem(category,item,equipped) {
					try {
					var name;
					//first need to check if the node actually has something equipped. The best way is to check if the equipment has a name associated with an item_view link. if there's no item_view then it's not a valid item
					if (!item || !category) return;
					if (name = doc.evaluate("descendant-or-self::a[@class='item_view']", item, null, XPathResult.STRING_TYPE,null)) {
						if (!name.stringValue) return;
						name = name.stringValue;
						var image = "/" + doc.evaluate("descendant-or-self::img[1]/@src", item, null, XPathResult.STRING_TYPE,null).stringValue;
						
						var id = doc.evaluate("substring-before(substring-after(descendant-or-self::a[@class='item_view']/@onclick,'id='),'&')", item, null, XPathResult.STRING_TYPE,null).stringValue;
						
						
						var value = (/(\$[.,\d]+)/.exec(doc.evaluate("string(.)", item, null, XPathResult.STRING_TYPE,null).stringValue));
						if (value && value.length > 0) value = value[1].toNumber();
						else value = 0;
						
						
						var action_id = doc.evaluate("substring-after(descendant-or-self::a[starts-with(@href,'index.php?on=inventory&action=')]/@href,'id=')", item, null, XPathResult.STRING_TYPE,null).stringValue;
						var quantity = doc.evaluate("substring-before(substring-after(.[a[@class='item_view']],'[x'),']')", item, null, XPathResult.STRING_TYPE,null).stringValue.toNumber();
						//this will only get the non-'use' actions. If there's a way to do group_concat, I don't know it.
						var action_list =  doc.evaluate("descendant-or-self::a[starts-with(@href,'index.php?on=inventory&action=')]/text()", item, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
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
					}catch (error) { dump("\n" + getErrorString(error) + "\n");}
				}
			var categories = inventory.evaluate("//category", inventory, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
			var category,items,item;
			for (var i = 0, len=categories.snapshotLength; i<len;++i){
				/**
				 * @type {Node}
				 */
				category = categories.snapshotItem(i);
				//this gem gets each item in a cateogory from the inventory page. It does not, however, ghet the equipped items which have to be acquired separately below
				// (//div[@id='"+ category.getAttribute("name") +"'])[1] is used because FM adds each category twice (bug?) and we only want to add the items from one of them.
				// tr[position() mod 2 = 1] is used because every second row is empty
				items = doc.evaluate("(//div[@id='"+ category.getAttribute("name") +"'])[1]/table/tbody/tr[last()]/td/table/tbody/tr[position() mod 2 = 1]/td", doc, null, XPathResult.ANY_TYPE,null);
				while (item = items.iterateNext()) {
					addItem(category,item,0);
				}
				
								
			}
			//now to get the equipped items
			//tbody[contains(tr[1]/td[last()],'Equipped')] is used to find the correct table. -- deprecated. there was enough specificity in other areas that this was unnecessary given its cost
			////td[not(@align)] is used because FM puts out 4 empty columns, carrying the align attribute, then 4 columns with the data we want.
			items = doc.evaluate("//div[@id='contentarea']/form//table[1]/tbody[contains(tr[1]/td[last()],'Equipped')]/tr[2]/td//td[not(@align)]",doc,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
			//There will be exactly 4 results unless FM adds a new category to the equipment... in which case bigger changes need to happen.
			//There should also be 4 categories selected so we'll just use the same index and need to be careful that the order is the same 
			categories = inventory.evaluate("/inventory/category[@id='5' or @id='2' or @id='1' or @id='11'] ", inventory, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
			try {
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

			document.fire('piratequesting:InventoryUpdated');
			}catch(error) { alert(getErrorString(error)); }
		},
		
		processItemGuide: function (doc) {
			try{
			var categories = inventory.evaluate("//category", inventory, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
			
			for (var i = 0, len=categories.snapshotLength; i<len;++i){
				/**
				 * @type {Node}
				 */
				var category = categories.snapshotItem(i);
				var items = doc.evaluate("//div[@id='"+ category.getAttribute("name") +"']//table[@id='item_guide']", doc, null, XPathResult.ANY_TYPE,null);
				while (item = items.iterateNext()) {
					var name = doc.evaluate("descendant-or-self::a[@class='item_view']", item, null, XPathResult.STRING_TYPE,null).stringValue;
					var id = doc.evaluate("substring-before(substring-after(descendant-or-self::a[@class='item_view']/@onclick,'id='),'&')", item, null, XPathResult.STRING_TYPE,null).stringValue;
					var image = "/" + doc.evaluate("descendant-or-self::img[1]/@src", item, null, XPathResult.STRING_TYPE,null).stringValue;
					var cost = (/(\$[.,\d]+)/.exec(doc.evaluate("descendant-or-self::td[@class='bot']", item, null, XPathResult.STRING_TYPE,null).stringValue))[1].toNumber();
					
					var description = doc.evaluate("normalize-space(descendant-or-self::td[@class='desc'][1])", item, null, XPathResult.STRING_TYPE,null).stringValue;
					var features = doc.evaluate("normalize-space(descendant-or-self::table//td[b[.='Features:']])", item, null, XPathResult.STRING_TYPE,null).stringValue;
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
			document.fire('piratequesting:InventoryUpdated');
			}catch(error) { alert(getErrorString(error)); }
		},
		
		process:function(doc) {
			
		},
		
		toString:function() {
			return ((new XMLSerializer()).serializeToString(inventory));
		}
	}
}();


piratequesting.addLoadProcess(new RegExp("index.php\\?on=inventory",""),piratequesting.InventoryManager.processInventory);
piratequesting.addLoadProcess(new RegExp("index.php\\?on=item_guide",""),piratequesting.InventoryManager.processItemGuide);
piratequesting.addLoadProcess(new RegExp("",""),piratequesting.InventoryManager.process);