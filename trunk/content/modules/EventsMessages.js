var piratequesting = top.piratequesting;

/**
 * 
 * @namespace
 */
piratequesting.EventsMessages = function() {
	var events = 0;
	var messages = 0;
	
	function publish() {
		var msg_num, events_num;
		if (piratequesting.sidebar) {
			if (msg_num = sidebar.contentDocument
					.getElementById('msg_num')) {
				msg_num.value = messages;
				msg_num.setAttribute('value', messages);
			}
			if (events_num = sidebar.contentDocument
					.getElementById('events_num')) {
				events_num.value = events;
				events_num.setAttribute('value', events);
			}
		}
	
	}
	
	return /** @lends piratequesting.EventsMessages */{
		/**
		 * 
		 * @param {nsIDOMDocument}
		 *            doc
		 */
		process : function(doc) {
			try {
				var me = doc.getElementById("msgevts")
				if (me) {
					me = me.getElementsByTagName("span");
					var msgs = me[0];
					var evts = me[1];
					if (msgs) {
						messages = msgs.firstChild.firstChild.nodeValue.toNumber();
					}

					if (evts) {
						events = evts.firstChild.firstChild.nodeValue.toNumber();
					}
					
				}
				publish();
			} catch (error) {
				dumpError(error);
			}
		},
		
		processRaw : function (text) {
			try{
				//expect xml doc here 
				//dump("\nProcessing Events and Messages");
					var parser=new DOMParser();
  					var doc=parser.parseFromString(text,"text/xml");
					messages = doc.evaluate("//user_messages", doc, null, XPathResult.STRING_TYPE, null).stringValue.toNumber();
					events = doc.evaluate("//user_events", doc, null, XPathResult.STRING_TYPE, null).stringValue.toNumber();
					//dump("\nEvents: " + events + "\t\tMessages: "+ messages);
				publish();
			} catch (error) {
				dumpError(error);
			}
		},
		
		openMessages: function() {
			openAndReuseOneTabPerURL(piratequesting.baseURL+'/index.php?on=mailbox');
		},
		openEvents: function () {
			openAndReuseOneTabPerURL(piratequesting.baseURL+'/index.php?on=events');
		},
		clearEvents: function () {
			var http = new XMLHttpRequest();
			var url = piratequesting.baseURL + "/index.php?on=events&action=delete_all";
			http.open("GET", url, true);
		
			// Send the proper header information along with the request
			http.setRequestHeader("Connection", "close");
			http.onerror = function (e) {
				onError(e);
			}
			
			http.onreadystatechange = function () {
				if(http.readyState == 4) {
					if (http.status == 200) {
						piratequesting.ProcessResponse(url,http.responseText);
					} else {
						("Clearing Events failed due to error");
					}
				}
			}
			http.send(null);
		}
		
	}
}();
piratequesting.addLoadProcess("", piratequesting.EventsMessages.process);

piratequesting.addRawProcessor(/index.php\?ajax=events_ajax&action=all_status_update/,piratequesting.EventsMessages.processRaw,piratequesting.EventsMessages);

if (!mainWindow)
	var mainWindow = window
			.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIWebNavigation)
			.QueryInterface(Components.interfaces.nsIDocShellTreeItem).rootTreeItem
			.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIDOMWindow);
var sidebar = mainWindow.document.getElementById("sidebar");
