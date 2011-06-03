try {
	var piratequesting = top.piratequesting;
	var mainWindow = mainWindow ||
	window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIWebNavigation).QueryInterface(Components.interfaces.nsIDocShellTreeItem).rootTreeItem.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindow);
	
	var sidebar = sidebar || mainWindow.document.getElementById("sidebar");
	
	/**
	 * @class
	 * @param {Number} aValue
	 */
	function Attribute(aValue){
	
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
		this.setValue = function(aValue){
			value = Number(String(aValue).toNumber()) || 0;
		}
		/**
		 * @returns {Number}
		 */
		this.getValue = function(){
			return value;
		},  /**
		 * @returns {Number}
		 */
		this.getAdjusted = function(adjustment_modifier){
			return (value * adjustment_modifier);
		}
		
		this.toString = function(){
			return String(value).addCommas();
		}
		
		
	};
	
	/**
	 * @class
	 * @param {Number} currentValue
	 * @param {Number} maxValue
	 */
	function Stat(currentValue, maxValue){
	
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
		this.setCurrent = function(aValue){
			current = Number(String(aValue).toNumber()) || 0;
		}
		/**
		 * @param {Number}
		 *            aValue
		 *
		 */
		this.setMax = function(aValue){
			max = Number(String(aValue).toNumber()) || 0;
		}
		/**
		 * @returns {Number}
		 */
		this.getCurrent = function(){
			return current;
		}
		
		this.setPc = function(pcValue){
			var pc = pcValue / 100;
			//was Math.round but there were some cases where it would be 1 off... I can only assume they are doing ceil as well
			current = Math.ceil(pc * max);
		}
		/**
		 * @returns {Number}
		 */
		this.getMax = function(){
			return max;
		}
		
		this.toString = function(){
			return String(current).addCommas() + "/" + String(max).addCommas();
		}
	};
	
	/**
	 *
	 * @namespace
	 */
	piratequesting.Player = function (){
		var name = "";
		var level = 0;
		var progress = 0;
		
		var attributes = {
			strength: new Attribute(0),
			defense: new Attribute(0),
			speed: new Attribute(0),
			charisma: new Attribute(0),
			total: function(){
				return {
					getValue: function(){
						//Charisma removed as it isn't included in the PQ totals
						//+ attributes.charisma.getValue()
						return Math.round((attributes.strength.getValue() + attributes.defense.getValue() + attributes.speed.getValue()) * 10) / 10;
					},
					setValue: function(){
						//dummy
					}
				}
			}()
		};
		
		var stats = {
			hp: new Stat(0, 0),
			awake: new Stat(0, 0),
			energy: new Stat(0, 0),
			nerve: new Stat(0, 0)
		};
		/**
		 * @private
		 */
		var publish = function(){
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
						sbcd.getElementById('levelval').value = level + " [" + progress + "%]";
					}
				}
			} 
			catch (e) {
				dumpError(e);
			}
		};
		
		function setAttrPc(val, stat){
			if (val !== null) {
				val = val.toNumber();
				stat.setPc(val);
			}
		}
		
		return {
			/**
			 * @param {Document} doc
			 */
			process: function(doc){
				try {
					if (piratequesting.baseTheme == piratequesting.CLASSIC_THEME) {
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
						document.fire('piratequesting:StatusUpdated');
					}
					else 
						if (piratequesting.baseTheme == piratequesting.DEFAULT_THEME) {
							if (!doc.getElementById('prog-bar-hp')) { return; } // bail iff hp isn't present. assume the page is in a weird state.
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
							
							var sname, value;
							var attr_group = doc.getElementById('attributes');
							var t = doc.evaluate(".//tr", attr_group, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
							pqdump("\n\nPQ: Setting Player attributes\n",PQ_DEBUG_STATUS);
							for (var i = 0, v = t.snapshotItem(i); i < t.snapshotLength; i++, v = t.snapshotItem(i)) {
								sname = doc.evaluate("./th/text()",v,null,XPathResult.STRING_TYPE,null).stringValue.toLowerCase();
								value = doc.evaluate("./td/text()",v,null,XPathResult.STRING_TYPE,null).stringValue.toNumber();
								pqdump("\tAttempting to set attributes[\""+sname+"\"] = " + value + "\n",PQ_DEBUG_STATUS);
								attributes[sname].setValue(value);
							}
							
							name = doc.evaluate('string(id("profilebox")//div[@class="user_role"][1]//a[last()])', doc, null, XPathResult.STRING_TYPE, null).stringValue;
							level = doc.evaluate('substring-after(string(id("header_user_level")),"Level ")', doc, null, XPathResult.STRING_TYPE, null).stringValue.stripCommas();
							progress = Math.round(eval(doc.evaluate('string(id("header_user_level_container")/@title)', doc, null, XPathResult.STRING_TYPE, null).stringValue) * 100);
							publish();
							document.fire('piratequesting:StatusUpdated');
						}
					
				} 
				catch (e) {
					dumpError(e);
				}
				
				
			},
			processTrainPage: function(doc){
				pqdump("PQ: Processing Training Page (Player.js)\n");
				try {
					if (piratequesting.baseTheme == piratequesting.DEFAULT_THEME) {
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
				} catch(e) {
					dumpError(e);
				}
			},
			getLevel: function(){
				return level;
			},
			
			getStat: function(statName){
				return stats[statName];
			},
			getAttribute: function(attrName){
				return attributes[statName];
			},
			processRawStatus: function(text){
				try {
					if (text) {
						//used to be XML, now in JSON
						
						var response_object = JSON.parse(text);
						
						
						/**
						 *
						 * @param {String} complicated_string
						 */
						function getCurVal(complicated_string) {
							var ret_str;
							ret_str = complicated_string.replace(/([\s\S]+?)(\d+)\/[\s\S]*/, "$2");
							return ret_str;
						}
						
						//first grab the energy and awake as they have precise values
						var et = getCurVal(response_object.EnergySide);
						//dump ("energy set to: " + et + "\n");
						stats.energy.setCurrent(et);
						
						var at = getCurVal(response_object.AwakeSide);
						//dump ("awake set to: " + at + "\n");
						stats.awake.setCurrent(at);
						
						
						response_object = toNumberSet(response_object);
						
						level = response_object.user_level;
						progress = response_object.xp;
						
						var hp = response_object.hp;
						setAttrPc(hp, stats.hp);
						
						
						var nerve = response_object.nerve;
						setAttrPc(nerve, stats.nerve);
						document.fire('piratequesting:StatusUpdated');
						publish();
					}
				} 
				catch (error) {
					dumpError(error);
				}
			},
			processRawTrain: function(text, url, data){
				pqdump("PQ: Processing Training AJAX (Player.js)\n");
				try {
					
					var response_object = JSON.parse(text);
						
					var str = response_object.str;
					var def = response_object.def;
					var spe = response_object.spd; //note the property name changed. piratequesting code changes kept to a minimum
					
					if (str && def && spe) { /* if all are non-zero/non-null */
						attributes.strength.setValue(str.stripCommas());
						attributes.defense.setValue(def.stripCommas());
						attributes.speed.setValue(spe.stripCommas());
					}
					document.fire('piratequesting:AttributesUpdated');
					publish();
				} 
				catch (error) {
					dumpError(error);
				}
			},
			
			update:function(options) {
				var options = options || {};
				var url = piratequesting.baseURL + "/index.php?ajax=events_ajax&action=all_status_update";
				var ajax = AjaxRequest(url, {
					protocol: "get",
					onSuccess: options.onSuccess,
					onFailure: options.onFailure,
					onError: options.onError || function(){
						dumpError('Error occurred when updating player information.');
					},
					onStateChange: options.onStateChange,
					proc: false
			});
			}
		}
	}();
	
	piratequesting.addLoadProcess("", piratequesting.Player.process, piratequesting.Player);
	piratequesting.addLoadProcess(/index.php\?on=train/, piratequesting.Player.processTrainPage, piratequesting.Player);
	piratequesting.addRawProcessor(/index.php\?ajax=(events_ajax&action=all_status_update|train|items&json)/, piratequesting.Player.processRawStatus, piratequesting.Player);
	piratequesting.addRawProcessor(/index.php\?ajax=train/, piratequesting.Player.processRawTrain, piratequesting.Player);
	
} 
catch (e) {
	dumpError(e);
}

