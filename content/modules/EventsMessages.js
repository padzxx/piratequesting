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
					//me = me.getElementsByTagName("span");
					messages = doc.evaluate("//div[@class='message']", me, null, XPathResult.STRING_TYPE, null).stringValue.toNumber();
					events = doc.evaluate("//div[@class='events']", me, null, XPathResult.STRING_TYPE, null).stringValue.toNumber();
				}
				publish();
			} catch (error) {
				dumpError(error);
			}
		},
		
		processRaw : function (text) {
			try{
				if (text) {
					var response_object = JSON.parse(text);
					response_object = toNumberSet(response_object);
					
					messages = response_object.user_messages;
					events = response_object.user_events;
					
					pqdump("Found " + messages + " messages and "+events + " events.\n", PQ_DEBUG_EXTREME);
					
					publish();
				}
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
			
			var url = piratequesting.baseURL + "/index.php?on=events&action=delete_all";
			
			var ajax = new AjaxRequest(url,{
				protocol:"get",
				proc:true
			});
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
