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
		var ajax;
		sbcd.getElementById('invmeter').setAttribute('value',0);
		ajax = AjaxRequest(piratequesting.baseURL + "/index.php?on=inventory", { 
				proc:true,
				onSuccess: enable, 
				onFailure: function() { enable(); dumpError('Failed to update Inventory.');}, 
				onError: function() { enable(); dumpError('Error occurred when updating Inventory.');}, 
				onStateChange: function(http) { var sbcd = sidebar.contentDocument;	sbcd.getElementById('invmeter').setAttribute('value',http.readyState * 25); },
				proc : true
		});
	}

	function hideInventoryBox() {
		var sbcd = sidebar.contentDocument;	
		sbcd.getElementById("invdeck").setAttribute("selectedIndex", "0");
		var invd = sbcd.getElementById("invdetails");
		content.focus();
		// clear the details
		while (invd.hasChildNodes())
			invd.removeChild(invd.firstChild);
	}
	
	/**
	 * @param {Element} item
	 * @param {Element} cat
	 */
	function newInventoryItem (item, cat) {
		var sbcd = sidebar.contentDocument;	
	
		var actions = item.getAttribute("actions");
		var canUse = actions & USE,
			canSell = actions & SELL,
			canMarket = actions & MARKET,
			canReturn = actions & RETURN;
			
		
		// start by creating all of the elements and setting their attributes.
		var container = sbcd.createElement("hbox");
		container.setAttribute("align", "center");
		container.setAttribute("id", "IL" + item.getAttribute("action_id"));
		var img_src = item.getAttribute("image");
		if ((-1 === img_src.indexOf("chrome://"))&&(-1 === img_src.indexOf("http://"))) {
				img_src = piratequesting.baseURL + "/" + img_src;
		}
		var image = sbcd.createElement("image");
		image.setAttribute("src",  img_src);
		
		var labelbox = sbcd.createElement("vbox");
		labelbox.setAttribute("flex", "1");

		var itemlabel = sbcd.createElement("label");
		itemlabel.setAttribute("type", "bold");
		itemlabel.setAttribute("crop", "center");
		itemlabel.setAttribute("value", item.getAttribute('name') + "  [x"
						+ item.getAttribute("quantity") + "]");

		var actioncontainer = sbcd.createElement("hbox");
		actioncontainer.setAttribute("flex", "1");

		if (canUse) {
			var uselink = sbcd.createElement("label");
			uselink.setAttribute("value", "Use");
			uselink.setAttribute("type", "link");
			uselink.setAttribute("flex", "1");
			uselink.setAttribute("onclick", 'piratequesting.Inventory.useItem("' + item.getAttribute("action_id") + '");');
			actioncontainer.appendChild(uselink);
		}

		if (canSell) {
			var selllink = sbcd.createElement("label");
			selllink.setAttribute("value", "Sell");
			selllink.setAttribute("type", "link");
			selllink.setAttribute("flex", "1");
			selllink.setAttribute("onclick",'piratequesting.Inventory.showInventoryBox("' + item.getAttribute("action_id") + '","' + item.getAttribute("value") + '","' + item.getAttribute("name") + '","' + item.getAttribute('quantity') + '");');
			actioncontainer.appendChild(selllink);
		}

		if (canMarket) {
			var marketlink = sbcd.createElement("label");
			marketlink.setAttribute("value", "Market");
			marketlink.setAttribute("type", "link");
			marketlink.setAttribute("flex", "1");
			marketlink.setAttribute("number", item.getAttribute("action_id"));
			marketlink.setAttribute("onclick", 'piratequesting.Inventory.showInventoryBox("' + item.getAttribute("action_id") + '",0,"' + item.getAttribute("name") + '","' + item.getAttribute('quantity') + '");');
			actioncontainer.appendChild(marketlink);
		}

		if (canMarket || canSell) {
			var checklink = sbcd.createElement("label");
			checklink.setAttribute("value", "Check Prices");
			checklink.setAttribute("type", "link");
			checklink.setAttribute("flex", "1");
			checklink.setAttribute("onclick", 'piratequesting.Inventory.showInventoryBox("' + item.getAttribute("action_id") + '",-1,"' + item.getAttribute("name") + '","' + cat + '");');
			actioncontainer.appendChild(checklink);
		}

		if (canReturn) {
			var returnlink = sbcd.createElement("label");
			returnlink.setAttribute("value", "Return");
			returnlink.setAttribute("type", "link");
			returnlink.setAttribute("flex", "1");
			returnlink.setAttribute("onclick", 'piratequesting.Inventory.returnItem("' + item.getAttribute('action_id') + '");');
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
	
	//var forced__points_update_count = 0;
	function updateInventoryItem(event, repeat) {
		
		
		var sbcd = sidebar.contentDocument;
		if (!sbcd || !sbcd.getElementById('inventorylist') || !sbcd.getElementById('invdetails')) {			//if stuff isn't loaded yet, wait 2 seconds and try again
			if (repeat)
				setTimeout(updateInventoryItem.bind(piratequesting.Inventory,event,true),2000);
			return;
		}
		
		if (!event || !event.relatedTarget){
			dumpError("Failed to update inventory item. Related target not found.\n");
			return false;
		}
		
		
		/**
		 * @type {Element}
		 */
		var inventoryList = sbcd.getElementById("inventorylist");

		//first check if it's empty,
		//if it is, then pass this on to updateInventoryList because all of the data should be added first.
		//if not, then find the points element (if it exists)　and delete it
		//but, anyways, create a new one　and insert in the beginning of the list
		
		if (!inventoryList.hasChildNodes()) {
			updateInventoryList();
			return false;
		}
		
		var item = event.relatedTarget;
		
		var ILitem = sbcd.getElementById("IL" + item.getAttribute('id'));
		if (!ILitem) return false; //failed to find matching element
		
		var category = inventory.evaluate("ancestor::category", item, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
		var newItem;
		if (category.snapshotLength > 0 ) {
			newItem = newInventoryItem(item, category.snapshotItem(0).getAttribute("name"));
			
		} else { //this should be points. Might want to consider putting points in a points category and start treating it like everything else
			newItem = newInventoryItem(item, "points");
		}
		inventoryList.replaceChild(newItem,ILitem);
		//} else return;
		
		return true;
	}
	
	
	function updateInventoryList(event, repeat) {
		if (event && event.relatedTarget) {
			if (updateInventoryItem(event, repeat))
				return;
		}
		var sbcd = sidebar.contentDocument;
		if (!sbcd || !sbcd.getElementById('inventorylist') || !sbcd.getElementById('invdetails')) {			//if stuff isn't loaded yet, wait 2 seconds and try again
			if (repeat)
				setTimeout(updateInventoryList.bind(piratequesting.Inventory,event,true),2000);
			return;
		}

		
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

		var points = inventory.evaluate("/inventory/item[@id='points' and @quantity>0]", inventory, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
		if (points.snapshotLength > 0 ) {
			inventoryList.appendChild(newInventoryItem(points.snapshotItem(0), "points"));
		}
		var items = inventory.evaluate("/inventory/category/item[@quantity>0]", inventory, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null); 
		for (var i = 0, len=items.snapshotLength; i < len; ++i) {
			inventoryList.appendChild(newInventoryItem(items.snapshotItem(i), items.snapshotItem(i).parentNode.getAttribute('id')));
		}

	}
		
	function getPrices (cat, name) {
		disable();
		var url = (cat == "points") ? piratequesting.baseURL  + "/index.php?on=points_market" : piratequesting.baseURL 	+ "/index.php?ajax=item_market&category=" + cat;
		var sbcd = sidebar.contentDocument;
		var ajax;
		sbcd.getElementById('invmeter').setAttribute('value',0);
		ajax = AjaxRequest(url, { 
				proc:false,
				onSuccess: function (http) { processPrices(name,http.responseText); }, 
				onFailure: function() { enable(); dumpError('Failed to get prices from market.');}, 
				onError: function() { enable(); dumpError('Error occurred when getting prices from market.');}, 
				onStateChange: function(http) { var sbcd = sidebar.contentDocument;	sbcd.getElementById('invmeter').setAttribute('value',http.readyState * 25); }
		});
	}

	function processPrices(name, text) {
		var sbcd = sidebar.contentDocument;	
		var pricelist = sbcd.getElementById("pricelist");
		var stripex;
		var doc = piratequesting.createDoc(text);
		var li;
		if (name == "Points") {
			if (doc.evaluate("boolean(descendant::h2[. = 'Points Market']|descendant::h1[. = 'Points Market'])", doc, null,XPathResult.BOOLEAN_TYPE,null).booleanValue) {
				//the following gets the quantity and price in one query so we have to account for that in the for-loop
				var items = doc.evaluate("descendant::table[@class='utable' or @class='dark_utable']//tr[position() > 1]/td[position() = 1 or position() = 2]", doc, null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
				for (var i =0, len=items.snapshotLength;i<len;i+=2) {
					
					li = sbcd.createElement("listitem");
					li.setAttribute("label",  items.snapshotItem(i).textContent + " @ " + items.snapshotItem(i+1).textContent);
					li.setAttribute("order", (i % 4) ? "odd" : "even");
					pricelist.appendChild(li);
					
				}
				} else
					dumpError("Error retrieving prices. Page returned by server\nwas not the points market.");

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
				dumpError("Error retrieving prices. Page returned by server\nwas not the item market");
		}

		enable();
	}

	function disable() {
		var sbcd = sidebar.contentDocument;	
			
		sbcd.getElementById('invdeck').setAttribute("type", "cover");
		sbcd.getElementById('invcb').setAttribute("type", "cbox");
		sbcd.getElementById('invmeter').setAttribute('value', '0');
	}

	function enable() {
		var sbcd = sidebar.contentDocument;	
			
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
			var ajax;
			sbcd.getElementById('invmeter').setAttribute('value',0);
			ajax = AjaxRequest(piratequesting.baseURL + "/index.php?on=inventory&action=return&id=" + id, { 
					onSuccess: checkInventory, 
					onFailure: function() { enable(); dumpError('Failed to return item.');}, 
					onError: function() { enable(); dumpError('Error occurred when returning item.');}, 
					onStateChange: function(http) { var sbcd = sidebar.contentDocument;	sbcd.getElementById('invmeter').setAttribute('value',http.readyState * 25); }
			});
		},

		process : function (event, repeat) {
			inventory = piratequesting.InventoryManager.getInventory();
			try {
				updateInventoryList(event, repeat);
			}catch(e) { dumpError(e); }
		},
		
		processPoints : function (event) {
			inventory = piratequesting.InventoryManager.getInventory();
			try {
				updateInventoryItem(event);
			}catch(e) { dumpError(e); }
		},
		
		showInventoryBox : function(id, price, name, qty) {
			try {
					/**
					 * @type {Document}
					 */
				var sbcd = sidebar.contentDocument;	
				
				sbcd.getElementById("invdeck").setAttribute("selectedIndex",
						"1");
				var invd = sbcd.getElementById("invdetails");
		
				// clear the details
				while (invd.hasChildNodes())
					invd.removeChild(invd.firstChild);
		
				var prn = String(price).toNumber();
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
					cancelbutton.addEventListener("command",hideInventoryBox,false);
		
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
					
				} else if (prn == 0) {
					// marketing
		
					var msg1 = sbcd.createElement("description");
					msg1
							.setAttribute("value", "You have " + qty + " " + name
											+ ".");
					var msg2 = sbcd.createElementNS("http://www.w3.org/1999/xhtml","html:div");
					msg2.appendChild(sbcd.createTextNode("How many would you like to put on the market? And for how much?"));
					invd.appendChild(msg1);
					invd.appendChild(msg2);
					
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
					pricein.setAttribute("width", "70");
		
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
					actionbutton.setAttribute("oncommand", 'if (confirm("Are you sure you want to do this?"))  piratequesting.Inventory.marketitem()');
		
					var cancelbutton = sbcd.createElement("button");
					cancelbutton.setAttribute("label", "Cancel");
					cancelbutton.setAttribute("id", "cancelbutton");
					cancelbutton.setAttribute("maxwidth", "70");
					cancelbutton.addEventListener("command",hideInventoryBox,false);
		
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
					cancelbutton.addEventListener("command",hideInventoryBox,false);
		
					buttonbox.appendChild(cancelbutton);
		
					var pricebox = sbcd.createElement("hbox");
					var pricelist = sbcd.createElement("listbox");
					pricelist.setAttribute("id", "pricelist");
					var spacer = sbcd.createElement("box");
					spacer.setAttribute("flex", "1");
					
					pricebox.appendChild(pricelist);
					pricebox.appendChild(spacer);
					invd.appendChild(pricebox);
					invd.appendChild(buttonbox);
					getPrices(cat, name);
				}
			} catch(e) { 
				dumpError(e); 
			}
		},
		
		useItem : function(id) {
			disable();
			var sbcd = sidebar.contentDocument;	
			sbcd.getElementById('invmeter').setAttribute('value',0);
			var ajax;
			ajax = AjaxRequest(piratequesting.baseURL + "/index.php?ajax=items", { 
						protocol: "post",
						proc:true,
						onSuccess: function() { enable(); /*AjaxRequest(piratequesting.baseURL+"/index.php?on=inventory");*/ }, 
						onFailure: function() { enable(); dumpError('Failed to use item.');}, 
						onError: function() { enable(); dumpError('Error occurred when using item.');}, 
						onStateChange: function(http) { var sbcd = sidebar.contentDocument;	sbcd.getElementById('invmeter').setAttribute('value',http.readyState * 25); },
						params: "action=use&useamount=1&id=" + id
						
				});
		},
		
		HandleKeyPressItems : function(e) {
			var sbcd = sidebar.contentDocument;	
			switch (e.keyCode) {
				case e.DOM_VK_RETURN :
				case e.DOM_VK_ENTER :
					sbcd.getElementById("actionbutton").doCommand();
				case e.DOM_VK_ESCAPE :
					content.focus();
					return;
			}
		},

		giveResult : function() {
			var sbcd = sidebar.contentDocument;	
			
			var qty = sbcd.getElementById("qtyin").value.toNumber();
			var price = sbcd.getElementById("pricein").value.toNumber();
			var result = String(qty * price).addCommas();

			sbcd.getElementById("result").setAttribute("value", result);
		},

		sellitem : function() {
			disable();
			var sbcd = sidebar.contentDocument;	
			sbcd.getElementById('invmeter').setAttribute('value',0);
			var qty = sbcd.getElementById("qtyin").value;
			var id = sbcd.getElementById("item_id").value;
			var ajax;

			ajax = AjaxRequest(piratequesting.baseURL + "/index.php?on=inventory&action=sell&id=" + id, { 
						protocol: "post",
						proc:true,
						onSuccess: function() { enable(); hideInventoryBox(); AjaxRequest(piratequesting.baseURL+"/index.php?on=inventory"); }, 
						onFailure: function() { enable(); hideInventoryBox(); dumpError('Failed to sell item.');}, 
						onError: function() { enable(); hideInventoryBox(); dumpError('Error occurred when attempting to sell item.');}, 
						onStateChange: function(http) { var sbcd = sidebar.contentDocument;	sbcd.getElementById('invmeter').setAttribute('value',http.readyState * 25); },
						params: "quantity=" + qty + "&sell=Sell"
						
				});
		},

		marketitem : function() {
			disable();
			var sbcd = sidebar.contentDocument;	
			sbcd.getElementById('invmeter').setAttribute('value',0);
			var qty = sbcd.getElementById("qtyin").value;
			var id = sbcd.getElementById("item_id").value;
			var price = sbcd.getElementById("pricein").value;
			var url = (id != "points") ? piratequesting.baseURL + "/index.php?on=inventory&action=market&id=" + id : piratequesting.baseURL + "/index.php?on=points_market";
			var ajax;

			ajax = AjaxRequest(url, { 
						protocol: "post",
						proc:true,
						onSuccess: function() { enable(); hideInventoryBox(); AjaxRequest(piratequesting.baseURL+"/index.php?on=inventory"); }, 
						onFailure: function() { enable(); hideInventoryBox(); dumpError('Failed to sell item.');}, 
						onError: function() { enable(); hideInventoryBox(); dumpError('Error occurred when attempting to sell item.');}, 
						onStateChange: function(http) { var sbcd = sidebar.contentDocument;	sbcd.getElementById('invmeter').setAttribute('value',http.readyState * 25); },
						params: "quantity=" + qty + "&cost=" + price + "&market=Add"
						
				});
		},

			
		abort : function() {
			enable();
			ajax.abort();
		}
	
	}
}();
document.addEventListener("piratequesting:InventoryPointsUpdated",function(event){ piratequesting.Inventory.processPoints(event); }, false);
document.addEventListener("piratequesting:InventoryUpdated",function(event){ piratequesting.Inventory.process(event); }, false);