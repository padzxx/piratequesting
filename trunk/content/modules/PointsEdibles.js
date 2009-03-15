var piratequesting = top.piratequesting;

piratequesting.PointsEdibles = function() {
	var inventory;
	return {
		

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
		
		abort : function() {
			

		},
		process : function () {
			inventory = piratequesting.InventoryManager.getInventory();
		}

	}
}();

document.addEventListener("piratequesting:InventoryUpdated",function(event){ piratequesting.PointsEdibles.process(); }, false);