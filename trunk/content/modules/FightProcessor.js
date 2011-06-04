var piratequesting = top.piratequesting;

/**
 * @inner
 * @class
 * @property {String} name
 * @property {Integer} hp
 * @property {Integer} strength
 * @property {Integer} defense
 * @property {Integer} speed
 * @property {String} using String representing what weapon and ofhand the
 *           fighter is using
 * @property {Array} adjustments Array of Strings for the additional adjustments
 * @property {Integer} id The user id of the fighter
 * @property {Boolean} banned True if the fighter is banned
 * @property {Boolean} frozen True if the fighter is frozen
 * @param {Number}
 *            id
 * @param {String}
 *            name
 * @param {Number}
 *            hp
 * @param {Number}
 *            strength
 * @param {Number}
 *            defense
 * @param {Number}
 *            speed
 * @param {String}
 *            using
 */
function Fighter(id, name, hp, strength, defense, speed, using) {
	this.type = "Fighter";
	this.name = name;
	this.hp = hp;
	this.strength = strength;
	this.defense = defense;
	this.speed = speed;
	this.using = using;
	this.adjustments = new Array();
	this.id = id;
	this.banned = false;
	this.frozen = false;
	this.level = 0;
}

/**
 * Imports from generic object
 * @param {Object} obj
 */
Fighter.prototype._import = function(obj) {
	if (obj.type == "Fighter") {
		for (prop in obj) {
			this[prop] = obj[prop];
		}
	}
}

Fighter.prototype.print = function(doc, container, winner, disguise) {
	container.setAttribute("valign", "top");
	var namespan;
	if (this.id != null) {
		namespan = doc.createElement("a");
		namespan.setAttribute("href", "/index.php?on=profile&user="
						+ this.id);
	} else {
		namespan = doc.createElement("span");
	}
	if (this.banned || this.frozen) {
		namespan
				.setAttribute("style",
						"font-size:large;font-weight:bold;text-decoration:line-through;");
	} else {
		namespan.setAttribute("style",
				"font-size:large;font-weight:bold;text-decoration:none;");
	}
	namespan.appendChild(doc.createTextNode(this.name));
	container.appendChild(namespan);
	container.appendChild(doc.createElement("br"));

	var status = doc.createElement("span");
	if (winner == this) {
		status.appendChild(doc.createTextNode("Winner"));
	} else {
		status.appendChild(doc.createTextNode("Loser"));
	}
	status.setAttribute("style",
			"font-size:small;font-weight:bold;text-decoration:none;");
	container.appendChild(status);
	container.appendChild(doc.createElement("br"));
	container.appendChild(doc.createElement("br"));
	if (disguise != null) {
		container.appendChild(doc.createTextNode(disguise));
		container.appendChild(doc.createElement("br"));
		container.appendChild(doc.createElement("br"));
	}
	if (this.hp) {
		container.appendChild(doc.createTextNode("HP: " + this.hp));
	}
	container.appendChild(doc.createElement("br"));
	container.appendChild(doc.createTextNode("Adjusted Strength: "
			+ this.strength));
	container.appendChild(doc.createElement("br"));
	container.appendChild(doc.createTextNode("Adjusted Defense: "
			+ this.defense));
	container.appendChild(doc.createElement("br"));
	container.appendChild(doc.createTextNode("Adjusted Speed: "
			+ this.speed));
	container.appendChild(doc.createElement("br"));
	container.appendChild(doc.createElement("br"));
	container.appendChild(doc.createTextNode("Additional Adjustments:"));
	var adjustment;
	for (var i = 0; i < this.adjustments.length; i++) {
		adjustment = this.adjustments[i];
		container.appendChild(doc.createElement("br"));
		container.appendChild(doc.createTextNode(adjustment));
	}
	container.appendChild(doc.createElement("br"));
	container.appendChild(doc.createElement("br"));
	container.appendChild(doc.createTextNode("Using:"));
	container.appendChild(doc.createElement("br"));
	container.appendChild(doc.createTextNode(this.using ? this.using : "Unknown"));
	container.appendChild(doc.createElement("br"));
	container.appendChild(doc.createElement("br"));
}


function Attack(a_attacker, a_damage) {
	this.type = "Attack";
	this.attacker = a_attacker;
	this.damage = a_damage;
}

function Misfire() {
	this.type = "Misfire";
	this.misfire = true;
}

/**
 * Fight object. all properties public.
 */
function Fight() {
	this.type = "Fight";
	this.attacks = [];
	this.me = new Fighter();
	this.opponent = new Fighter();
	this.winner = null;
	this.prizemoney = null;
	this.prizeexp = null;
	this.fleetmoney = null;
	this.back = null;
	this.adjustment = null;
	this.ambush = [];
	this.disguise = null;
	this.original = null;
	this.errors = [];
}

/**
 * Imports and "casts" data from generic objects
 * @param {Object} obj
 */
Fight.prototype._import = function(obj) {
	if(obj.type == "Fight") {
		this.me._import(obj.me);
		this.opponent._import(obj.opponent);
		if (obj.winner.name === obj.me.name) {
			this.winner = this.me;
		} else if(obj.winner.name == obj.opponent.name) {
			this.winner=this.opponent;
		}
		this.prizemoney = obj.prizemoney;
		this.prizeexp = obj.prizeexp;
		this.fleetmoney = obj.fleetmoney;
		this.adjustment = obj.adjustment;
		this.ambush = obj.ambush;
		this.disguise = obj.disguise;
		this.errors = obj.errors;
		var self = this;
		obj.attacks.forEach(function(attack) {
			if (attack.type == "Misfire") {
				self.attacks.push(new Misfire());
			} else if(attack.type == "Attack") {
				var attacker = (attack.attacker.name == self.me.name) ? self.me : self.opponent;
				self.attacks.push(new Attack(attacker, attack.damage));
			}
		});
	}
}

Fight.prototype.parse = function(doc) {
	var self = this;
	
	function addAttack(attacker, damage) {
		self.attacks.push(new Attack(attacker, damage));
	}
	
	function addMisfire() {
		self.attacks.push(new Misfire());
	}

	if (piratequesting.baseTheme == piratequesting.CLASSIC_THEME) {
		// first make sure we're actually fighting someone
		if (/You are in a fight with /.test(doc.body.innerHTML)) {
			this.opponent.banned = /You are in a fight with B:/.test(doc.body.innerHTML);
			this.opponent.frozen = /You are in a fight with F:/.test(doc.body.innerHTML);
			this.original = doc.getElementById("insidecontent").getElementsByTagName("td")[0];
			
			//duplicate for the purposes of processing
			battle = original.cloneNode(true);
			var links = battle.getElementsByTagName("a");
			this.back = links[links.length - 1];
			var battletext = battle.innerHTML;
			// remove the line breaks
			try {
				while (battle.firstChild.nodeName.toLowerCase() != "i") {
					battle.removeChild(battle.firstChild);
				}

				// now get the adjustment text and remove it.
				this.adjustment = battle.firstChild.firstChild.nodeValue;
				battle.removeChild(battle.firstChild);
				// remove the line breaks
				while (battle.firstChild.nodeName.toLowerCase() == "br") {
					battle.removeChild(battle.firstChild);
				}
				try {
					// check for disguise
					if (/Your disguise/.test(battle.firstChild.nodeValue)) {
						this.disguise = battle.firstChild.nodeValue;
						battle.removeChild(battle.firstChild);
					}
				} catch (error) {
					this.errors.push(getErrorString(error));
				}
				while (battle.firstChild.nodeName.toLowerCase() == "br") {
					battle.removeChild(battle.firstChild);
				}

				// next, if the person is banned or frozen, get rid of
				// the little B or F
				if (this.opponent.banned || this.opponent.frozen)
					battle.removeChild(battle.firstChild);

				try {
					// Next, get the opponent's name and HP
					this.opponent.name = battle.firstChild.innerHTML;
					battle.removeChild(battle.firstChild);
					this.opponent.hp = /([\-,0-9]+)/.exec(battle.firstChild.nodeValue)[1];
					battle.removeChild(battle.firstChild);
				} catch (error) {
					this.errors.push(getErrorString(error));
				}
				// remove the next line break
				battle.removeChild(battle.firstChild);
				try {
					// get my name and hp
					this.me.name = battle.firstChild.innerHTML;
					battle.removeChild(battle.firstChild);
					this.me.hp = /([\-,0-9]+)/.exec(battle.firstChild.nodeValue)[1];
					battle.removeChild(battle.firstChild);
				} catch (error) {
					this.errors.push(getErrorString(error));
				}
				// the next bits are useless so we remove them
				battle.removeChild(battle.firstChild); // <br />
				battle.removeChild(battle.firstChild); // text
				// Misfire...
				battle.removeChild(battle.firstChild);// <br />
				battle.removeChild(battle.firstChild); // You are in a
				// fight with...
				battle.removeChild(battle.firstChild); // anchor + name
				battle.removeChild(battle.firstChild); // period
				battle.removeChild(battle.firstChild);// <br />
				battle.removeChild(battle.firstChild);// <br />
				// battle.removeChild(battle.firstChild);//<br />
				try {
					// get the natural speeds.
					battle.removeChild(battle.firstChild); // Your natural speeds are:
					battle.removeChild(battle.firstChild); // <br />
					if (this.opponent.banned ||this. opponent.frozen)
						battle.removeChild(battle.firstChild);
					battle.removeChild(battle.firstChild); // anchor + name
					this.opponent.speed = /([\-.0-9]+)/.exec(battle.firstChild.nodeValue)[1];
					battle.removeChild(battle.firstChild);
					battle.removeChild(battle.firstChild); // <br />
					battle.removeChild(battle.firstChild); // anchor + name
					this.me.speed = /([\-.0-9]+)/.exec(battle.firstChild.nodeValue)[1];
					battle.removeChild(battle.firstChild);
				} catch (error) {
					this.errors.push(getErrorString(error));
				}
				// remove all of the br tags following
				while (battle.firstChild.nodeName.toLowerCase() == "br") {
					battle.removeChild(battle.firstChild);
				}

				try {
					// next up, weapon altered... not sure yet if these
					// are
					// ever omitted.
					battle.removeChild(battle.firstChild);
					battle.removeChild(battle.firstChild);
					if (opponent.banned || opponent.frozen)
						battle.removeChild(battle.firstChild);
					battle.removeChild(battle.firstChild);
					this.opponent.speed = /:[\s]+([\-.0-9]+)/.exec(battle.firstChild.nodeValue)[1];
					battle.removeChild(battle.firstChild);
					battle.removeChild(battle.firstChild);
					battle.removeChild(battle.firstChild);
					this.me.speed = /:[\s]+([\-.0-9]+)/
							.exec(battle.firstChild.nodeValue)[1];
					battle.removeChild(battle.firstChild);
				} catch (error) {
					errors.push(getErrorString(error));
				}
				while (battle.firstChild.nodeName.toLowerCase() == "br") {
					battle.removeChild(battle.firstChild);
				}
				try {
					// then armor altered speeds.
					battle.removeChild(battle.firstChild);
					battle.removeChild(battle.firstChild);
					if (this.opponent.banned || this.opponent.frozen)
						battle.removeChild(battle.firstChild);
					battle.removeChild(battle.firstChild);
					this.opponent.speed = /:[\s]+([\-.0-9]+)/
							.exec(battle.firstChild.nodeValue)[1];
					battle.removeChild(battle.firstChild);
					battle.removeChild(battle.firstChild);
					battle.removeChild(battle.firstChild);
					this.me.speed = /:[\s]+([\-.0-9]+)/
							.exec(battle.firstChild.nodeValue)[1];
					battle.removeChild(battle.firstChild);
				} catch (error) {
					this.errors.push(getErrorString(error));
				}

				while (battle.firstChild.nodeName.toLowerCase() == "br") {
					battle.removeChild(battle.firstChild);
				}
				try {
					// then helm altered speeds.
					battle.removeChild(battle.firstChild);
					battle.removeChild(battle.firstChild);
					if (this.opponent.banned || this.opponent.frozen)
						battle.removeChild(battle.firstChild);
					battle.removeChild(battle.firstChild);
					this.opponent.speed = /:[\s]+([\-.0-9]+)/
							.exec(battle.firstChild.nodeValue)[1];
					battle.removeChild(battle.firstChild);
					battle.removeChild(battle.firstChild);
					battle.removeChild(battle.firstChild);
					this.me.speed = /:[\s]+([\-.0-9]+)/
							.exec(battle.firstChild.nodeValue)[1];
					battle.removeChild(battle.firstChild);
				} catch (error) {
					this.errors.push(getErrorString(error));
				}
				while (battle.firstChild.nodeName.toLowerCase() == "br") {
					battle.removeChild(battle.firstChild);
				}

				try {
					// now the fun part... all those weird adjustments
					// from
					// snuff and such.. I hope this works.
					var adjcol = null;
					var curnode;
					var i = 0;
					// var exstr = "[\\s\\S]*?alters
					// ("+me.name+"|"+this.opponent.name+")";
					var alterex = new RegExp(
							"(alters|changes)\\s*[BF:\\s]*?("
									+ RegExp.escape(me.name)
									+ "|"
									+ RegExp.escape(this.opponent.name)
									+ "|your|target's)\\s*(speed|strength|defense)[\\s\\S]*?:\\s*([-.,\\d]+)",
							"i");
					var alters;
					while (adjcol == null) {
						i = 0;
						adjcol = new Array();
						while (battle.childNodes[i].nodeName.toLowerCase() != "br") {
							curnode = battle.childNodes[i];
							// sometimes they throw a link into the mix
							// and
							// we need to dig deeper
							if (/\[object Text\]/.test(curnode.toString())) {
								adjcol.push(curnode.nodeValue);
							} else {
								adjcol.push(curnode.innerHTML);
							}
							i++;
						}
						// now get the string without any links
						adjcol = adjcol.join("");
						if (alterex.test(adjcol)) {
							var regresult = alterex.exec(adjcol);
							alters = regresult[2];
							var stat = (regresult[3]).toLowerCase();
							if ((alters == me.name) || (alters == "your")) {
								if (stat == "speed") {
									me.speed = (regresult[4]).stripCommas();
								}
								this.me.adjustments.push(adjcol);
							} else {
								if (stat == "speed") {
									this.opponent.speed = (regresult[4])
											.stripCommas();
								}
								this.opponent.adjustments.push(adjcol);
							}
							for (var j = 0; j < i; j++) {
								battle.removeChild(battle.firstChild);
							}
							while (battle.firstChild.nodeName.toLowerCase() == "br") {
								battle.removeChild(battle.firstChild);
							}
							adjcol = null;
						}

					}
				} catch (error) {
					errors.push(getErrorString(error));
				}
				// just in case
				while (!(/\[object Text\]/.test(curnode.toString()))) {
					battle.removeChild(battle.firstChild);
				}
				try {
					// get adjusted strength
					battle.removeChild(battle.firstChild);
					battle.removeChild(battle.firstChild);
					if (this.opponent.banned || this.opponent.frozen)
						battle.removeChild(battle.firstChild);
					battle.removeChild(battle.firstChild);
					if (battle.firstChild.nodeValue == null)
						battle.removeChild(battle.firstChild);
					this.opponent.strength = /:[\s]+([\-.0-9]+)/
							.exec(battle.firstChild.nodeValue)[1];
					battle.removeChild(battle.firstChild);
					battle.removeChild(battle.firstChild);
					battle.removeChild(battle.firstChild);
					me.strength = /:[\s]+([\-.0-9]+)/
							.exec(battle.firstChild.nodeValue)[1];
					battle.removeChild(battle.firstChild);
				} catch (error) {
					errors.push(getErrorString(error));
				}

				while (battle.firstChild.nodeName.toLowerCase() == "br") {
					battle.removeChild(battle.firstChild);
				}

				try {
					// get adjusted defenses
					battle.removeChild(battle.firstChild);
					battle.removeChild(battle.firstChild);
					if (this.opponent.banned || this.opponent.frozen)
						battle.removeChild(battle.firstChild);
					battle.removeChild(battle.firstChild);
					this.opponent.defense = /:[\s]+([\-.0-9]+)/
							.exec(battle.firstChild.nodeValue)[1];
					battle.removeChild(battle.firstChild);
					battle.removeChild(battle.firstChild);
					battle.removeChild(battle.firstChild);
					this.me.defense = /:[\s]+([\-.0-9]+)/
							.exec(battle.firstChild.nodeValue)[1];
					battle.removeChild(battle.firstChild);
				} catch (error) {
					errors.push(getErrorString(error));
				}
				while (battle.firstChild.nodeName.toLowerCase() == "br") {
					battle.removeChild(battle.firstChild);
				}

				// now to start processing the attacks.
				try {
					battletext = battle.innerHTML;
					sbtext = battletext.stripTags();
					var ambushcheck = /Ambush Chance:\s*[.0-9]+ %, number rolled:\s*[0-9]+/i;
					var ambushdamage = /AMBUSH![\s\S]*?[,0-9]+[\s\S]*?strike!/i;
					if (ambushcheck.test(sbtext)) {
						this.ambush.push(ambushcheck.exec(sbtext)[0]);
						if (ambushdamage.test(sbtext)) {
							this.ambush.push(ambushdamage.exec(sbtext)[0]);
						}
					}
				} catch (error) {
					errors.push(getErrorString(error));
				}
				// get the weapons
				var meex = /Using your\s*([\s\S]*?)\s*you hit/i;
				var oppex = /Using their\s*([\s\S]*?)\./i;
				this.me.using = meex.test(sbtext) ? meex.exec(sbtext)[1] : null;
				this.opponent.using = oppex.test(sbtext)
						? oppex.exec(sbtext)[1]
						: null;

				var match;

				// make the fighter objects... there has to be a more
				// elegant way of doing this./// make a separate object
				// and parser to start.
				// me = new
				// Fighter(myhp,myadjstrength,myadjdefense,myadjspeed,myequip);
				// opponent = new
				// Fighter(opphp,oppadjstrength,oppadjdefense,oppadjspeed,oppequip);
				try {
					// now to process the attacks. If match[1] has a
					// value
					// then it was me, if match[2] then it's the
					// opponent,
					// match[3] is for misfires.
					var attackregex = /you hit\s*([,0-9]+)\s*on|hit\s*([,0-9]+)\s*damage on you|(Weapon Misfire!)/gi;
					match = attackregex.exec(battletext);
					while (match != null) {
						// alert(match[0]);
						if (match[1] != null) {
							// my attack
							addAttack(this.me, match[1]);
						} else if (match[2] != null) {
							// their attack
							addAttack(this.opponent, match[2]);
						} else if (match[3] != null) {
							// misfire
							addMisfire();
						}
						match = attackregex.exec(battletext);
					}
				} catch (error) {
					errors.push(getErrorString(error));
				}
				try {
					var winregex = new RegExp("You killed [BF:\\s]*?"
									+ RegExp.escape(this.opponent.name), "i");
					// alert(winregex.toString());
					// alert(stripTags(battletext));
					var prizeregex, prizes;
					if (winregex.test(sbtext)) {
						// I won
						// alert("I won");
						winner = me;
						prizeregex = /You gain[\s]*([,0-9]+)[\s]*EXP and stole[\s]*\$([,0-9]+)[\s]*from/i;
						prizes = prizeregex.exec(battletext);
						this.prizemoney = prizes[2];
						this.prizeexp = prizes[1];
						prizeregex = /Your fleet took[\s]*\$([,0-9]+)[\s]*from/i;
						if (prizeregex.test(battletext))
							this.fleetmoney = prizeregex.exec(battletext)[1];

					} else {
						// they won
						// alert("they won");
						this.winner = this.opponent;
						prizeregex = /gained\s*([,0-9]+)\s*EXP and stole\s*,\s*from you[.\s]*\$([,0-9]+)|gained[\s]*([,0-9]+)\s*from you/i;
						prizes = prizeregex.exec(battletext);
						this.prizemoney = (prizes[3] != null) ? 0 : prizes[2];
						this.prizeexp = (prizes[3] != null)
								? prizes[3]
								: prizes[1];
						prizeregex = /Their (?:fleet|Gang) took\s*\$([,0-9]+)/i;
						if (prizeregex.test(battletext))
							this.fleetmoney = prizeregex.exec(battletext)[1];
					}
				} catch (error) {
					errors.push(getErrorString(error));
				}
				var idregex = new RegExp("user=([0-9]+)[\\s\\S]*?>"
								+ RegExp.escape(opponent.name) + "</a>",
						"i");
				// alert(idregex.toString());
				this.opponent.id = idregex.exec(battletext)[1];

				this.me.id = doc
						.evaluate(
								'substring-after(string(id("profile_info")//a[starts-with(@href, "index.php?on=profile&user=")]/@href),"user=")',
								doc, null, XPathResult.NUMBER_TYPE, null).numberValue;
				this.me.level = doc.evaluate('substring-after(substring-before(string(id("profile_info")//div[@class="user_role"][last()])," ["),"lvl:")',doc, null, XPathResult.STRING_TYPE, null).stringValue
						.stripCommas();

				while (battle.hasChildNodes())
					battle.removeChild(battle.firstChild);

			} catch (error) {
				errors.push(getErrorString(error));
			}
			// original.parentNode.appendChild(original);
			// original.parentNode.removeChild(battle);
			// debugResponse(doc.getElementById("insidecontent").innerHTML);
		}
	} else if (piratequesting.baseTheme == piratequesting.DEFAULT_THEME) {
		try {
			//verify fight
			var end_result = doc.getElementById("end_result");
			var battle_container = doc.getElementById("pirate-battle");
			//this.original = battle_container;
			
			if (end_result) { //if there is no end result, then we aren't on a proper fight page
				var results1s = getChildrenByClassName(end_result, "res1");
				if (results1s && results1s[0] && (results1s[0].innerHTML != "NO RESULT!")) { //only proceed if the fight had a result. NO RESULT! means the player or opponent is unable to fight (for a variety of reasons)
					this.winner = (results1s[0].innerHTML.contains("LOST")) ? this.opponent : this.me;
					
					//set up fighters
					this.me.level = piratequesting.Player.getLevel();
					this.me.name = piratequesting.Player.getName();
					
					this.adjustment = doc.evaluate('id("d")/table[@class="summary"]//tr[contains(./th, "Adjustment")]/td/text()', battle_container, null, XPathResult.STRING_TYPE, null).stringValue;
					
					//get player info
					
					this.opponent.name = doc.evaluate('id("battle")//p[@class="right"]/text()', battle_container, null, XPathResult.STRING_TYPE, null).stringValue;
					this.opponent.banned = doc.evaluate('id("attack_log")//div[@class="log_item"]/a[@title="banned"]', battle_container, null, XPathResult.BOOLEAN_TYPE, null).booleanValue;
					this.opponent.frozen = doc.evaluate('id("attack_log")//div[@class="log_item"]/a[@title="frozen"]', battle_container, null, XPathResult.BOOLEAN_TYPE, null).booleanValue;
					
					//opponent level and hp not shown in default theme
					//disguise not shown
					//adjustments not shown
					
					this.me.strength = doc.evaluate('id("d")/table[@class="fighter"]//tr[contains(./th, "trength")]/td/text()', battle_container, null, XPathResult.STRING_TYPE, null).stringValue.toNumber();
					this.me.defense = doc.evaluate('id("d")/table[@class="fighter"]//tr[contains(./th, "efense")]/td/text()', battle_container, null, XPathResult.STRING_TYPE, null).stringValue.toNumber();
					this.me.speed = doc.evaluate('id("d")/table[@class="fighter"]//tr[contains(./th, "peed")]/td/text()', battle_container, null, XPathResult.STRING_TYPE, null).stringValue.toNumber();
					
					this.opponent.strength = doc.evaluate('id("d")/table[@class="fighter second"]//tr[contains(./th, "trength")]/td/text()', battle_container, null, XPathResult.STRING_TYPE, null).stringValue.toNumber();
					this.opponent.defense = doc.evaluate('id("d")/table[@class="fighter second"]//tr[contains(./th, "efense")]/td/text()', battle_container, null, XPathResult.STRING_TYPE, null).stringValue.toNumber();
					this.opponent.speed = doc.evaluate('id("d")/table[@class="fighter second"]//tr[contains(./th, "peed")]/td/text()', battle_container, null, XPathResult.STRING_TYPE, null).stringValue.toNumber();
					
					if (this.winner == this.me) {
						//get result, money, exp
						//note that result 2 content can vary w bit. each res2 includes only one "fact", however these can be: money made, exp gained, or money taken by gang
						var result2s = getChildrenByClassName(end_result, "res2");
						result2s.forEach(function(result) {
							var contents = result.innerHTML;
							if (contents.contains("Yer Gang")) {
								this.fleetmoney = contents.toNumber();
							}
							else 
								if (contents.contains("experience")) {
									this.prizeexp = contents.toNumber();
								}
								else 
									if (contents.contains("$")) {
										this.prizemoney = contents.toNumber();
									}
						}, this);
					}
					
					//get equipment
					
					var meex = /Using yer\s*([\s\S]*?)\s*ye hit/i;
					var oppex = /using their\s*([\s\S]*)/i;
					
					var myequip = doc.evaluate('id("attack_log")/div[@class="logitem"][contains(text(), "Using yer")][1]', battle_container, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
					if (myequip && myequip.singleNodeValue) {
						this.me.using = meex.exec(myequip.singleNodeValue.textContent)[1]
					}
					var oppequip = doc.evaluate('id("attack_log")/div[@class="logitem"][contains(text(), "using their")][1]', battle_container, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
					if (oppequip && oppequip.singleNodeValue) {
						this.opponent.using = oppex.exec(oppequip.singleNodeValue.textContent)[1]
					}
					
					//get ambush lines
					//get attacks, misfires
					
					var ambushes = doc.evaluate('id("attack_log")/div[@class="logitem"][starts-with(text(), "Ambush") or starts-with(text(), "AMBUSH")]', battle_container, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
					var attacks = doc.evaluate('id("attack_log")/div[@class="logitem"][contains(text(), "Using yer") or contains(text(), "using their") or contains(text(), "Weapon misfire")]', battle_container, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
					
					for (var i = 0, len = ambushes.snapshotLength; i < len; i++) {
						this.ambush.push(ambushes.snapshotItem(i).textContent);
					}
					
					var match, tc;
					var attackregex = /ye hit\s*([,0-9]+)\s*on|hit\s*([,0-9]+)\s*damage on ye|(Weapon Misfire!)/i;
					for (var i = 0, len = attacks.snapshotLength; i < len; i++) {
						tc = attacks.snapshotItem(i).textContent;
						match = attackregex.exec(tc);
						if (match) {
							// alert(match[0]);
							if (match[1] != null) {
								// my attack
								addAttack(this.me, match[1]);
							}
							else 
								if (match[2] != null) {
									// their attack
									addAttack(this.opponent, match[2]);
								}
								else 
									if (match[3] != null) {
										// misfire
										addMisfire();
									}
						}
					}
					
					
				}
				
			}
		} catch(e) {
			dumpError(e);
			pqlog(e, PQ_DEBUG_ERROR);
		}
	}
}

Fight.prototype.toTable = function(doc) {
	var table, row, cell, altcell, data, br;
	table = doc.createElement("table");
	table.setAttribute("style","background-color: #ece5c9; -moz-border-radius:5px; margin-bottom:15px");
	table.setAttribute("cellpadding", "5");
	table.setAttribute("cellspacing", "4");
	table.setAttribute("width", "100%");

	// add the fighter information
	row = doc.createElement("tr");
	cell = doc.createElement("td");
	cell.setAttribute("style","padding:5px 5px 5px 5px;")
	cell.setAttribute("width", "50%");
	this.me.print(doc, cell, this.winner, this.disguise);
	row.appendChild(cell);
	cell = doc.createElement("td");
	cell.setAttribute("style","padding:5px 5px 5px 5px;")
	cell.setAttribute("width", "50%");
	this.opponent.print(doc, cell, this.winner, null);
	row.appendChild(cell);
	table.appendChild(row);

	// add the ambush if present
	if (this.ambush.length > 0) {
		row = doc.createElement("tr");
		cell = doc.createElement("td");
		altcell = doc.createElement("td");
		cell.appendChild(doc.createTextNode(this.ambush[0]));
		if (this.ambush.length > 1) {
			cell.appendChild(doc.createElement("br"));
			cell.appendChild(doc.createTextNode(this.ambush[1]));
			cell.setAttribute("style","background-color: #f1ffd0; border-width:1px;border-style:outset;border-color:#4e462f;padding:5px 5px 5px 5px; margin-bottom:3px;")
		} else {
			cell.setAttribute("style","background-color: #ffe5d0; border-width:1px;border-style:outset;border-color:#4e462f;padding:5px 5px 5px 5px; margin-bottom:3px;")
		}

		altcell.setAttribute("style","background-color: #ebe5cb; border-width:0px;padding:5px 5px 5px 5px;")
		row.appendChild(cell);
		row.appendChild(altcell);
		table.appendChild(row);
	}

	// add the attacks
	for (var i = 0; i < this.attacks.length; i++) {
		row = doc.createElement("tr");
		cell = doc.createElement("td");
		altcell = doc.createElement("td");
		if (this.attacks[i] instanceof Misfire) {
			i++;
			cell.appendChild(doc.createTextNode("Weapon misfire!"));
			cell.appendChild(doc.createElement("br"));
		}
		cell.appendChild(doc.createTextNode(this.attacks[i].attacker == this.me	? "You hit " + this.opponent.name + " for "	+ this.attacks[i].damage + " damage"
				: this.opponent.name + " hit you for " + this.attacks[i].damage	+ " damage"));
		cell.setAttribute("style","background-color: #f5efd3; border-width:1px;border-style:outset;border-color:#4e462f;padding:5px 5px 5px 5px; margin-bottom:3px;")
		altcell.setAttribute("style","background-color: #ebe5cb; border-width:0px;padding:5px 5px 5px 5px;")
		if (this.attacks[i].attacker == this.me) {
			row.appendChild(cell);
			row.appendChild(altcell);
		} else {
			row.appendChild(altcell);
			row.appendChild(cell);
		}
		table.appendChild(row);
	}

	// add the winnings
	row = doc.createElement("tr");
	cell = doc.createElement("td");
	cell.setAttribute("colspan", "2");
	cell.appendChild(doc.createTextNode(this.winner == this.me ? "You killed "
			+ this.opponent.name : this.opponent.name + " killed you"));
	cell.appendChild(doc.createElement("br"));
	cell.appendChild(doc.createElement("br"));
	cell.appendChild(doc.createTextNode((this.winner == this.me ? "You" : this.opponent.name)
			+ " gained " + this.prizeexp + " experience and stole $" + this.prizemoney));
	cell.appendChild(doc.createElement("br"));
	if (this.fleetmoney != null) {
		cell.appendChild(doc.createTextNode((this.winner == this.me ? "Your" : "Their") + " fleet took $" + this.fleetmoney));
	}
	cell.setAttribute("style","background-color: #ece5c9; border-width:0px;padding:5px 5px 5px 5px; font-weight:bold;")
	row.appendChild(cell);
	table.appendChild(row);

	row = doc.createElement("tr");
	cell = doc.createElement("td");
	cell.setAttribute("colspan", "2");
	cell.setAttribute("style", "font-size:xx-small;");
	data = doc.createTextNode("(" + this.adjustment + ")");

	cell.appendChild(data);
	row.appendChild(cell);
	table.appendChild(row);

	if (this.errors.length > 0) {
		row = doc.createElement("tr");
		cell = doc.createElement("td");
		cell.setAttribute("colspan", "2");
		for (var i = 0, len = this.errors.length; i < len; ++i) {
			cell.appendChild(doc.createTextNode(this.errors[i]));
			cell.appendChild(doc.createElement("br"));
		}
		cell.setAttribute("style","background-color: #ece5c9; border-width:0px;padding:5px 5px 5px 5px; font-weight:bold;color: red;")
		row.appendChild(cell);
		table.appendChild(row);
	}
	return table;
}

/**
 * Fight page processing helper<br>
 * 
 * @class
 */
piratequesting.FightProcessor = function() {

		return {
		print : function(doc) {
			
			/*
			var battle = doc.getElementById("insidecontent").getElementsByTagName("table")[0];

			function toggle(event) {
				var element = battle;
				if (element.style.display && element.style.display == "none") {
					back.style.display = "none";
					element.style.display = null;
				} else {
					back.style.display = null;
					element.style.display = "none";

				}
			}
			var a = doc.createElement("a");
			a.appendChild(doc.createTextNode("Show/Hide original report."))
			battle.parentNode.insertBefore(table, battle);
			battle.parentNode.insertBefore(a, battle);
			a.setAttribute("onclick", "return false;");
			a.setAttribute("href", "#");
			a.addEventListener("click", toggle, false);
			a.style.display = "block";

			battle.parentNode.appendChild(back);
			battle.style.display = "none";
			// battle.parentNode.removeChild(battle);
			*/
		},

		process : function(doc) {
			pqdump("PQ: Processing Fight\n", PQ_DEBUG_STATUS);
			
			var fight = new Fight();
			
			pqdump("\tParsing document\n", PQ_DEBUG_STATUS);
			fight.parse(doc);
			pqlog(fight, PQ_DEBUG_STATUS);
			if (true || fight.winner != null) {
				pqdump("\tNotifying processor completion\n", PQ_DEBUG_STATUS);
				//JSON.stringify(fight)
				//document.fire("piratequesting:FightUpdated",doc, 0, fight);
				try {
					notifyObservers(doc, "piratequesting-on-process-fight", JSON.stringify(fight));
				} catch(e) {
					pqlog(e,PQ_DEBUG_ERROR);
				}
			}

		}
	}
}();

piratequesting.addLoadProcess(new RegExp(piratequesting.strings.FightProcessor.getString("page_regex"), ""),piratequesting.FightProcessor.process);