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
		if (!cat) return;	//The category doesn't exist. bail!
		var menu_id = cat.getAttribute("name") + "_menu";
		dump("\n"+menu_id+"\n");
		var wm = sbcd.getElementById(menu_id);
		while (wm.hasChildNodes())
			wm.removeChild(wm.childNodes[0]);
		
		if (eqi = inventory.evaluate(".//item[@equipped='1']", cat, null, XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue) {
			// if (category.HasItems())
			// wm.appendChild(document.createElement("menuseparator"));
			mi = sbcd.createElement("menuitem");
			mi.setAttribute("label", "Unequip " + eqi.getAttribute("name"));
			mi.setAttribute("value", eqi.getAttribute("action_id"));
			mi.setAttribute("oncommand", "piratequesting.Equipment.unequip(this.value)");
			wm.appendChild(mi);
			
			sbcd.getElementById(cat.getAttribute("name") + "_image").setAttribute("src", piratequesting.baseURL + eqi.getAttribute('image'));
			sbcd.getElementById(cat.getAttribute("name") + "_label").setAttribute("value", eqi.getAttribute('name'));
		} else {
		// add the unequipped items to the menu, create the associated
		// labels, values and oncommand action
			items = inventory.evaluate(".//item[@equipped='0' and @quantity>0]", cat, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
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
					
				}
				sbcd.getElementById(cat.getAttribute("name") + "_label").setAttribute("value", "Nothing!");
			}
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
		dump("\nChecking inventory.\n")
		var sbcd = sidebar.contentDocument;	
		sbcd.getElementById('eqmeter').setAttribute('value',0);
		ajax = AjaxRequest(piratequesting.baseURL + "/index.php?on=inventory&m=1", { 
				onSuccess: function() { try { enable(); dump("\nInventory check succeeded.\n") } catch (error) {dump("\n" + getErrorString(error) + "\n");} }, 
				onFailure: function() { enable(); alert('Failed to update Inventory.');}, 
				onError: function() { enable(); alert('Error occurred when updating Inventory.');}, 
				onStateChange: function(http) { var sbcd = sidebar.contentDocument;	sbcd.getElementById('eqmeter').setAttribute('value',http.readyState * 25); }
		});
	}
	
	return {


		
		unequip : function(id) {
			dump("\nunequipping " + id +"\n");
			disable();
			var sbcd = sidebar.contentDocument;	
			sbcd.getElementById('invmeter').setAttribute('value',0);
			//onSuccess: checkInventory, 
					
			ajax = AjaxRequest(piratequesting.baseURL + "/index.php?on=inventory&action=unequip&id=" + id, {
					onSuccess: enable, 
					onFailure: function() { enable(); alert('Failed to unequip item.');}, 
					onError: function() { enable(); alert('Error occurred when unequipping item.');}, 
					onStateChange: function(http) { var sbcd = sidebar.contentDocument;	sbcd.getElementById('eqmeter').setAttribute('value',http.readyState * 25); }
			});
		},

		equip : function(id) {
			dump("\nequipping " + id +"\n");
			disable();
			var sbcd = sidebar.contentDocument;	
			sbcd.getElementById('invmeter').setAttribute('value',0);
			//onSuccess: checkInventory, 
					
			ajax = AjaxRequest(piratequesting.baseURL + "/index.php?on=inventory&action=equip&id=" + id, { 
					onSuccess: enable, 
					onFailure: function() { enable(); alert('Failed to equip item.');}, 
					onError: function() { enable(); alert('Error occurred when equipping item.');}, 
					onStateChange: function(http) { var sbcd = sidebar.contentDocument;	sbcd.getElementById('eqmeter').setAttribute('value',http.readyState * 25); }
			});
		},

		abort : function() {
			if (ajax)
				ajax.abort();
			enable();
		},
		process : function () {
			try {
			var sbcd = sidebar.contentDocument;
			if (!sbcd) return;
			
			
			inventory = piratequesting.InventoryManager.getInventory();
			if ( !sbcd.getElementById("weapons_menu") ||  !sbcd.getElementById("head_menu") || !sbcd.getElementById("armour_menu") || !sbcd.getElementById("offhand_menu")) {
				//if stuff isn't loaded yet, wait a second and try again
				dump("\nSidebar content not yet loaded. Trying again in 2 seconds.\n");
				setTimeout(piratequesting.Equipment.process,2000);
				return;
			}
			
				var equipped_items = inventory.evaluate("descendant::item[@equipped=1]", inventory, null, XPathResult.ANY_TYPE,null);
				while (item = equipped_items.iterateNext()) {
					dump("\n"+item.parentNode.getAttribute("name")+ ": " + item.getAttribute("name")+"\n");
				}

				//re-get the item guide info if any of the items are missing a description
			if (inventory.evaluate("boolean(//item[not(@cost)])", inventory, null, XPathResult.BOOLEAN_TYPE,null).booleanValue) {
				var cur_time = (new Date()).getTime();  
				if (cur_time - last_check > 5000) {
					last_check = cur_time;
					piratequesting.InventoryManager.checkItemGuide();
				} else {
					alert("Error Processing Item Guide Data");
				}
				return; // item description not found. bail.
			} else {
				
			updateMenu("weapons");
			updateMenu("head");
			updateMenu("armour");
			updateMenu("offhand");
			}
			} catch (error) { alert(getErrorString(error)); }

		}
	}
}();

document.addEventListener("piratequesting:InventoryUpdated",function(event){ piratequesting.Equipment.process(); }, false);