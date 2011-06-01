var piratequesting = top.piratequesting;

piratequesting.Mug = {
	/**
	 * log-related methods
	 * 
	 * @namespace
	 * @memberOf piratequesting.Mug
	 */
	Log : {
		/**
		 * record to write to the log.<br>
		 * Note: ID and name are both recorded as names may change
		 * 
		 * @param {Integer}
		 *            id Player ID that was mugged
		 * @param {String}
		 *            name Player name that was mugged
		 * @param {Integer}
		 *            amount The amount of money mugged
		 * @param {Integer}
		 *            datetime The date/time as number of seconds since the
		 *            beginning of the epoch
		 */
		write : function(id, name, amount, datetime) {
		},
		/**
		 * clears the log
		 */
		clear : function() {
		}

	},

	/**
	 * processes the document passed by the extension Adds a countdown timer and
	 * a link to the page for mugging the player again
	 * 
	 * @param {HTMLDocument}
	 *            doc
	 */
	process : function(doc) {
		pqdump("PQ: Processing mug page\n",PQ_DEBUG_STATUS);
		try {
			var ca = doc.getElementById("contentarea");
			var user = doc.evaluate('id("contentarea")//a[starts-with(@href,"/index.php?on=profile&user=")][1]', doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			if (!user) {
				pqdump("\tNo user found. Aborting\n", PQ_DEBUG_STATUS);
				return; //probably a hand code page.
			}
			var name = user.textContent;
			pqdump("\tName: "+name+"\n",PQ_DEBUG_STATUS);
			var id = /user=([0-9]+)/.exec(user.getAttribute("href"))[1];
			var picklink = doc.createElement("a");
			picklink.setAttribute("id", "picklink");
			picklink.setAttribute("href", "/index.php?on=mug&id=" + id);
			picklink.appendChild(doc.createTextNode("Pickpocket " + name + "."));
			var mugdiv = doc.createElement("div");
			var span = doc.createElement("span");
			span.setAttribute("id", "countDownText");
			span.appendChild(doc.createTextNode("30"));
			span.setAttribute("style", "font-weight:bold;");
			
			mugdiv.appendChild(doc.createTextNode("You can pickpocket " + name + " again in "));
			mugdiv.appendChild(span);
			mugdiv.appendChild(doc.createTextNode(" seconds."));
			mugdiv.appendChild(doc.createElement("br"));
			mugdiv.appendChild(picklink);
			
			var brtags = ca.getElementsByTagName("br");
			var lbr = brtags[brtags.length - 1];
			lbr.parentNode.insertBefore(doc.createElement("br"), lbr);
			lbr.parentNode.insertBefore(mugdiv, lbr);
			lbr.parentNode.insertBefore(doc.createElement("br"), lbr);
			
			var seconds = 30;
			function timer_tick(element, seconds) {
				element.innerHTML = seconds;
			}
			var obj = new CountdownTimer(seconds, {
				callback: timer_tick.curry(span)
			});
			obj.Start();
			
			
		} catch(e) {
			dumpError(e);
		}
	}
};

piratequesting.addLoadProcess(new RegExp(piratequesting.strings.Mug.getString("page_regex"), ""),piratequesting.Mug.process);
