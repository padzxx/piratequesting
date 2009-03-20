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
	 * @property {Array} adjustments Array of Strings for the additional
	 *           adjustments
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

		this.print = function(doc, container, winner, disguise) {
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
				namespan
						.setAttribute("style",
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
			container.appendChild(doc.createTextNode("HP: " + this.hp));
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
			container
					.appendChild(doc.createTextNode("Additional Adjustments:"));
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
			container.appendChild(doc.createTextNode(this.using));
			container.appendChild(doc.createElement("br"));
			container.appendChild(doc.createElement("br"));
		}
	}

		
	function Attack(a_attacker, a_damage) {
		this.attacker = a_attacker;
		this.damage = a_damage;
	}

	function Misfire() {
		this.misfire = true;
	}

/**
 * Fight page processing helper<br>
 * 
 * @class
 */
piratequesting.FightProcessor = function() {

	

	var attacks = new Array();
	var me = new Fighter();
	var opponent = new Fighter();
	var winner;
	var prizemoney;
	var prizeexp;
	var fleetmoney;
	var back;
	var adjustment;
	var ambush = new Array();
	var disguise;
	var original;
	var errors = new Array();
	
	function clear () {
		attacks = new Array();
		me = new Fighter();
		opponent = new Fighter();
		winner=null;
		prizemoney=null;
		prizeexp=null;
		fleetmoney=null;
		back=null;
		adjustment=null;
		ambush = new Array();
		disguise=null;
		original=null;
		errors = new Array();
	
	}
	function addAttack (attacker, damage) {
		attacks.push(new Attack(attacker, damage));
	}

	function addMisfire() {
			attacks.push(new Misfire());
	}

	function parse(doc) {
			// first make sure we're actually fighting someone
			if (/You are in a fight with /.test(doc.body.innerHTML)) {
				if (/You are in a fight with B:/.test(doc.body.innerHTML))
					opponent.banned = true;
				if (/You are in a fight with F:/.test(doc.body.innerHTML))
					opponent.frozen = true;
				var original = doc.getElementById("insidecontent")
						.getElementsByTagName("td")[0];
				battle = original.cloneNode(true);
				back = battle.getElementsByTagName("a");
				back = back[back.length - 1];
				var battletext = battle.innerHTML;
				// remove the line breaks
				try {
					while (battle.firstChild.nodeName.toLowerCase() != "i") {
						battle.removeChild(battle.firstChild);
					}

					// now get the adjustment text and remove it.
					adjustment = battle.firstChild.firstChild.nodeValue;
					battle.removeChild(battle.firstChild);
					// remove the line breaks
					while (battle.firstChild.nodeName.toLowerCase() == "br") {
						battle.removeChild(battle.firstChild);
					}
					try {
						// check for disguise
						if (/Your disguise/.test(battle.firstChild.nodeValue)) {
							disguise = battle.firstChild.nodeValue;
							battle.removeChild(battle.firstChild);
						}
					} catch (error) {
						errors.push(getErrorString(error));
					}
					while (battle.firstChild.nodeName.toLowerCase() == "br") {
						battle.removeChild(battle.firstChild);
					}

					// next, if the person is banned or frozen, get rid of
					// the little B or F
					if (opponent.banned || opponent.frozen)
						battle.removeChild(battle.firstChild);

					try {
						// Next, get the opponent's name and HP
						opponent.name = battle.firstChild.innerHTML;
						battle.removeChild(battle.firstChild);
						opponent.hp = /([\-,0-9]+)/
								.exec(battle.firstChild.nodeValue)[1];
						battle.removeChild(battle.firstChild);
					} catch (error) {
						errors.push(getErrorString(error));
					}
					// remove the next line break
					battle.removeChild(battle.firstChild);
					try {
						// get my name and hp
						me.name = battle.firstChild.innerHTML;
						battle.removeChild(battle.firstChild);
						me.hp = /([\-,0-9]+)/.exec(battle.firstChild.nodeValue)[1];
						battle.removeChild(battle.firstChild);
					} catch (error) {
						errors.push(getErrorString(error));
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
						battle.removeChild(battle.firstChild); // Your
						// natural
						// speeds are:
						battle.removeChild(battle.firstChild); // <br />
						if (opponent.banned || opponent.frozen)
							battle.removeChild(battle.firstChild);
						battle.removeChild(battle.firstChild); // anchor +
						// name
						opponent.speed = /([\-.0-9]+)/
								.exec(battle.firstChild.nodeValue)[1];
						battle.removeChild(battle.firstChild);
						battle.removeChild(battle.firstChild); // <br />
						battle.removeChild(battle.firstChild); // anchor +
						// name
						me.speed = /([\-.0-9]+)/
								.exec(battle.firstChild.nodeValue)[1];
						battle.removeChild(battle.firstChild);
					} catch (error) {
						errors.push(getErrorString(error));
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
						opponent.speed = /:[\s]+([\-.0-9]+)/
								.exec(battle.firstChild.nodeValue)[1];
						battle.removeChild(battle.firstChild);
						battle.removeChild(battle.firstChild);
						battle.removeChild(battle.firstChild);
						me.speed = /:[\s]+([\-.0-9]+)/
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
						if (opponent.banned || opponent.frozen)
							battle.removeChild(battle.firstChild);
						battle.removeChild(battle.firstChild);
						opponent.speed = /:[\s]+([\-.0-9]+)/
								.exec(battle.firstChild.nodeValue)[1];
						battle.removeChild(battle.firstChild);
						battle.removeChild(battle.firstChild);
						battle.removeChild(battle.firstChild);
						me.speed = /:[\s]+([\-.0-9]+)/
								.exec(battle.firstChild.nodeValue)[1];
						battle.removeChild(battle.firstChild);
					} catch (error) {
						errors.push(getErrorString(error));
					}

					while (battle.firstChild.nodeName.toLowerCase() == "br") {
						battle.removeChild(battle.firstChild);
					}
										try {
						// then helm altered speeds.
						battle.removeChild(battle.firstChild);
						battle.removeChild(battle.firstChild);
						if (opponent.banned || opponent.frozen)
							battle.removeChild(battle.firstChild);
						battle.removeChild(battle.firstChild);
						opponent.speed = /:[\s]+([\-.0-9]+)/
								.exec(battle.firstChild.nodeValue)[1];
						battle.removeChild(battle.firstChild);
						battle.removeChild(battle.firstChild);
						battle.removeChild(battle.firstChild);
						me.speed = /:[\s]+([\-.0-9]+)/
								.exec(battle.firstChild.nodeValue)[1];
						battle.removeChild(battle.firstChild);
					} catch (error) {
						errors.push(getErrorString(error));
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
						// ("+me.name+"|"+opponent.name+")";
						var alterex = new RegExp(
								"(alters|changes)\\s*[BF:\\s]*?("
										+ RegExp.escape(me.name) + "|"
										+ RegExp.escape(opponent.name)
										+ "|your|target's)\\s*(speed|strength|defense)[\\s\\S]*?:\\s*([-.,\\d]+)", "i");
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
									if (stat == "speed"){
										me.speed = (regresult[4]).stripCommas();
									}
									me.adjustments.push(adjcol);
								} else {
									if (stat == "speed"){
										opponent.speed = (regresult[4]).stripCommas();
									}
									opponent.adjustments.push(adjcol);
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
						if (opponent.banned || opponent.frozen)
							battle.removeChild(battle.firstChild);
						battle.removeChild(battle.firstChild);
						if (battle.firstChild.nodeValue == null)
							battle.removeChild(battle.firstChild);
						opponent.strength = /:[\s]+([\-.0-9]+)/
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
						if (opponent.banned || opponent.frozen)
							battle.removeChild(battle.firstChild);
						battle.removeChild(battle.firstChild);
						opponent.defense = /:[\s]+([\-.0-9]+)/
								.exec(battle.firstChild.nodeValue)[1];
						battle.removeChild(battle.firstChild);
						battle.removeChild(battle.firstChild);
						battle.removeChild(battle.firstChild);
						me.defense = /:[\s]+([\-.0-9]+)/
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
							ambush.push(ambushcheck.exec(sbtext)[0]);
							if (ambushdamage.test(sbtext)) {
								ambush.push(ambushdamage.exec(sbtext)[0]);
							}
						}
					} catch (error) {
						errors.push(getErrorString(error));
					}
					// get the weapons
					var meex = /Using your\s*([\s\S]*?)\s*you hit/i;
					var oppex = /Using their\s*([\s\S]*?)\./i;
					me.using = meex.test(sbtext) ? meex.exec(sbtext)[1] : null;
					opponent.using = oppex.test(sbtext)
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
								addAttack(me, match[1]);
							} else if (match[2] != null) {
								// their attack
								addAttack(opponent, match[2]);
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
										+ RegExp.escape(opponent.name), "i");
						// alert(winregex.toString());
						// alert(stripTags(battletext));
						var prizeregex, prizes;
						if (winregex.test(sbtext)) {
							// I won
							// alert("I won");
							winner = me;
							prizeregex = /You gain[\s]*([,0-9]+)[\s]*EXP and stole[\s]*\$([,0-9]+)[\s]*from/i;
							prizes = prizeregex.exec(battletext);
							prizemoney = prizes[2];
							prizeexp = prizes[1];
							prizeregex = /Your fleet took[\s]*\$([,0-9]+)[\s]*from/i;
							if (prizeregex.test(battletext))
								fleetmoney = prizeregex.exec(battletext)[1];

						} else {
							// they won
							// alert("they won");
							winner = opponent;
							prizeregex = /gained\s*([,0-9]+)\s*EXP and stole\s*,\s*from you[.\s]*\$([,0-9]+)|gained[\s]*([,0-9]+)\s*from you/i;
							prizes = prizeregex.exec(battletext);
							prizemoney = (prizes[3] != null) ? 0 : prizes[2];
							prizeexp = (prizes[3] != null)
									? prizes[3]
									: prizes[1];
							prizeregex = /Their (?:fleet|Gang) took\s*\$([,0-9]+)/i;
							if (prizeregex.test(battletext))
								fleetmoney = prizeregex.exec(battletext)[1];
						}
					} catch (error) {
						errors.push(getErrorString(error));
					}
					var idregex = new RegExp("user=([0-9]+)[\\s\\S]*?>"
									+ RegExp.escape(opponent.name) + "</a>",
							"i");
					// alert(idregex.toString());
					opponent.id = idregex.exec(battletext)[1];
					
					me.id = doc.evaluate('substring-after(string(id("profile_info")//a[starts-with(@href, "index.php?on=profile&user=")]/@href),"user=")',doc,null,XPathResult.NUMBER_TYPE,null).numberValue;
					me.level = doc.evaluate('substring-after(substring-before(string(id("profile_info")//div[@class="user_role"][last()])," ["),"lvl:")',doc,null,XPathResult.STRING_TYPE,null).stringValue.stripCommas();
			
					while (battle.hasChildNodes())
						battle.removeChild(battle.firstChild);
						
				} catch (error) {
					errors.push(getErrorString(error));
				}
				//original.parentNode.appendChild(original);
				//original.parentNode.removeChild(battle);
				// debugResponse(doc.getElementById("insidecontent").innerHTML);
			}
		}
		return {
			print : function(doc) {
			var battle = doc.getElementById("insidecontent")
					.getElementsByTagName("table")[0];
			
			var table, row, cell, altcell, data, br;
			table = doc.createElement("table");
			table
					.setAttribute(
							"style",
							"background-color: #ece5c9; border-width:1px;border-style:outset;border-color:#4e462f;margin-left:10px;margin-top:20px;margin-bottom:15px");
			table.setAttribute("cellpadding", "5");
			table.setAttribute("cellspacing", "4");
			table.setAttribute("width", "95%");

			// add the fighter information
			row = doc.createElement("tr");
			cell = doc.createElement("td");
			cell
					.setAttribute("style",
							"background-color: #ece5c9; border-width:0px;padding:5px 5px 5px 5px;")
			cell.setAttribute("width", "50%");
			me.print(doc, cell, winner, disguise);
			row.appendChild(cell);
			cell = doc.createElement("td");
			cell
					.setAttribute("style",
							"background-color: #ece5c9; border-width:0px;padding:5px 5px 5px 5px;")
			cell.setAttribute("width", "50%");
			opponent.print(doc, cell, winner, null);
			row.appendChild(cell);
			table.appendChild(row);

			// add the ambush if present
			if (ambush.length > 0) {
				row = doc.createElement("tr");
				cell = doc.createElement("td");
				altcell = doc.createElement("td");
				cell.appendChild(doc.createTextNode(ambush[0]));
				if (ambush.length > 1) {
					cell.appendChild(doc.createElement("br"));
					cell.appendChild(doc.createTextNode(ambush[1]));
					cell
							.setAttribute(
									"style",
									"background-color: #f1ffd0; border-width:1px;border-style:outset;border-color:#4e462f;padding:5px 5px 5px 5px; margin-bottom:3px;")
				} else {
					cell
							.setAttribute(
									"style",
									"background-color: #ffe5d0; border-width:1px;border-style:outset;border-color:#4e462f;padding:5px 5px 5px 5px; margin-bottom:3px;")
				}

				altcell
						.setAttribute("style",
								"background-color: #ebe5cb; border-width:0px;padding:5px 5px 5px 5px;")
				row.appendChild(cell);
				row.appendChild(altcell);
				table.appendChild(row);
			}

			// add the attacks
			for (var i = 0; i < attacks.length; i++) {
				row = doc.createElement("tr");
				cell = doc.createElement("td");
				altcell = doc.createElement("td");
				if (attacks[i] instanceof Misfire) {
					i++;
					cell.appendChild(doc.createTextNode("Weapon misfire!"));
					cell.appendChild(doc.createElement("br"));
				}
				cell.appendChild(doc.createTextNode(attacks[i].attacker == me
						? "You hit " + opponent.name + " for "
								+ attacks[i].damage + " damage"
						: opponent.name + " hit you for " + attacks[i].damage
								+ " damage"));
				cell
						.setAttribute(
								"style",
								"background-color: #f5efd3; border-width:1px;border-style:outset;border-color:#4e462f;padding:5px 5px 5px 5px; margin-bottom:3px;")
				altcell
						.setAttribute("style",
								"background-color: #ebe5cb; border-width:0px;padding:5px 5px 5px 5px;")
				if (attacks[i].attacker == me) {
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
			cell.appendChild(doc.createTextNode(winner == me ? "You killed "
					+ opponent.name : opponent.name + " killed you"));
			cell.appendChild(doc.createElement("br"));
			cell.appendChild(doc.createElement("br"));
			cell.appendChild(doc.createTextNode((winner == me
					? "You"
					: opponent.name)
					+ " gained "
					+ prizeexp
					+ " experience and stole $"
					+ prizemoney));
			cell.appendChild(doc.createElement("br"));
			if (fleetmoney != null) {
				cell.appendChild(doc.createTextNode((winner == me
						? "Your"
						: "Their")
						+ " fleet took $" + fleetmoney));
			}
			cell
					.setAttribute(
							"style",
							"background-color: #ece5c9; border-width:0px;padding:5px 5px 5px 5px; font-weight:bold;")
			row.appendChild(cell);
			table.appendChild(row);

			row = doc.createElement("tr");
			cell = doc.createElement("td");
			cell.setAttribute("colspan", "2");
			cell.setAttribute("style", "font-size:xx-small;");
			data = doc.createTextNode("(" + adjustment + ")");

			cell.appendChild(data);
			row.appendChild(cell);
			table.appendChild(row);

			if (errors.length > 0) {
				row = doc.createElement("tr");
				cell = doc.createElement("td");
				cell.setAttribute("colspan", "2");
				for (var i = 0, len = errors.length; i < len; ++i) {
					cell.appendChild(doc.createTextNode(errors[i]));
					cell.appendChild(doc.createElement("br"));
				}
				cell
						.setAttribute(
								"style",
								"background-color: #ece5c9; border-width:0px;padding:5px 5px 5px 5px; font-weight:bold;color: red;")
				row.appendChild(cell);
				table.appendChild(row);
			}

			function toggle(event) {
				var element = battle;
				if (element.style.display && element.style.display == "none") {
					back.style.display = "none";
					element.style.display = null;
				} else  { 
					back.style.display = null;
					element.style.display = "none";
				
				}
			}
			var a = doc.createElement("a");
			a.appendChild(doc.createTextNode("Show/Hide original report."))
			battle.parentNode.insertBefore(table,battle);
			battle.parentNode.insertBefore(a,battle);
			a.setAttribute("onclick", "return false;");
			a.setAttribute("href", "#");
			a.addEventListener("click", toggle,false);
			a.style.display = "block";
			
			battle.parentNode.appendChild(back);
			battle.style.display = "none";
			//battle.parentNode.removeChild(battle);
		},

		output : function() {
			return {
				opponent:opponent,
				me:me,
				winner:winner,
				prize:prizemoney,
				experience: prizeexp,
				attacks: attacks,
				ambush:ambush
			}
			/*return [opponent.name, winner.name, prizemoney, prizeexp,
					me.strength, me.defense, me.speed, opponent.strength,
					opponent.defense, opponent.speed];*/
		},
		process : function (doc) {
			clear();
			parse(doc);
			if (winner != null) {
				var evt = document.createEvent("MouseEvents");
				evt.initMouseEvent('piratequesting:FightUpdated',false,true, window,
	   				0, 0, 0, 0, 0, false, false, false, false, 0, doc);
	
				document.dispatchEvent(evt);
			}

		}
	}
}();

piratequesting.addLoadProcess(new RegExp(piratequesting.strings.FightProcessor
						.getString("page_regex"), ""),
		piratequesting.FightProcessor.process);