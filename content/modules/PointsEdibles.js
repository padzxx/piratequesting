var piratequesting = top.piratequesting;
var mainWindow = mainWindow
		|| window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
				.getInterface(Components.interfaces.nsIWebNavigation)
				.QueryInterface(Components.interfaces.nsIDocShellTreeItem).rootTreeItem
				.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
				.getInterface(Components.interfaces.nsIDOMWindow);
var sidebar = sidebar || mainWindow.document.getElementById("sidebar");

piratequesting.PointsEdibles = function() {
	var inventory;
	var pending_points = 0;
	var pending_edibles = 0;
	
	function updateEdiblesList(repeat) {
		
		var sbcd = sidebar.contentDocument;
		if (!sbcd || !sbcd.getElementById('edibleitems') || !sbcd.getElementById('edibleslist')) {			//if stuff isn't loaded yet, wait a second and try again
			//pqdump("\nSidebar content not yet loaded. Trying again in 2 seconds.\n");
			if (repeat)
				setTimeout(updateEdiblesList.bind(piratequesting.PointsEdibles,true),2000);
			return;
		}
		var createEdible = function(label, value) {
			var menuitem = sbcd.createElement('menuitem');
			menuitem.setAttribute('label', label);
			menuitem.setAttribute('value', value);
			return menuitem;
		};
		var edibleitems = sbcd.getElementById('edibleitems');
		var edibleslist = sbcd.getElementById('edibleslist');
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
		var edibles = inventory.evaluate("/inventory/category[@name='edibles']/item[@quantity>0]", inventory, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
		for (var i = 0, len=edibles.snapshotLength; i < len; ++i) {
			edible = edibles.snapshotItem(i);
			edibleitems.appendChild(createEdible(edible.getAttribute('name') + ' [x'
							+ edible.getAttribute('quantity') + ']', edible.getAttribute('action_id')));
			if (edible.getAttribute('action_id') == pickme)
				edibleslist.selectedIndex = i;
		}
	}
	
	function disablePoints() {
		var sbcd = sidebar.contentDocument;
			
		sbcd.getElementById('ptsgrp').style.opacity = 0.5;
	}
	
	function enablePoints() {
		var sbcd = sidebar.contentDocument;
			
		if (pending_points == 0)
			sbcd.getElementById('ptsgrp').style.opacity = 1.0;
	}
	
	function disableEdibles() {
		var sbcd = sidebar.contentDocument;
		sbcd.getElementById('edigrp').style.opacity = 0.5;
	}
	
	function enableEdibles() {
		var sbcd = sidebar.contentDocument;
			
		if (pending_edibles == 0)
			sbcd.getElementById('edigrp').style.opacity = 1.0;
	}
		
	return {
		
		usePoints: function() {
			pqdump("PQ: Using points\n", PQ_DEBUG_STATUS);
			var sbcd = sidebar.contentDocument;
			var ptslist = sbcd.getElementById('pointslist'); 
			if (ptslist.selectedIndex > -1) {
				disablePoints();
				++pending_points;
				ajax = AjaxRequest(piratequesting.baseURL + "/index.php?on=point_shop", {
						protocol: "post",
						onSuccess: function(http) { 
							--pending_points; 
							enablePoints();
							//AjaxRequest(piratequesting.baseURL+"/index.php?ajax=events_ajax&action=all_status_update");
							pqdump("\tlogging response to console.\n", PQ_DEBUG_STATUS);
							pqlog(http, PQ_DEBUG_STATUS);
						}, 
						onFailure: function(http) { --pending_points; enablePoints(); dumpError('Error returned by server.');}, 
						onError: function() { --pending_points; enablePoints(); dumpError('Error occurred when using Points.');}, 
						onStateChange: function(http) { var sbcd = sidebar.contentDocument;	sbcd.getElementById('ptsmeter').setAttribute('value',http.readyState * 25); },
						params: 'action=' + ptslist.selectedItem.value,
						proc:true
						
				});
			} else { alert("Select a point action first!"); }
		},

		
		useEdible: function(amount) {
			pqdump("PQ: Using edibles\n", PQ_DEBUG_STATUS);
			var sbcd = sidebar.contentDocument;
			var edilist = sbcd.getElementById('edibleslist'); 
			if (edilist.selectedIndex > -1) {
				disableEdibles();
				++pending_edibles;
				var id = edilist.selectedItem.value;
				ajax = AjaxRequest(piratequesting.baseURL + "/index.php?ajax=items&json", { 
						protocol: "post",
						onSuccess: function(http) { 
							--pending_edibles; 
							enableEdibles(); 
							//AjaxRequest(piratequesting.baseURL+"/index.php?ajax=events_ajax&action=all_status_update");
							pqdump("\tlogging response to console.\n", PQ_DEBUG_STATUS);
							pqlog(http, PQ_DEBUG_STATUS); 
						}, 
						onFailure: function() { --pending_edibles; enableEdibles(); dumpError('Error returned by server.');}, 
						onError: function() { --pending_edibles; enableEdibles(); dumpError('Error occurred when using Edibles.');}, 
						onStateChange: function(http) { var sbcd = sidebar.contentDocument;	sbcd.getElementById('edimeter').setAttribute('value',http.readyState * 25); },
						params: 'id=' + id + "&action=use&useamount=" + amount
						
				});
			} else { alert("Select an edible first!"); }

		},
		
		//TODO
		/*abort : function() {
			

		},*/
		processInventory : function (repeat) {
			//pqdump("Updating Edibles List");
			try {
			inventory = piratequesting.InventoryManager.getInventory();
			updateEdiblesList(repeat);
			} catch (e) { dumpError(e); }
		},
		
		processPoints : function() {
			if (piratequesting.Bank) {
				var points = piratequesting.Bank.getPoints(); 
				if (points_val = sidebar.contentDocument
						.getElementById('pointsvalue')) {
					points_val.value = points;
					points_val.setAttribute('value', points);
				}
			}
		}
	}
}();

document.addEventListener("piratequesting:BankUpdated", piratequesting.PointsEdibles.processPoints, false);
document.addEventListener("piratequesting:InventoryUpdated",function(event){ piratequesting.PointsEdibles.processInventory(event); }, false);
piratequesting.addLoadProcess(new RegExp("",""),piratequesting.PointsEdibles.processPoints,piratequesting.PointsEdibles);
