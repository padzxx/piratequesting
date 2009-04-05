var piratequesting = top.piratequesting;
var mainWindow = mainWindow
		|| window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
				.getInterface(Components.interfaces.nsIWebNavigation)
				.QueryInterface(Components.interfaces.nsIDocShellTreeItem).rootTreeItem
				.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
				.getInterface(Components.interfaces.nsIDOMWindow);
var sidebar = sidebar || mainWindow.document.getElementById("sidebar");

/*
 * try { var sbundle = new
 * StringBundle("chrome://piratequesting/locale/train.properties"); } catch
 * (error) { alert(error.message); }
 */

piratequesting.Training = function() {

	var ajax;

	function getEnergy() {
		disable();

		// this one can't be async
		// yes it can. pass the other function in as an argument

		var url = piratequesting.baseURL + "/index.php?on=train";
		var http = new XMLHttpRequest();
		http.open("GET", url, false);
		http.onerror = function(e) {
			onError(e);
		}
		ajax = http;
		// Send the proper header information along with the request
		http.setRequestHeader("Connection", "close");
		/*
		 * http.onreadystatechange = function() { if (http.readyState == 4 &&
		 * http.status == 200) { } }
		 */
		http.send(null);
		var energyex = /<li id="EnergyAttrib"><strong>Energy:<\/strong> ([,0-9]+)\/[,0-9]+/;
		var rt = http.responseText;
		http = null;
		enable();
		return ((String)(energyex.exec(rt)[1])).stripCommas();
	}

	function setChance(chance) {
		sidebar.contentDocument.getElementById("trainchance").setAttribute(
				"value", chance);
	}

	function getChance() {
		var url = piratequesting.baseURL + "/index.php?on=train";
		var http = new XMLHttpRequest();
		http.open("GET", url, true);
		http.onerror = function(e) {
			onError(e);
		}
		ajax = http;
		// Send the proper header information along with the request
		http.setRequestHeader("Connection", "close");
		http.onreadystatechange = function() {
			if (http.readyState == 4 && http.status == 200) {
				piratequesting.ProcessResponse(url, http.responseText);
				http = null;

			}
		}
		http.send(null);
	}

	function disable() {
		sidebar.contentDocument.getElementById('trngrp').setAttribute("type",
				"cover");
		sidebar.contentDocument.getElementById('trncb').setAttribute("type",
				"cbox");
		sidebar.contentDocument.getElementById('trnmeter').setAttribute(
				'value', '0');
		sidebar.contentDocument.getElementById("stramount").setAttribute(
				'disabled', 'true');
		sidebar.contentDocument.getElementById("defamount").setAttribute(
				'disabled', 'true');
		sidebar.contentDocument.getElementById("speamount").setAttribute(
				'disabled', 'true');
		sidebar.contentDocument.getElementById("train").setAttribute(
				'disabled', 'true');
		sidebar.contentDocument.getElementById("maxstr").setAttribute(
				'disabled', 'true');
		sidebar.contentDocument.getElementById("maxdef").setAttribute(
				'disabled', 'true');
		sidebar.contentDocument.getElementById("maxspe").setAttribute(
				'disabled', 'true');
	}

	function enable() {
		sidebar.contentDocument.getElementById('trngrp').setAttribute("type",
				"");
		sidebar.contentDocument.getElementById('trncb').setAttribute("type",
				"hide");
		sidebar.contentDocument.getElementById("stramount")
				.removeAttribute('disabled');
		sidebar.contentDocument.getElementById("defamount")
				.removeAttribute('disabled');
		sidebar.contentDocument.getElementById("speamount")
				.removeAttribute('disabled');
		sidebar.contentDocument.getElementById("train")
				.removeAttribute('disabled');
		sidebar.contentDocument.getElementById("maxstr")
				.removeAttribute('disabled');
		sidebar.contentDocument.getElementById("maxdef")
				.removeAttribute('disabled');
		sidebar.contentDocument.getElementById("maxspe")
				.removeAttribute('disabled');
	}

	function doTraining(params) {
		var trainresult = sidebar.contentDocument.getElementById("trainresult");
		createResponse(trainresult, new Array("Training"), 1);

		try {
			disable();
			ajax = AjaxRequest(piratequesting.baseURL + "/index.php?on=train", { 	
						protocol: "post", 
						onSuccess: enable, 
						onFailure: function() { enable(); alert('Failed to complete Training.');}, 
						onError: function() { enable(); alert('Error occurred when Training.');}, 
						onStateChange: function(http) { var sbcd = sidebar.contentDocument;	sbcd.getElementById('trnmeter').setAttribute('value',http.readyState * 25); }, 
						params: params
			});
		} catch (error) {
			alert(getErrorString(error));
		}

	}

	return {
		trainStats : function() {
			try {
			var stramount = Number(sidebar.contentDocument
					.getElementById("stramount").value);
			var defamount = Number(sidebar.contentDocument
					.getElementById("defamount").value);
			var speamount = Number(sidebar.contentDocument
					.getElementById("speamount").value);

			var stren, defen, speen;
			if ((Number(stramount) == "NaN") || (Number(defamount) == "NaN")
					|| (Number(speamount) == "NaN")) {
				createResponse("trainresult", ["Invalid Input"]);
				return;
			}
			if (sidebar.contentDocument.getElementById("peren")
					.hasAttribute("checked")) {
				var energy = getEnergy();
				// alert(energy);
				// get how much energy they want to use.... maybe they don't
				// want to use 100%? round to the nearest
				energy = Math.round(((stramount + defamount + speamount) / 100)
						* energy);
				stren = energy * (stramount / 100);
				defen = energy * (defamount / 100);
				speen = energy * (speamount / 100);

				// floor is used here because if we round it, they may go over
				var strrem = stren - Math.floor(stren);
				var defrem = defen - Math.floor(defen);
				var sperem = speen - Math.floor(speen);
				stren = Math.floor(stren);
				defen = Math.floor(defen);
				speen = Math.floor(speen);
				var rand;
				while (stren + defen + speen < energy) {
					// as long as the three are still less than the energy we
					// want to spend....
					if ((strrem > defrem) && (strrem > sperem)) {
						// strength is highest
						stren++;
						strrem = 0;
					} else if ((defrem > strrem) && (defrem > sperem)) {
						// defense is highest
						defrem++;
						defrem = 0;
					} else if ((sperem > strrem) && (sperem > defrem)) {
						// speed is highest
						sperem++;
						sperem = 0;
					} else if ((strrem == defrem) && (strrem == sperem)) {
						// all three are equal but the loop is still going....
						// this should only ever run once per train if at all
						// this will also run if they are all at zero and
						// somehow there is still energy left... shouldn't
						// happen really
						rand = Math.random();
						// fractions are used because they'll be more accurate..
						// not that it really matters that much
						if (rand > (2 / 3)) {
							stren++;
							strrem = 0;
						} else if (rand < (1 / 3)) {
							speen++;
							sperem = 0;
						} else {
							defen++;
							defrem = 0;
						}
					} else if (strrem == defrem) {
						// strength and defense are equal amounts but not speed
						rand = Math.random();
						if (rand > 0.5) {
							stren++;
							strrem = 0;
						} else {
							defen++;
							defrem = 0;
						}
					} else if (strrem == sperem) {
						// strength and speed are equal but not defense
						rand = Math.random();
						if (rand > 0.5) {
							stren++;
							strrem = 0;
						} else {
							speen++;
							sperem = 0;
						}
					} else if (defrem == sperem) {
						// defense and speed are equal but not strength
						rand = Math.random();
						if (rand > 0.5) {
							defen++;
							defrem = 0;
						} else {
							speen++;
							sperem = 0;
						}
					}
				}

			} else {
				stren = stramount;
				defen = defamount;
				speen = speamount;
			}
			// alert("strength: " + stren + "\nDefense: " +defen+"\nSpeed: "+
			// speen);
			var params = "strength=" + stren + "&defense=" + defen + "&speed="
					+ speen + "&train_x=1&train_y=1&train=Train";
			doTraining(params);
			}catch (error) { alert(getErrorString(error)); }
		},

		maxStrength : function() {

			var params = "trainstrength=All%20Strength";
			doTraining(params);
		},

		maxDefense : function() {

			var params = "traindefense=All%20Defense";
			doTraining(params);
		},

		maxSpeed : function() {

			var params = "trainspeed=All%20Speed";
			doTraining(params);
		},

		/**
		 * process to run when visiting the train page First checks for injury,
		 * then successful train, then a failure, and finally assumes there's
		 * nothing special going on
		 * 
		 * @param {nsIDOMDocument}
		 *            doc
		 */
		process : function() {
try {
			var sbcd = sidebar.contentDocument;

			if (piratequesting.sidebar
					&& sbcd.getElementById('Training_tabpanel')) {

				var data = piratequesting.TrainingProcessor.output();
				setChance(data.chance + "%");
				var trainresult = sidebar.contentDocument
						.getElementById("trainresult");
				if (data.injured) {
					createResponse(trainresult,
							new Array("You can't train while hurt."),1,"ffaeb9");
				} else if (data.failure) {
					createResponse(trainresult, new Array(data.failure),2,"ffaeb9");
				} else if (data.success.length > 0) {
					createResponse(trainresult, data.success,data.success.length,"caff70");
				} else if (data.codesrc) {
					createResponse(trainresult, new Array("Enter code and try again"),1,"ffaeb9");
					//alert(piratequesting.baseURL + data.codesrc);
				} else createResponse(trainresult, new Array(""),1);
			}
			} catch (error) { alert(getErrorString(error)); }
		},

		HandleKeyPressStats : function(e) {
			switch (e.keyCode) {
				case e.DOM_VK_RETURN :
				case e.DOM_VK_ENTER :
					piratequesting.Training.trainStats();
				case e.DOM_VK_ESCAPE :
					content.focus();
					return;
			}
		},
		abort : function() {
			ajax.abort();
			enable();
		}
	}

}();

// piratequesting.ProcessResponse(url,text);

document.addEventListener("piratequesting:TrainingUpdated", function(event) {
			piratequesting.Training.process();
		}, false);