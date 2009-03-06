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
		
	return /** @lends piratequesting.Bank */ {
		
		/**
		 * 
		 * @param {nsIDOMDocument}
		 *            doc
		 */
		process : function(doc) {
			var coinsnpts = doc.getElementById('coinsnpts');
			// check to see if it exists
			if (coinsnpts) {
				// the first <a> should be the points, and since it has
				// no id, we just have to hope it stays that way
				points = coinsnpts.getElementsByTagName('a')[0].firstChild.nodeValue
						.toNumber();
				coins = doc.getElementById('coinsupd').firstChild.nodeValue
						.toNumber();
				chest = doc.getElementById('bankval2').firstChild.nodeValue
						.toNumber();

				// alert("points: " + points + "\ncoins: " + coins +
				// "\nchest: " + chest);
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

		},
		deposit: function() {
			var damount = sidebar.contentDocument.getElementById("damount").value;
			if (Number(damount) !=  damount) {
createResponse(sidebar.contentDocument.getElementById("bankresult"),["Invalid Input: Not a Number"], 1, "ffaeb9");
		    } else {
				createResponse(sidebar.contentDocument.getElementById("bankresult"),["Depositing..."], 1);
				var params = "deposit=deposit&damount=" + damount;
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
				var params = "withdraw=withdraw&wamount=" + wamount;
				disable();
				piratequesting.Bank.doBanking(params);
			}
		},
		
		depositAll: function() {
			disable();
			// get the bank page to get up-to-date values
			var http = new XMLHttpRequest();
			var url = piratequesting.baseURL + "/index.php?on=bank";
			http.open("GET", url, true);
			http.onerror = function (e) {
				onError(e);
				enable();
			};
			
			ajax = http;
		
			http.onreadystatechange = function () {
				if(http.readyState == 4) {
					if (http.status == 200) {
						var regex = /name='damount' value='([0-9]+)'/;
						var tmp = regex.exec(http.responseText);
						var amt = tmp[1];
						if (amt > 0) {
							createResponse(sidebar.contentDocument.getElementById("bankresult"),["Depositing "+amt+"..."], 1);
							var params = "deposit=deposit&damount=" + amt;
							piratequesting.Bank.doBanking(params);
						} else {
							createResponse(sidebar.contentDocument.getElementById("bankresult"),["Nothing to Deposit"], 1);
							enable();
						}
					} else {
						alert("Banking failed due to error");
						enable();
					}
				}	
			}
			http.send(null);
		},
		
		doBanking: function(params) {
			var http = new XMLHttpRequest();
			var url = piratequesting.baseURL + "/index.php?on=bank";
			http.open("POST", url, true);
			ajax = http;
		
			// Send the proper header information along with the request
			http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			http.setRequestHeader("Content-length", params.length);
			http.setRequestHeader("Connection", "close");
			http.onerror = function (e) {
				onError(e);
				enable();
			}
			
			// onError;
			http.onreadystatechange = function () {
				sidebar.contentDocument.getElementById('bankmeter').setAttribute('value',	Number(sidebar.contentDocument.getElementById('bankmeter').getAttribute('value')) + 25);
				if(http.readyState == 4) {
					if (http.status == 200) {
						piratequesting.Bank.parseBankResponse(http.responseText);
					} else {
						alert("Banking failed due to error");
						enable();
					}
				}
			}
			http.send(params);
		},
		
		parseBankResponse: function(text){
			var regex = /You have (withdrawn|deposited) (\$[,0-9]+) successfully/i;
			var fregex = /(withdraw|deposit) more than you have/i;
			var url = piratequesting.baseURL + "/index.php?on=bank";
			var match;
			var fmatch;
			var result;
			match = regex.exec(text);
		
			if (match === null) {
				// failed
				fmatch = fregex.exec(text); 
				if (fmatch === null) {
					// you've done it now. fubar.
					createResponse(sidebar.contentDocument.getElementById("bankresult"), ["Invalid Response from Bank"], 1, "ffaeb9");
				} else
					createResponse(sidebar.contentDocument.getElementById("bankresult"), [fmatch[1] + ' failed'], 1,"ffaeb9");
			} else {
				createResponse(sidebar.contentDocument.getElementById("bankresult"), [match[2] + ' ' + match[1]], 1,"caff70");
				piratequesting.ProcessResponse(url,text);
				match[2] = Number(match[2].toNumber());
				chest = Number(Number(chest) - Number(((match[1] == "withdrawn") ? Number(match[2]) : -1 * Number(match[2]))));
				coins = Number(Number(coins) + Number(((match[1] == "withdrawn") ? Number(match[2]) : -1 * Number(match[2]))));
				//piratequesting.Player.publish();
				
				var coins_val, chest_val;
				if (piratequesting.sidebar) {
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
			enable();

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

var sidebar = sidebar || mainWindow.document.getElementById("sidebar");