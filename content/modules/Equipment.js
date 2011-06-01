var piratequesting = top.piratequesting;
var mainWindow = mainWindow
		|| window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
				.getInterface(Components.interfaces.nsIWebNavigation)
				.QueryInterface(Components.interfaces.nsIDocShellTreeItem).rootTreeItem
				.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
				.getInterface(Components.interfaces.nsIDOMWindow);
var sidebar = sidebar || mainWindow.document.getElementById("sidebar");

piratequesting.Equipment = function() {

	var last_check = 0;
	var inventory;
	var ajax;
	
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
	function updateMenu (category_id, skip) {
		/**
		 * @type {Document}
		 */
		var sbcd = sidebar.contentDocument;
		
		
		var skip = skip || false;
		var mi, tt,id;
		var eqi,items,item;
		var ttbox = sbcd.getElementById("ttbox");
		// clear menu
		var success = true;
		
		// clear tooltips
		// while(ttbox.hasChildNodes())
		// ttbox.removeChild(ttbox.childNodes[0]);

		//check the category by name or by id number
		var cat = inventory.evaluate("/inventory/category[@id='"+ category_id + "' or @name='"+ category_id +"']", inventory, null, XPathResult.ANY_UNORDERED_NODE_TYPE,null).singleNodeValue;
		if (!cat) {
			return;	//The category doesn't exist. bail!
		}
	
		var menu_id = cat.getAttribute("name") + "_menu";
		var wm = sbcd.getElementById(menu_id);
		while (wm.hasChildNodes())
			wm.removeChild(wm.childNodes[0]);
		
		if (eqi = inventory.evaluate(".//item[@equipped='1']", cat, null, XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue) {
				
			mi = sbcd.createElement("menuitem");
			mi.setAttribute("label", "Unequip " + eqi.getAttribute("name"));
			mi.setAttribute("value", eqi.getAttribute("action_id"));
			mi.setAttribute("oncommand", "piratequesting.Equipment.unequip(this.value)");
			wm.appendChild(mi);
			
			var img_src = eqi.getAttribute('image');
			if ((-1 === img_src.indexOf("chrome://"))&&(-1 === img_src.indexOf("http://"))) {
				img_src = piratequesting.baseURL + "/" + img_src;
			}
			sbcd.getElementById(cat.getAttribute("name") + "_image").setAttribute("src", img_src);
			sbcd.getElementById(cat.getAttribute("name") + "_label").setAttribute("value", eqi.getAttribute('name'));
		} else {
			// add the unequipped items to the menu, create the associated
			// labels, values and oncommand action
			items = inventory.evaluate(".//item[@equipped='0' and @quantity>0]", cat, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
			if (items.snapshotLength <= 0) {
				mi = sbcd.createElement("menuitem");
				mi.setAttribute("label", "No items...");
				wm.appendChild(mi);
			}
			else {
				for (var i = 0, len = items.snapshotLength; i < len; ++i) {
					item = items.snapshotItem(i);
					// get the item
					// guide and start
					// over
					id = item.getAttribute("action_id");	
					mi = sbcd.createElement("menuitem");
					mi.setAttribute("label", "Equip " + item.getAttribute("name"));
					mi.setAttribute("value", id);
					mi.setAttribute("oncommand","piratequesting.Equipment.equip(this.value)");
					var old_one =  sbcd.getElementById("tt" + id);
					tt = makeTooltip(id);
					if (old_one) sbcd.getElementById('ttbox').replaceChild(tt,old_one);
					else sbcd.getElementById('ttbox').appendChild(tt);
					mi.setAttribute("tooltip", tt.getAttribute("id"));
					mi.setAttribute("popupanchor", "topright");
					wm.appendChild(mi);
				}
			}
			
			switch (cat.getAttribute("name")) {
				case "weapons":
					sbcd.getElementById("weapons_image").setAttribute("src", piratequesting.baseURL + "/images/fists.gif");
					break;
				case "head":
					sbcd.getElementById("head_image").setAttribute("src", piratequesting.baseURL + "/images/head.gif");
					break;
				case "armour":
					sbcd.getElementById("armour_image").setAttribute("src", piratequesting.baseURL + "/images/armor.gif");
					break;
				case "offhand":
					sbcd.getElementById("offhand_image").setAttribute("src", piratequesting.baseURL + "/images/offhand.gif");
					break;
				case "coats":
					sbcd.getElementById("coats_image").setAttribute("src", piratequesting.baseURL + "/images/coat.gif");
					break;
				case "feet":
					sbcd.getElementById("feet_image").setAttribute("src", piratequesting.baseURL + "/images/foot.gif");
					break;
				case "leggings":
					sbcd.getElementById("leggings_image").setAttribute("src", piratequesting.baseURL + "/images/legs.gif");
					break;
				case "accessories":
					sbcd.getElementById("accessories_image").setAttribute("src", piratequesting.baseURL + "/images/accessories.gif");
					break;
			}
			sbcd.getElementById(cat.getAttribute("name") + "_label").setAttribute("value", "Nothing!");
		}
		return true;
	}

	function makeTooltip (id, text) {
		var sbcd = sidebar.contentDocument;
		var tt, vb, l,feature;
		tt = sbcd.createElement("tooltip");
		vb = sbcd.createElement("vbox");
		tt.setAttribute("id", "tt" + id);
		tt.id = "tt" + id;
		
		var features = inventory.evaluate("/inventory/category/item[@action_id='"+id+"']//feature", inventory, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);

		for (var i=0,len=features.snapshotLength;i<len;++i) {
			feature = features.snapshotItem(i);
			l = sbcd.createElement("label");
			l.setAttribute("value", feature.getAttribute('type') + ": " + feature.getAttribute('value'));
			vb.appendChild(l);
		}
		
		tt.setAttribute("id", "tt" + id);
		tt.position = "end_before";
		tt.appendChild(vb);

		return tt;
	}
	
			
	function disable() {
		var sbcd = sidebar.contentDocument;

		sbcd.getElementById('equiplist').setAttribute("type", "cover");
		sbcd.getElementById('eqcb').setAttribute("type", "cbox");
		sbcd.getElementById('eqmeter').setAttribute('value', '0');
	}

	function enable() {
		var sbcd = sidebar.contentDocument;	
		sbcd.getElementById('equiplist').setAttribute("type", "");
		sbcd.getElementById('eqcb').setAttribute("type", "hide");
	}
	
	function checkInventory() {
		pqdump("\nPQ: Requesting Inventory for forced update\n",PQ_DEBUG_STATUS);
		var sbcd = sidebar.contentDocument;	
		sbcd.getElementById('eqmeter').setAttribute('value',0);
		ajax = AjaxRequest(piratequesting.baseURL + "/index.php?on=inventory&m=1", { 
				onSuccess: function() { try { enable(); pqdump("\n\tInventory check succeeded.\n") } catch (error) {dumpError(error);} }, 
				onFailure: function() { enable(); dumpError('\n\tFailed to update Inventory.\n');}, 
				onError: function() { enable(); dumpError('\n\tError occurred when updating Inventory.\n');}, 
				onStateChange: function(http) { var sbcd = sidebar.contentDocument;	sbcd.getElementById('eqmeter').setAttribute('value',http.readyState * 25); },
					proc: true
		});
	}
	
	function equipmentMenusLoaded() {
		return (sbcd.getElementById("weapons_menu") &&  
				sbcd.getElementById("head_menu") &&
				sbcd.getElementById("armour_menu") && 
				sbcd.getElementById("coats_menu") &&
				sbcd.getElementById("leggings_menu") && 
				sbcd.getElementById("feet_menu") &&
				sbcd.getElementById("accessories_menu") && 
				sbcd.getElementById("offhand_menu"));
	}
	
	var forced_update_count = 0;
	function update (fromEvent) {
		if (!fromEvent) {
			++forced_update_count;
			if (forced_update_count >= 2) return;
		} else {
			forced_update_count = 0;
		}
		
		var sbcd = sidebar.contentDocument;
		if (!sbcd) return;
		
		if (!equipmentMenusLoaded()) {
			setTimeout(update,3000);
			return;
		}
		
		
		if (inventory.evaluate("boolean(/inventory/category[@id=1 or @id=2 or @id=5 or @id=11 or @id=15 or @id=16 or @id=17 or @id=18]/item[not(@cost)])", inventory, null, XPathResult.BOOLEAN_TYPE,null).booleanValue) {
			try {
				var cur_time = (new Date()).getTime();  
				if (cur_time - last_check > 5000) {
					last_check = cur_time;
					piratequesting.InventoryManager.checkItemGuide();
				} else {
					var bad_items = inventory.evaluate("/inventory/category[@id=1 or @id=2 or @id=5 or @id=11 or @id=15 or @id=16 or @id=17 or @id=18]/item[not(@cost)]", inventory, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
					pqdump("Items lacking Item guide entries:\n")
					for (var i=0,len=bad_items.snapshotLength;i<len;++i) {
						var bad_item = bad_items.snapshotItem(i);
						pqdump("\t"+bad_item.getAttribute("name")+"\n");
					}

					throw "Error Processing Item Guide Data in Equipment.js";
				}
			}
			catch(e) {
				dumpError(e);
			}
			return; // item description not found. bail.
		} else {
			updateMenu("weapons");
			updateMenu("head");
			updateMenu("armour");
			updateMenu("offhand");
			updateMenu("coats");
			updateMenu("feet");
			updateMenu("leggings");
			updateMenu("accessories");
		}	
		
	}
	
	return {
		
		unequip : function(id) {
			pqdump("PQ: Equipping Item\n", PQ_DEBUG_STATUS);
			pqdump("\tItem ID: "+ id + "\n");
			disable();
			var sbcd = sidebar.contentDocument;	
			sbcd.getElementById('invmeter').setAttribute('value',0);
			//onSuccess: checkInventory, 
			pqdump("\tAjax call to: " + piratequesting.baseURL + "/index.php?on=inventory&action=unequip&id=" + id + "\n");
			ajax = AjaxRequest(piratequesting.baseURL + "/index.php?on=inventory&action=unequip&id=" + id, {
					onSuccess: enable, 
					onFailure: function() { enable(); dumpError('Failed to unequip item.');}, 
					onError: function() { enable(); dumpError('Error occurred when unequipping item.');}, 
					onStateChange: function(http) { var sbcd = sidebar.contentDocument;	sbcd.getElementById('eqmeter').setAttribute('value',http.readyState * 25); },
					proc: true
			});
		},

		equip : function(id) {
			
			pqdump("PQ: Equipping Item\n", PQ_DEBUG_STATUS);
			pqdump("\tItem ID: "+ id + "\n");
			disable();
			var sbcd = sidebar.contentDocument;	
			sbcd.getElementById('invmeter').setAttribute('value',0);
			//onSuccess: checkInventory, 
			pqdump("\tAjax call to: " + piratequesting.baseURL + "/index.php?on=inventory&action=equip&id=" + id + "\n");
			dR = top.debugResponse;
			ajax = AjaxRequest(piratequesting.baseURL + "/index.php?on=inventory&action=equip&id=" + id, { 
					onSuccess: enable, 
					onFailure: function() { enable(); dumpError('Failed to equip item.');}, 
					onError: function() { enable(); dumpError('Error occurred when equipping item.');}, 
					onStateChange: function(http) { var sbcd = sidebar.contentDocument;	sbcd.getElementById('eqmeter').setAttribute('value',http.readyState * 25); },
					proc: true
			});
		},

		abort : function() {
			if (ajax)
				ajax.abort();
			enable();
		},
		process : function () {
			try {
				inventory = piratequesting.InventoryManager.getInventory();
				update(true);
			} catch (error) { dumpError(error); }

		}
	}
}();

document.addEventListener("piratequesting:InventoryUpdated",function(event){ piratequesting.Equipment.process(); }, false);
