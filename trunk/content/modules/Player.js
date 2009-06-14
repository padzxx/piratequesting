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

	dump("\ncreating new attribute");
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

	dump("\ncreating new stat");
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
				if (piratequesting.baseTheme == "classic") {
					//exit if the section doesn't exist
					if (!doc.getElementById("TabbedPanels2")) 
						return;
					var char_group = doc.evaluate("id('TabbedPanels2')//ul[not(@class)]", doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
					//var char_group = doc.getElementById("").getElementsByTagName('div'); //Why is this called TabPanels2? Surely theycould have come up with a better id
					//char_group 0 = stats, 1 = attributes, 2 = treasure, 3 = abilities
					var stat_group = char_group.snapshotItem(0);
					var attr_group = char_group.snapshotItem(1);
					//inside each group is a ul with li inside
					var t = doc.evaluate(".//li//strong", stat_group, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
					var sname, value;
					
					for (var i = 0, v = t.snapshotItem(i); i < t.snapshotLength; i++, v = t.snapshotItem(i)) {
						sname = /(\S*?):/.exec(v.firstChild.nodeValue)[1].toLowerCase();
						value = /([\d.,]+?)\/([\d.,]+)/.exec(v.parentNode.lastChild.nodeValue);
						stats[sname].setCurrent(value[1]);
						stats[sname].setMax(value[2]);
					}
					var t = doc.evaluate(".//li//strong", attr_group, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
					for (var i = 0, v = t.snapshotItem(i); i < t.snapshotLength; i++, v = t.snapshotItem(i)) {
						sname = /(\S*?):/.exec(v.firstChild.nodeValue)[1].toLowerCase();
						value = /([\d.,]+)/.exec(v.parentNode.lastChild.nodeValue);
						attributes[sname].setValue(value[1]);
					}
					
					name = doc.evaluate('string(id("profile_info")//div[@class="user_role"][1]//a[last()])', doc, null, XPathResult.STRING_TYPE, null).stringValue;
					var lp = /lvl:\D+(\d+)\D+(\d+)/.exec(doc.evaluate('string(id("profile_info")//div[@class="user_role"][last()])', doc, null, XPathResult.STRING_TYPE, null).stringValue.stripCommas());
					level = lp[1];
					progress = lp[2];
					publish();
				} else if(piratequesting.baseTheme == "default") {
					//attributes are not available in the default theme, so they are omitted here.
					var hpdata = doc.getElementById('prog-bar-hp').getAttribute('title').split(" / ");
					var nervedata = doc.getElementById('prog-bar-nerve').getAttribute('title').split(" / ");
					var awakedata = doc.getElementById('prog-bar-awake').getAttribute('title').split(" / ");
					var energydata = doc.getElementById('prog-bar-energy').getAttribute('title').split(" / ");
					stats.hp.setCurrent(hpdata[0]);
					stats.hp.setMax(hpdata[1]);
					stats.nerve.setCurrent(nervedata[0]);
					stats.nerve.setMax(nervedata[1]);
					stats.awake.setCurrent(awakedata[0]);
					stats.awake.setMax(awakedata[1]);
					stats.energy.setCurrent(energydata[0]);
					stats.energy.setMax(energydata[1]);
					name = doc.evaluate('string(id("profilebox")//div[@class="user_role"][1]//a[last()])', doc, null, XPathResult.STRING_TYPE, null).stringValue;
					level = doc.evaluate('substring-after(string(id("header_user_level")),"Level ")', doc, null, XPathResult.STRING_TYPE, null).stringValue.stripCommas();
					progress = Math.round(eval(doc.evaluate('string(id("header_user_level_container")/@title)', doc, null, XPathResult.STRING_TYPE, null).stringValue) * 1000) / 10; 
					publish();
				}
				
			} catch (e) {
				dumpError(getErrorString(e));
			}
			
			
		},
		processTrainPage: function (doc) {
			if (piratequesting.baseTheme == "default") {
				var str = doc.evaluate('string(id("str_stat"))', doc, null, XPathResult.STRING_TYPE, null).stringValue.stripCommas();
				var def = doc.evaluate('string(id("def_stat"))', doc, null, XPathResult.STRING_TYPE, null).stringValue.stripCommas();
				var spe = doc.evaluate('string(id("spd_stat"))', doc, null, XPathResult.STRING_TYPE, null).stringValue.stripCommas();
				
				if (str && def && spe) { /* if all are non-zero/non-null */
					attributes.strength.setValue(str);
					attributes.defense.setValue(def);
					attributes.speed.setValue(spe);
					publish();
				}
				
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
		},
		processRawStatus : function (text) {
			try{
				//expect xml doc here 
					var parser=new DOMParser();
  					var doc=parser.parseFromString(text,"text/xml");
					//messages = doc.evaluate("//user_messages", doc, null, XPathResult.STRING_TYPE, null).stringValue.toNumber();
					//events = doc.evaluate("//user_events", doc, null, XPathResult.STRING_TYPE, null).stringValue.toNumber();
					//dump("\nEvents: " + events + "\t\tMessages: "+ messages);
					level = doc.evaluate("//user_level", doc, null, XPathResult.STRING_TYPE, null).stringValue.toNumber();
					progress = doc.evaluate("//xp", doc, null, XPathResult.STRING_TYPE, null).stringValue.toNumber();
					
					
				publish();
			} catch (error) {
				dumpError(error);
			}
		},
		processRawTrain : function (text,url,data) {
			/*try{
				//expect xml doc here 
				dump("\nProcessing Events and Messages");
					var parser=new DOMParser();
  					var doc=parser.parseFromString(text,"text/xml");
					messages = doc.evaluate("//user_messages", doc, null, XPathResult.STRING_TYPE, null).stringValue.toNumber();
					events = doc.evaluate("//user_events", doc, null, XPathResult.STRING_TYPE, null).stringValue.toNumber();
					dump("\nEvents: " + events + "\t\tMessages: "+ messages);
				publish();
			} catch (error) {
				dumpError(error);
			}*/
		}
	}
}();

piratequesting.addLoadProcess("", piratequesting.Player.process, piratequesting.Player);
piratequesting.addLoadProcess(/index.php\?on=train/, piratequesting.Player.processTrainPage, piratequesting.Player);
piratequesting.addRawProcessor(/index.php\?ajax=events_ajax&action=all_status_update/,piratequesting.Player.processRawStatus,piratequesting.Player);
piratequesting.addRawProcessor(/index.php\?ajax=train/,piratequesting.Player.processRawTrain,piratequesting.Player);
