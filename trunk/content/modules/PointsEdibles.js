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
	function updateEdiblesList() {
		var sbcd = sidebar.contentDocument;
			
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
		/*document.getElementById('ptsgrp').setAttribute("type","cover");
		document.getElementById('ptscb').setAttribute("type","cbox");
		document.getElementById('ptsmeter').setAttribute('value','0');
		document.getElementById('pointslist').setAttribute('disabled','true');
		document.getElementById('usepoints').setAttribute('disabled','true');*/
	}
	
	function enablePoints() {
		var sbcd = sidebar.contentDocument;
			
		if (pending_points == 0)
			sbcd.getElementById('ptsgrp').style.opacity = 1.0;
		/*document.getElementById('ptsgrp').setAttribute("type","");
		document.getElementById('ptscb').setAttribute("type","hide");
		document.getElementById('pointslist').removeAttribute('disabled');
		document.getElementById('usepoints').removeAttribute('disabled');*/
	}
	
	function disableEdibles() {
		var sbcd = sidebar.contentDocument;
			
		sbcd.getElementById('edigrp').style.opacity = 0.5;
		
		/*document.getElementById('edigrp').setAttribute("type","cover");
		document.getElementById('edicb').setAttribute("type","cbox");
		document.getElementById('edibleslist').setAttribute('disabled','true');
		document.getElementById('useedible1').setAttribute('disabled','true');
		document.getElementById('useedible5').setAttribute('disabled','true');
		document.getElementById('edimeter').setAttribute('value','0');*/
	}
	
	function enableEdibles() {
		var sbcd = sidebar.contentDocument;
			
		if (pending_edibles == 0)
			sbcd.getElementById('edigrp').style.opacity = 1.0;
		
		/*document.getElementById('edigrp').setAttribute("type","");
		document.getElementById('edicb').setAttribute("type","hide");
		document.getElementById('edibleslist').removeAttribute('disabled');
		document.getElementById('useedible1').removeAttribute('disabled');
		document.getElementById('useedible5').removeAttribute('disabled');*/
	}
	
		
	return {
		
		usePoints: function() {
			var sbcd = sidebar.contentDocument;
			var ptslist = sbcd.getElementById('pointslist'); 
			if (ptslist.selectedIndex > -1) {
				disablePoints();
				++pending_points;
				ajax = AjaxRequest(piratequesting.baseURL + "/index.php?on=point_shop", {
						protocol: "post",
						onSuccess: function() { --pending_points; enablePoints()}, 
						onFailure: function() { --pending_points; enablePoints(); alert('Error returned by server.');}, 
						onError: function() { --pending_points; enablePoints(); alert('Error occurred when using Points.');}, 
						onStateChange: function(http) { var sbcd = sidebar.contentDocument;	sbcd.getElementById('ptsmeter').setAttribute('value',http.readyState * 25); },
						params: 'action=' + ptslist.selectedItem.value
						
				});
			} else { alert("Select a point action first!"); }
		},

		
		useEdible: function(amount) {
			var sbcd = sidebar.contentDocument;
			var edilist = sbcd.getElementById('edibleslist'); 
			if (edilist.selectedIndex > -1) {
				disableEdibles();
				++pending_edibles;
				var id = edilist.selectedItem.value;
				ajax = AjaxRequest(piratequesting.baseURL + "/index.php?ajax=items", { 
						protocol: "post",
						onSuccess: function() { --pending_edibles; enableEdibles(); AjaxRequest(piratequesting.baseURL+"/index.php?on=inventory"); }, 
						onFailure: function() { --pending_edibles; enableEdibles(); alert('Error returned by server.');}, 
						onError: function() { --pending_edibles; enableEdibles(); alert('Error occurred when using Edibles.');}, 
						onStateChange: function(http) { var sbcd = sidebar.contentDocument;	sbcd.getElementById('edimeter').setAttribute('value',http.readyState * 25); },
						params: 'id=' + id + "&action=use&useamount=" + amount
						
				});
			} else { alert("Select an edible first!"); }

		},
		
		
		
		/*abort : function() {
			

		},*/
		process : function () {
			inventory = piratequesting.InventoryManager.getInventory();
			var sbcd = sidebar.contentDocument;
			if (!sbcd || !sbcd.getElementById('edibleitems') || !sbcd.getElementById('edibleslist')) return;
			updateEdiblesList();
		},
		
		processPoints : function(doc) {
			var coinsnpts = doc.getElementById('coinsnpts');
			// check to see if it exists
			if (coinsnpts) {
				// the first <a> should be the points, and since it has
				// no id, we just have to hope it stays that way
				points = coinsnpts.getElementsByTagName('a')[0].firstChild.nodeValue
						.toNumber();
				var points_val, coins_val, chest_val;
				if (piratequesting.sidebar) {
					if (points_val = sidebar.contentDocument
							.getElementById('pointsvalue')) {
						points_val.value = points;
						points_val.setAttribute('value', points);
					}
				}						
			}

		}

	}
}();

document.addEventListener("piratequesting:InventoryUpdated",function(event){ piratequesting.PointsEdibles.process(); }, false);
piratequesting.addLoadProcess(new RegExp("",""),piratequesting.PointsEdibles.processPoints);