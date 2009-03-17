var piratequesting = top.piratequesting;

/**
 * @class
 */
piratequesting.Inventory = function() {

	var inventory;

	/**
	 * @private
	 * @function
	 */
	function checkInventory() {
		var sbcd = sidebar.contentDocument;	
		sbcd.getElementById('invmeter').setAttribute('value',0);
		ajax = AjaxRequest(piratequesting.baseURL + "/index.php?on=inventory", { 
				onSuccess: enable, 
				onFailure: function() { enable(); alert('Failed to update Inventory.');}, 
				onError: function() { enable(); alert('Error occurred when updating Inventory.');}, 
				onStateChange: function(http) { var sbcd = sidebar.contentDocument;	sbcd.getElementById('invmeter').setAttribute('value',http.readyState * 25); }
		});
	}

	function hideInventoryBox() {
		var sbcd = sidebar.contentDocument;	
		sbcd.getElementById("invdeck").setAttribute("selectedIndex",
				"0");
		var invd = sbcd.getElementById("invdetails");
		content.focus();
		// clear the details
		while (invd.hasChildNodes())
			invd.removeChild(invd.firstChild);
	}

	function updateInventoryList() {
		var sbcd = sidebar.contentDocument;	
		
		/**
		 * @param {Element} item
		 * @param {Node} cat
		 */
		function newInventoryItem (item, cat) {
			
			// start by creating all of the elements and setting their
			// attributes.
			var container = sbcd.createElement("hbox");
			container.setAttribute("align", "center");

			var image = sbcd.createElement("image");
			image.setAttribute("src", item.getAttribute("image"));
			image.setAttribute("height", "50");
			image.setAttribute("width", "50");

			var labelbox = sbcd.createElement("vbox");
			labelbox.setAttribute("flex", "1");

			var itemlabel = sbcd.createElement("label");
			itemlabel.setAttribute("type", "bold");
			itemlabel.setAttribute("value", item.getAttribute('name') + "  [x"
							+ item.getAttribute("quantity") + "]");

			var actioncontainer = sbcd.createElement("hbox");
			actioncontainer.setAttribute("flex", "1");

			if (item.hasAction("use")) {
				var uselink = sbcd.createElement("label");
				uselink.setAttribute("value", "Use");
				uselink.setAttribute("type", "link");
				uselink.setAttribute("flex", "1");
				uselink.setAttribute("onclick",
						'piratequesting.Inventory.useItem("' + item.getAttribute("action_id")
								+ '");');
				actioncontainer.appendChild(uselink);
			}

			if (item.hasAction("sell")) {
				var selllink = sbcd.createElement("label");
				selllink.setAttribute("value", "Sell");
				selllink.setAttribute("type", "link");
				selllink.setAttribute("flex", "1");
				selllink
						.setAttribute("onclick",
								'piratequesting.Inventory.showInventoryBox("'
										+ item.getAttribute("action_id") + '","' + item.getAttribute("value")
										+ '","' + item.getAttribute("name") + '","'
										+ item.getAttribute('quantity') + '");');
				actioncontainer.appendChild(selllink);
			}

			if (item.hasAction("market")) {
				var marketlink = sbcd.createElement("label");
				marketlink.setAttribute("value", "Market");
				marketlink.setAttribute("type", "link");
				marketlink.setAttribute("flex", "1");
				marketlink.setAttribute("number", item.id);
				marketlink.setAttribute("onclick",
						'piratequesting.Inventory.showInventoryBox("'
								+ item.getAttribute("action_id") + '",0,"' 
								+ item.getAttribute("name") + '","'
								+ item.getAttribute('quantity') + '");');
				actioncontainer.appendChild(marketlink);
			}

			if (item.hasAction("market") || item.hasAction("sell")) {
				var checklink = sbcd.createElement("label");
				checklink.setAttribute("value", "Check Prices");
				checklink.setAttribute("type", "link");
				checklink.setAttribute("flex", "1");
				checklink.setAttribute("onclick",
						'piratequesting.Inventory.showInventoryBox("'
								+ item.getAttribute("action_id") + '",-1,"' 
								+ item.getAttribute("name") + '","'
								+ cat.getAttribute('id') + '");');
				actioncontainer.appendChild(checklink);
			}

			if (item.hasAction("return")) {
				var returnlink = sbcd.createElement("label");
				returnlink.setAttribute("value", "Return");
				returnlink.setAttribute("type", "link");
				returnlink.setAttribute("flex", "1");
				returnlink.setAttribute("onclick",
						'piratequesting.Inventory.returnItem("' + item.getAttribute('id') + '");');
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

		var inventoryList = sbcd.getElementById("inventorylist");

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
	}
	function makeTooltip(id, text) {
		var tt, vb, l;
		var labelset;
		var emptytest = /^[\s]*$/;
		tt = sbcd.createElement("tooltip");
		vb = sbcd.createElement("vbox");
		labelset = text.split("<br>");
		for (var label in labelset) {
			if (!emptytest.test(label)) {
				l = sbcd.createElement("label");
				l.setAttribute("value", label);
				vb.appendChild(l);
			}
		}
		tt.setAttribute("id", "tt" + id);
		tt.position = "end_before";
		tt.appendChild(vb);

		return tt;
	}
	
	function showInventoryBox(id, price, name, qty) {
		sbcd.getElementById("invdeck").setAttribute("selectedIndex",
				"1");
		var invd = sbcd.getElementById("invdetails");

		// clear the details
		while (invd.hasChildNodes())
			invd.removeChild(invd.firstChild);

		var prn = Number(priceToNumber(price));
		if (prn > 0) {
			// selling
			var msg1 = sbcd.createElement("description");
			msg1
					.setAttribute("value", "You have " + qty + " " + name
									+ ".");
			var msg3 = sbcd.createElement("description");
			msg3.setAttribute("value", "How many would you like to sell?");
			invd.appendChild(msg1);
			invd.appendChild(msg3);

			var sellbox = sbcd.createElement("hbox");
			sellbox.setAttribute("align", "center");

			var qtyin = sbcd.createElement("textbox");
			qtyin.setAttribute("type", "number");
			qtyin.setAttribute("width", "50");
			qtyin.setAttribute("id", "qtyin");
			qtyin.setAttribute("max", qty);
			qtyin.setAttribute("min", 0);

			var hiddenpricein = sbcd.createElement("textbox");
			hiddenpricein.setAttribute("value", prn);
			hiddenpricein.setAttribute("id", "pricein");
			hiddenpricein.setAttribute("type", "hide");

			var hiddenid = sbcd.createElement("textbox");
			hiddenid.setAttribute("value", id);
			hiddenid.setAttribute("id", "item_id");
			hiddenid.setAttribute("type", "hide");

			var pricelabel = sbcd.createElement("label");
			pricelabel.setAttribute("value", " @ " + price + " each");

			var totalbox = sbcd.createElement("hbox");
			totalbox.setAttribute("align", "center");

			var totallabel = sbcd.createElement("label");
			totallabel.setAttribute("value", "Total: $");

			var resultlabel = sbcd.createElement("label");
			resultlabel.setAttribute("value", "0");
			resultlabel.setAttribute("id", "result");

			var buttonbox = sbcd.createElement("hbox");
			buttonbox.setAttribute("align", "center");

			var actionbutton = sbcd.createElement("button");
			actionbutton.setAttribute("label", "Sell");
			actionbutton.setAttribute("id", "actionbutton");
			actionbutton.setAttribute("maxwidth", "70");
			actionbutton
					.setAttribute(
							"oncommand",
							'if (confirm("Are you sure you want to do this?"))  piratequesting.Inventory.sellitem()');

			var cancelbutton = sbcd.createElement("button");
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
			sbcd.getElementById("qtyin").addEventListener("change",
					piratequesting.Inventory.giveResult, true);
			sbcd.getElementById("qtyin").addEventListener("input",
					piratequesting.Inventory.giveResult, true);
			sbcd.getElementById('qtyin').addEventListener('keypress',
					piratequesting.Inventory.HandleKeyPressItems, true);
			sbcd.getElementById("qtyin").focus();
			// sbcd.getElementById("qtyin").addEventListener("command",
			// function () {
			// sbcd.getElementById("sellbutton").doCommand(); }, true);

		} else if (prn == 0) {
			// marketing

			var msg1 = sbcd.createElement("description");
			msg1
					.setAttribute("value", "You have " + qty + " " + name
									+ ".");
			var msg2 = sbcd.createElement("description");
			msg2.setAttribute("value",
					"How many would you like to put on the market?");
			var msg3 = sbcd.createElement("description");
			msg3.setAttribute("value", "And for how much?");
			invd.appendChild(msg1);
			invd.appendChild(msg2);
			invd.appendChild(msg3);

			var sellbox = sbcd.createElement("hbox");
			sellbox.setAttribute("align", "center");

			var qtyin = sbcd.createElement("textbox");
			qtyin.setAttribute("type", "number");
			qtyin.setAttribute("width", "50");
			qtyin.setAttribute("id", "qtyin");
			qtyin.setAttribute("max", qty);
			qtyin.setAttribute("min", 0);

			var pricein = sbcd.createElement("textbox");
			// pricein.setAttribute("value",prn);
			pricein.setAttribute("id", "pricein");
			pricein.setAttribute("wdith", "70");

			var hiddenid = sbcd.createElement("textbox");
			hiddenid.setAttribute("value", id);
			hiddenid.setAttribute("id", "item_id");
			hiddenid.setAttribute("type", "hide");

			var pricelabel = sbcd.createElement("label");
			pricelabel.setAttribute("value", " @ $");

			var pricelabel2 = sbcd.createElement("label");
			pricelabel2.setAttribute("value", " each");

			var totalbox = sbcd.createElement("hbox");
			totalbox.setAttribute("align", "center");

			var totallabel = sbcd.createElement("label");
			totallabel.setAttribute("value", "Total: $");

			var resultlabel = sbcd.createElement("label");
			resultlabel.setAttribute("value", "0");
			resultlabel.setAttribute("id", "result");

			var buttonbox = sbcd.createElement("hbox");
			buttonbox.setAttribute("align", "center");

			var actionbutton = sbcd.createElement("button");
			actionbutton.setAttribute("label", "Market");
			actionbutton.setAttribute("id", "actionbutton");
			actionbutton.setAttribute("maxwidth", "70");
			actionbutton
					.setAttribute(
							"oncommand",
							'if (confirm("Are you sure you want to do this?"))  piratequesting.Inventory.marketitem()');

			var cancelbutton = sbcd.createElement("button");
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

			sbcd.getElementById("qtyin").addEventListener("change",
					piratequesting.Inventory.giveResult, true);
			sbcd.getElementById("qtyin").addEventListener("input",
					piratequesting.Inventory.giveResult, true);
			sbcd.getElementById('qtyin').addEventListener('keypress',
					piratequesting.Inventory.HandleKeyPressItems, true);
			sbcd.getElementById("pricein").addEventListener("input",
					piratequesting.Inventory.giveResult, true);
			sbcd.getElementById('pricein').addEventListener('keypress',
					piratequesting.Inventory.HandleKeyPressItems, true);
			sbcd.getElementById("qtyin").focus();
		} else if (prn < 0) {
			// checking prices
			// note qty is treated at the category number for the item
			// market here.
			var cat = qty;
			var msg1 = sbcd.createElement("description");
			msg1.setAttribute("value", "Current market prices for:");
			var msg2 = sbcd.createElement("description");
			msg2.setAttribute("value", name);
			msg2.setAttribute("style", "padding-left:20px;")

			invd.appendChild(msg1);
			invd.appendChild(msg2);

			var buttonbox = sbcd.createElement("hbox");
			buttonbox.setAttribute("align", "center");

			var cancelbutton = sbcd.createElement("button");
			cancelbutton.setAttribute("label", "Close");
			cancelbutton.setAttribute("id", "cancelbutton");
			cancelbutton.setAttribute("maxwidth", "70");
			cancelbutton.setAttribute("oncommand",
					'piratequesting.Inventory.hideInventoryBox()');

			buttonbox.appendChild(cancelbutton);

			var pricebox = sbcd.createElement("hbox");
			var pricelist = sbcd.createElement("listbox");
			pricelist.setAttribute("id", "pricelist");
			var spacer = sbcd.createElement("box");
			spacer.setAttribute("flex", "1");
			// pricelist.setAttribute("style","");
			// pricelist.setAttribute("max-height", "120");

			pricebox.appendChild(pricelist);
			pricebox.appendChild(spacer);
			invd.appendChild(pricebox);
			invd.appendChild(buttonbox);
			piratequesting.Inventory.getPrices(cat, name);
		}

	}
	
	function getPrices (cat, name) {
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
			sbcd.getElementById('invmeter').setAttribute(
					'value',
					Number(sbcd.getElementById('invmeter')
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
	}

	function processPrices(name, text) {
		var pricelist = sbcd.getElementById("pricelist");
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
					li = sbcd.createElement("listitem");
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
					li = sbcd.createElement("listitem");
					li.setAttribute("label", match[1] + "  " + match[2]);
					li.setAttribute("order", (order % 2) ? "odd" : "even");
					pricelist.appendChild(li);
					match = itemex.exec(text);
				}
			} else
				alert("Error retrieving prices. Page returned by server\nwas not the item market");
		}

		piratequesting.Inventory.enableInventory();
	}

	function disable() {
		sbcd.getElementById('invdeck').setAttribute("type", "cover");
		sbcd.getElementById('invcb').setAttribute("type", "cbox");
		sbcd.getElementById('invmeter').setAttribute('value', '0');
	}

	function enable() {
		sbcd.getElementById('invdeck').setAttribute("type", "");
		sbcd.getElementById('invcb').setAttribute("type", "hide");
	}

	return /** @lends piratequesting.Inventory.prototype */{
		
		/**
		 * @param {Number} id
		 */
		returnItem : function(id) {
			disable();
			var sbcd = sidebar.contentDocument;	
			sbcd.getElementById('invmeter').setAttribute('value',0);
			ajax = AjaxRequest(piratequesting.baseURL + "/index.php?on=inventory&action=return&id=" + id, { 
					onSuccess: checkInventory, 
					onFailure: function() { enable(); alert('Failed to return item.');}, 
					onError: function() { enable(); alert('Error occurred when returning item.');}, 
					onStateChange: function(http) { var sbcd = sidebar.contentDocument;	sbcd.getElementById('invmeter').setAttribute('value',http.readyState * 25); }
			});
		},

		process : function () {
			inventory = piratequesting.InventoryManager.getInventory();
			dump("\nEvent received; process launched\n");
		},
		
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
				sbcd.getElementById('invmeter').setAttribute(
						'value',
						Number(sbcd.getElementById('invmeter')
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
		
		
		//TODO Move to Inventory Module
		HandleKeyPressItems : function(e) {
			switch (e.keyCode) {
				case e.DOM_VK_RETURN :
				case e.DOM_VK_ENTER :
					sbcd.getElementById("actionbutton").doCommand();
				case e.DOM_VK_ESCAPE :
					content.focus();
					return;
			}
		},

		//TODO Move to Inventory Module
		giveResult : function() {
			var qty = Number(sbcd.getElementById("qtyin").value);
			var price = Number(sbcd.getElementById("pricein").value);
			var result = addCommas(String(qty * price));

			sbcd.getElementById("result").setAttribute("value", result);
		},

		//TODO Move to Inventory Module
		sellitem : function() {
			piratequesting.Inventory.disableInventory();
			var qty = sbcd.getElementById("qtyin").value;
			var id = sbcd.getElementById("item_id").value;

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
				sbcd.getElementById('invmeter').setAttribute(
						'value',
						Number(sbcd.getElementById('invmeter')
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
			var qty = sbcd.getElementById("qtyin").value;
			var id = sbcd.getElementById("item_id").value;
			var price = sbcd.getElementById("pricein").value;
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
				sbcd.getElementById('invmeter').setAttribute(
						'value',
						Number(sbcd.getElementById('invmeter')
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

			
		abort : function() {
			enable();
		}
	
	}
}();

document.addEventListener("piratequesting:InventoryUpdated",function(event){ piratequesting.Inventory.process(); }, false);