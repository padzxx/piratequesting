/*
 * for styling the elements in the selector. 
 * <span style="position: relative; display: inline-block;"><img height="100" border="0" width="100" src="images/items/130.gif" style="border: 5px dashed transparent; position: absolute; top: 0px; left: 0px;"/><span style="border: 5px dashed transparent; -moz-border-radius:5px; opacity: 0.4; position: absolute; background-color: gray; height: 100px; width: 100px; top: 0px; left: 0px; display: inline-block;"> </span><span style="position: absolute; top: 0px; left: 0px; height: 100px; width: 100px; display: inline-block; vertical-align: top;"><span style="position:relative; height:100px;width:100px;display:inline-block;"><span style="position:absolute; top:6px; color: black; display: inline-block; font-size: 2.0em; font-weight: bold;left:11px;">x50</span><span style="position:absolute; top:5px; color: white; display: inline-block; font-size: 2em; font-weight: bold;left:10px;letter-spacing:1.1">x50</span></span></span></span>
 * 
 */

/**
 * 
 * @class
 */
piratequesting.StatSimulator = function() {
	return /** @lends piratequesting.StatSimulator.prototype */ {
		// XXX Move the adjusted stuff out into a different module. Tools
		// section probably
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
		}
	}
}