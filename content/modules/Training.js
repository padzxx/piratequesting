var piratequesting = top.piratequesting;
var mainWindow = mainWindow
		|| window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
				.getInterface(Components.interfaces.nsIWebNavigation)
				.QueryInterface(Components.interfaces.nsIDocShellTreeItem).rootTreeItem
				.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
				.getInterface(Components.interfaces.nsIDOMWindow);
var sidebar = sidebar || mainWindow.document.getElementById("sidebar");

piratequesting.Training = function() {

	var ajax;

	function getEnergy() {
		var energy = 0;
		if (piratequesting.Player) {
			energy = piratequesting.Player.getStat("energy").getCurrent();
		
		}
		else {
		
			disable();
			
			// this one can't be async
			//TODO yes it can. pass the other function in as an argument
			var energy, doc;
			var url = piratequesting.baseURL + "/index.php?ajax=events_ajax&action=all_status_update";
			ajax = AjaxRequest(url, {
				protocol: "get",
				onSuccess: function(http){
					enable();
					doc = http.responseXML;
				},
				onFailure: function(){
					enable();
					dumpError('Failed to get energy data.');
				},
				onError: function(){
					enable();
					dumpError('Error occurred when getting energy information.');
				},
				onStateChange: function(http){
					var sbcd = sidebar.contentDocument;
					sbcd.getElementById('trnmeter').setAttribute('value', http.readyState * 25);
				},
				params: params,
				async: false
			});
			
			energy = doc.evaluate("//energy", doc, null, XPathResult.STRING_TYPE, null).stringValue.toNumber();
			
			enable();
		}
		return energy;
	}

	function setChance(chance) {
		sidebar.contentDocument.getElementById("trainchance").setAttribute(
				"value", chance);
	}

	function getChance() {
		var url = piratequesting.baseURL + "/index.php?on=train";
		
			
		ajax = new AjaxRequest(url,{
			protocol:"get",
			proc:true
		});
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
			if (piratequesting.baseTheme == piratequesting.CLASSIC_THEME) {
				var url = piratequesting.baseURL + "/index.php?on=train";
				var proc = true;
			} else if (piratequesting.baseTheme == piratequesting.DEFAULT_THEME) {
				var url = piratequesting.baseURL + "/index.php?ajax=train";
				var proc = false;
				params = params + "&key=" + piratequesting.TrainingProcessor.getKey();
				
				
			}	
			disable();
			ajax = AjaxRequest(url, {
				protocol: "post",
				proc: proc,
				onSuccess: enable,
				onFailure: function(){
					enable();
					dumpError('Failed to complete Training.');
				},
				onError: function(){
					enable();
					dumpError('Error occurred when Training.');
				},
				onStateChange: function(http){
					var sbcd = sidebar.contentDocument;
					sbcd.getElementById('trnmeter').setAttribute('value', http.readyState * 25);
				},
				params: params
			});
			
			 
		}
		catch (error) {
			dumpErro(error);
		}
	
	}
	
	function trainPC(stramount,defamount,speamount) {
		pqdump("PQ: Sending Training Request\n",PQ_DEBUG_STATUS);
		var energy = getEnergy();
		
		// alert(energy);
		// get how much energy they want to use.... maybe they don't
		// want to use 100%? round to the nearest
		energy = Math.round(((stramount + defamount + speamount) / 100)
				* energy);
		stren = energy * (stramount / 100);
		defen = energy * (defamount / 100);
		speen = energy * (speamount / 100);
		pqdump("\tEnergy being spent:\n",PQ_DEBUG_EXTREME);
		pqdump("\t\tStrength: " + stren + "\n",PQ_DEBUG_EXTREME);
		pqdump("\t\tDefense: " + defen + "\n",PQ_DEBUG_EXTREME);
		pqdump("\t\tSpeed: " + speen + "\n",PQ_DEBUG_EXTREME);
		
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
		trainVal(stren,defen,speen);
	}
	
	function trainVal(stren,defen,speen) {
		var params = "strength=" + stren + "&defense=" + defen + "&speed="
					+ speen + "&train_x=1&train_y=1&train=Train";
		doTraining(params);
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
				trainPC(stramount,defamount,speamount);
			} else {
				trainVal(stramount,defamount,speamount);
			}
			// alert("strength: " + stren + "\nDefense: " +defen+"\nSpeed: "+
			// speen);
			
			}catch (error) { dumpError(error); }
		},

		maxStrength : function() {
			if (piratequesting.baseTheme == piratequesting.CLASSIC_THEME) {
				var params = "trainstrength=All%20Strength";
				doTraining(params);
			} else if (piratequesting.baseTheme == piratequesting.DEFAULT_THEME) {
				trainPC(100,0,0);
			}
			
		},

		maxDefense : function() {
					if (piratequesting.baseTheme == piratequesting.CLASSIC_THEME) {
				var params = "traindefense=All%20Defense";
				doTraining(params);
			} else if (piratequesting.baseTheme == piratequesting.DEFAULT_THEME) {
				trainPC(0,100,0);
			}
		},

		maxSpeed : function() {
			if (piratequesting.baseTheme == piratequesting.CLASSIC_THEME) {
				var params = "trainspeed=All%20Speed";
				doTraining(params);
			} else if (piratequesting.baseTheme == piratequesting.DEFAULT_THEME) {
				trainPC(0,0,100);
			}
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
			} catch (error) { dumpError(error); }
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

document.addEventListener("piratequesting:TrainingUpdated", function(event) {piratequesting.Training.process();	}, false);