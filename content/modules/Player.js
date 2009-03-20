var piratequesting = top.piratequesting;
var mainWindow = mainWindow || window
			.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIWebNavigation)
			.QueryInterface(Components.interfaces.nsIDocShellTreeItem).rootTreeItem
			.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIDOMWindow);

var sidebar = sidebar || mainWindow.document.getElementById("sidebar");

/**
 * @class
 * @param {Number} aValue
 */
function Attribute(aValue) {

	/**
	 * Attribute value
	 * 
	 * @type Number
	 * @default 0
	 * @private
	 */
	var value = aValue || 0;
	
		/**
		 * @param {Number}
		 *            aValue
		 * 
		 */
		this.setValue = function(aValue) {
			value = Number(String(aValue).toNumber()) || 0;
		}
		/**
		 * @returns {Number}
		 */
		this.getValue = function() {
			return value;
		},
		/**
		 * @returns {Number}
		 */
		this.getAdjusted = function(adjustment_modifier) {
			return (value * adjustment_modifier);
		}
		
		this.toString = function () {
			return String(value).addCommas();
		}

	
};

/**
 * @class 
 * @param {Number} currentValue
 * @param {Number} maxValue
 */
function Stat(currentValue, maxValue) {

	/**
	 * Current value of Stat
	 * @type Number
	 * @default 0
	 * @private
	 */
	var current = currentValue || 0;
	/**
	 * Maximum Value for the Stat
	 * @type Number
	 * @default 0
	 * @private
	 */
	var max = maxValue || currentValue || 0;	
		/**
		 * @param {Number}
		 *            aValue
		 * 
		 */
		this.setCurrent = function(aValue) {
			current = Number(String(aValue).toNumber()) || 0;
		}
		/**
		 * @param {Number}
		 *            aValue
		 * 
		 */
		this.setMax = function(aValue) {
			max = Number(String(aValue).toNumber()) || 0;
		}
		/**
		 * @returns {Number}
		 */
		this.getCurrent = function() {
			return current;
		}
		/**
		 * @returns {Number}
		 */
		this.getMax = function() {
			return max;
		}
		
		this.toString = function () {
			return String(current).addCommas() + "/" + String(max).addCommas();
		}
};

/**
 * 
 * @namespace
 */
piratequesting.Player = function() {

	var name = "";
	var level = 0;
	var progress = 0;

	var attributes = {
		strength: new Attribute(0),
		defense: new Attribute(0),
		speed: new Attribute(0),
		charisma: new Attribute(0),
		total: function() {
			return {
				getValue: function () {
					//Charisma removed as it isn't included in the PQ totals
					//+ attributes.charisma.getValue()
					return Math.round((attributes.strength.getValue() + attributes.defense.getValue() + attributes.speed.getValue())*10)/10;
				},
				setValue: function () {
					//dummy
				}
			}
		}()
	};
	
	var stats = {
		hp: new Stat(0,0),
		awake: new Stat(0,0),
		energy: new Stat(0,0),
		nerve: new Stat(0,0)
	};
	/**
	 * @private
	 */
	var publish = function () {
		try {
		var sbcd = sidebar.contentDocument; 		
	
		if (piratequesting.sidebar) {
			if (sbcd.getElementById('Player_tabpanel') && sbcd.getElementById('curhpval') && sbcd.getElementById('totalval')) {
				sbcd.getElementById('curhpval').value = String(stats.hp.getCurrent()).addCommas();
				sbcd.getElementById('maxhpval').value = String(stats.hp.getMax()).addCommas();
				sbcd.getElementById('curawakeval').value = String(stats.awake.getCurrent()).addCommas();
				sbcd.getElementById('maxawakeval').value = String(stats.awake.getMax()).addCommas();
				sbcd.getElementById('curenergyval').value = String(stats.energy.getCurrent()).addCommas();
				sbcd.getElementById('maxenergyval').value = String(stats.energy.getMax()).addCommas();
				sbcd.getElementById('curnerveval').value = String(stats.nerve.getCurrent()).addCommas();
				sbcd.getElementById('maxnerveval').value = String(stats.nerve.getMax()).addCommas();
				
				sbcd.getElementById('strval').value = String(attributes.strength.getValue()).addCommas();
				sbcd.getElementById('defval').value = String(attributes.defense.getValue()).addCommas();
				sbcd.getElementById('speval').value = String(attributes.speed.getValue()).addCommas();
				sbcd.getElementById('totalval').value = String(attributes.total.getValue()).addCommas();
				
				sbcd.getElementById('nameval').value = name;
				sbcd.getElementById('levelval').value = level + " [" + progress+"%]";
			}
		}
		} catch (e) {
				alert(getErrorString(e));
			}
	};
	
	return {
		/**
		 * @param {Document} doc
		 */
		process : function(doc) {
			try {
				//exit if the section doesn't exist
				if (!doc.getElementById("TabbedPanels2")) return;
				var char_group = doc.getElementById("TabbedPanels2").getElementsByTagName('div'); //Why is this called TabPanels2? Surely theycould have come up with a better id
				//char_group 0 = stats, 1 = attributes, 2 = treasure, 3 = abilities
				var stat_group = char_group[1];
				var attr_group = char_group[2];
				
				//inside each group is a ul with li inside
				var t = stat_group.getElementsByTagName('li');
				var sname, value;
				for (var i = 0, v = t[i]; i < t.length; i++, v = t[i]) {
					sname = /(\S*?):/.exec(v.firstChild.firstChild.nodeValue)[1].toLowerCase();
					value = /([\d.,]+?)\/([\d.,]+)/.exec(v.childNodes[1].nodeValue);
					stats[sname].setCurrent(value[1]);
					stats[sname].setMax(value[2]);
				}
				var t = attr_group.getElementsByTagName('li');
				for (var i = 0, v = t[i]; i < t.length; i++, v = t[i]) {
					sname = /(\S*?):/.exec(v.firstChild.firstChild.nodeValue)[1].toLowerCase();
					value = /([\d.,]+)/.exec(v.childNodes[1].nodeValue);
					attributes[sname].setValue(value[1]);
				}
				//alert(getChildrenByClassName(doc.getElementById("profile_info"),"user_role").length);
				
				
				name = doc.evaluate('string(id("profile_info")//div[@class="user_role"][1]//a[last()])',doc,null,XPathResult.STRING_TYPE,null).stringValue;
				//alert(getChildrenByClassName(doc.getElementById("profile_info"),"user_role")[0].firstChild.nodeValue);
				var lp = /lvl:\D+(\d+)\D+(\d+)/.exec(doc.evaluate('string(id("profile_info")//div[@class="user_role"][last()])',doc,null,XPathResult.STRING_TYPE,null).stringValue.stripCommas());
				level = lp[1];
				progress = lp[2];
				//*/
				publish();
			} catch (e) {
				alert(getErrorString(e));
			}
			
			
		},
		getLevel : function () {
			return level;
		},
		
		getStat : function(statName) {
			return stats[statName]; 
		},
		getAttribute : function (attrName) {
			return attributes[statName]; 
		}
		
	}
}();

piratequesting.addLoadProcess("", piratequesting.Player.process);
