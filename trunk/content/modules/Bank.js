var piratequesting = top.piratequesting;

/**
 * 
 * @namespace
 */
piratequesting.Bank = function() {
	/**
	 * Player's in-hand money
	 * 
	 * @private
	 * @type Integer
	 */
	var coins = 0;
	/**
	 * Player's money in their treasure chest
	 * 
	 * @private
	 * @type Integer
	 */
	var chest = 0;
	/**
	 * Player's points
	 * 
	 * @private
	 * @type Integer
	 */
	var points = 0;

	var ajax;
	
	function disable() {
			sidebar.contentDocument.getElementById('bankbox').setAttribute("type","cover");
			sidebar.contentDocument.getElementById('bankcb').setAttribute("type","cbox");
			sidebar.contentDocument.getElementById('bankmeter').setAttribute('value','0');
			sidebar.contentDocument.getElementById("wamount").setAttribute('disabled','true');
			sidebar.contentDocument.getElementById("damount").setAttribute('disabled','true');
			sidebar.contentDocument.getElementById("depall").setAttribute('disabled','true');
		}
		
		function enable() {
			sidebar.contentDocument.getElementById('bankbox').setAttribute("type","");
			sidebar.contentDocument.getElementById('bankcb').setAttribute("type","hide");
			sidebar.contentDocument.getElementById("depall").removeAttribute('disabled');
			sidebar.contentDocument.getElementById("wamount").removeAttribute('disabled');
			sidebar.contentDocument.getElementById("damount").removeAttribute('disabled');
			sidebar.contentDocument.getElementById("wamount").value='';
			sidebar.contentDocument.getElementById("damount").value='';
		}
		
	function publish() {
		var points_val, coins_val, chest_val;
		if (piratequesting.sidebar) {
			if (points_val = sidebar.contentDocument
					.getElementById('points_val')) {
				points_val.value = points;
				points_val.setAttribute('value', points);
			}
			if (coins_val = sidebar.contentDocument
					.getElementById('coins_val')) {
				coins_val.value = '$' + String(coins).addCommas();
				coins_val.setAttribute('value', '$' + String(coins).addCommas());
			}
			if (chest_val = sidebar.contentDocument
					.getElementById('chest_val')) {
				chest_val.value = '$' + String(chest).addCommas();
				chest_val.setAttribute('value', '$' + String(chest).addCommas());
			}
		}
	}
		
	return /** @lends piratequesting.Bank */ {
		

		getCoins: function() {
			return coins;
		},
		getChest:function() {
			return chest;
		},
		getPoints: function() {
			return points;
		},
		
		/**
		 * 
		 * @param {nsIDOMDocument}
		 *            doc
		 */
		process : function(doc) {
			pqdump("\nPQ: Processing Bank info\n", PQ_DEBUG_STATUS);
			
			var coinsnpts = doc.getElementById('coinsnpts');
			// check to see if it exists
			if (coinsnpts) {
				points = doc.getElementById('pointsupd').firstChild.nodeValue
						.toNumber();
				pqdump("\tPoints: " + points + "\n", PQ_DEBUG_EXTREME);
				coins = doc.getElementById('coinsupd').firstChild.nodeValue
						.toNumber();
				pqdump("\tCoins: " + coins + "\n", PQ_DEBUG_EXTREME);
				chest = doc.getElementById('bankval2').firstChild.nodeValue
						.toNumber();
				pqdump("\tChest: " + chest + "\n", PQ_DEBUG_EXTREME);

				document.fire("piratequesting:BankUpdated");
				publish();						
			}

		},
		
		processRaw: function (text) {
			try {
				if (text) {
					var response_object = JSON.parse(text);
					response_object = toNumberSet(response_object);
					
					coins = response_object.user_cash.toNumber();
					points = response_object.user_points.toNumber();
					
					publish();
					document.fire("piratequesting:BankUpdated");
				}
			} 
			catch (error) {
				dumpError(error);
			}
		},
		deposit: function() {
			var damount = sidebar.contentDocument.getElementById("damount").value;
			if (Number(damount) !=  damount) {
				createResponse(sidebar.contentDocument.getElementById("bankresult"),["Invalid Input: Not a Number"], 1, "ffaeb9");
		    } else {
				createResponse(sidebar.contentDocument.getElementById("bankresult"),["Depositing..."], 1);
				var params = "act=deposit&amt=" + damount;
				disable();
				piratequesting.Bank.doBanking(params);
		    }
		},
		
		withdraw: function() {
			var wamount = sidebar.contentDocument.getElementById("wamount").value;
			if (Number(wamount) !=  wamount) {
				createResponse(sidebar.contentDocument.getElementById("bankresult"),["Invalid Input: Not a Number"], 1, "ffaeb9");
			} else {
				createResponse(sidebar.contentDocument.getElementById("bankresult"),["Withdrawing..."], 1);
				var params = "act=withdraw&amt=" + wamount;
				disable();
				piratequesting.Bank.doBanking(params);
			}
		},
		
		depositAll: function() {
			disable();
			
			if (!piratequesting.Player) {
				pqdump("PQ: Player component not loaded! Cannot deposit all funds without info.");
				return;
			}
			
			piratequesting.Player.update({
				onFailure:function() {
					enable()
				},
				onError: function(e) {
					dumpError(e);
					enable();
				},
				onSuccess: function() {
					var amt = piratequesting.Bank.getCoins();
					if (amt > 0) {
						createResponse(sidebar.contentDocument.getElementById("bankresult"),["Depositing "+amt+"..."], 1);
						var params = "act=deposit&amt=" + amt;
						piratequesting.Bank.doBanking(params);
					} else {
						createResponse(sidebar.contentDocument.getElementById("bankresult"),["Nothing to Deposit"], 1);
						enable();
					}
				}
			});
			
		},
		
		doBanking: function(params) {
			
			var url = piratequesting.baseURL + "/index.php?ajax=bank";
			
			ajax = new AjaxRequest(url,{
				protocol: "get",
				params:params,
				onError:function (e) {
					onError(e);
					enable();
				},
				onFailure: enable,
				onSuccess: enable,
				onStateChange: function () {
					sidebar.contentDocument.getElementById('bankmeter').setAttribute('value',	Number(sidebar.contentDocument.getElementById('bankmeter').getAttribute('value')) + 25);
				}
			});
		},
		
		processResponse: function (text) {
			//responses look like:
			//0::826988::You have deposited $71 successfully.::$0
			//You can't deposit more than you have.
			//Invalid input.
			
			if (text) { //we got some response
				//the only valid response is a double colon delimited string.. 
				var parts = text.split("::");
				//failure will only have one element
				if (parts.length < 2) {
					createResponse(sidebar.contentDocument.getElementById("bankresult"), [text], 1, "ffaeb9");
				} else {
					coins = parts[0];
					chest = parts[1];
					var match = /withdrawn|deposited/.exec(parts[2]);
					var amt = /\$[\d,]+/.exec(parts[2]);
					if (match) {
						createResponse(sidebar.contentDocument.getElementById("bankresult"), [ amt[0] + " " + match[0]], 1, "caff70");
					} else {
						createResponse(sidebar.contentDocument.getElementById("bankresult"), ["Banking Error"], 1, "ffaeb9");
					}
					publish();
				}
			}
		},				
		
		HandleKeyPressWithdraw: function(e) {
		  switch (e.keyCode) {
		    case e.DOM_VK_RETURN: 
		    case e.DOM_VK_ENTER:
				piratequesting.Bank.withdraw();
		    case e.DOM_VK_ESCAPE:
		      content.focus();
		      return;
		  }
		},
		
		HandleKeyPressDeposit: function(e) {
		  switch (e.keyCode) {
		    case e.DOM_VK_RETURN: 
		    case e.DOM_VK_ENTER:   
				piratequesting.Bank.deposit();
		    case e.DOM_VK_ESCAPE:
		      content.focus();
		      return;
		  }
		},
		abort:function() {
			ajax.abort();
			enable();
		}
		
	}
}();
piratequesting.addLoadProcess("", piratequesting.Bank.process);
var mainWindow = mainWindow || window
			.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIWebNavigation)
			.QueryInterface(Components.interfaces.nsIDocShellTreeItem).rootTreeItem
			.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIDOMWindow);

piratequesting.addRawProcessor(/index.php\?ajax=(events_ajax&action=all_status_update|train|items&json)/, piratequesting.Bank.processRaw, piratequesting.Bank);
piratequesting.addRawProcessor(/index.php\?ajax=bank/, piratequesting.Bank.processResponse, piratequesting.Bank);

var sidebar = sidebar || mainWindow.document.getElementById("sidebar");