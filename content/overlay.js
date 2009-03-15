/*
 * Copyright (c) 2008 Jonathan Fingland
 * 
 * Permission to use, copy, modify, and distribute this software for any purpose
 * with or without fee is hereby granted, provided that the above copyright
 * notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 * OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 * PERFORMANCE OF THIS SOFTWARE.
 */
Object.extend = function(destination, source) {
	for (var property in source)
		destination[property] = source[property];
	return destination;
};

/**
 * Primary object for the extension Everything shoud fit under this namespace
 * except for utility functions
 * 
 * @namespace
 */
var piratequesting = {
	initialized : false,
	PQLoadCollection : [],
	PQResponseProcessorCollection : [],
	scripts : [],
	baseURL : "",
	_iframe : null,

	/**
	 * Database connection for the extension. Stored for re-use to cut down on repitition
	 * @type mozIStorageConnection
	 */
	DBConn : function() {

		var file = Components.classes["@mozilla.org/file/directory_service;1"]
				.getService(Components.interfaces.nsIProperties).get("ProfD",
						Components.interfaces.nsIFile);
		file.append("piratequesting.sqlite");

		var db = Components.classes["@mozilla.org/storage/service;1"]
				.getService(Components.interfaces.mozIStorageService)
				.openDatabase(file);
		return db;
	}(),

	/**
	 * collection of StringBundles for use by extension elements
	 * 
	 * @type Object
	 */
	strings : {},
	/**
	 * Preferences Branch for "extensions.piratequesting"
	 * 
	 * @type nsIPrefBranch
	 */
	prefs : Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService),

	/**
	 * Initialization for the sidebar.
	 * Ensures the database has the table needed for module loading
	 * Adds Event listener
	 */
	onLoad : function() {
		// first make sure we haven't already initialized things.
		if (!piratequesting.initialized) {
			try {
				this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
				this.baseURL = this.prefs
						.getCharPref("extensions.piratequesting.baseurl");

				// initialization code
				this.initialized = true;
				this.strings.core = document
						.getElementById("piratequesting-strings");

				if (!piratequesting.DBConn.tableExists("moduleLayout")) {
					// first run: create the layout table
					piratequesting.DBConn
							.createTable(
									'"main"."moduleLayout"',
									'"box" INTEGER NOT NULL , "position" INTEGER NOT NULL , "tab_id" VARCHAR PRIMARY KEY  NOT NULL');
					alert("Thank you for using PirateQuesting.\nYou'll probably want to start by opening the sidebar \n(Press Ctrl+Shift+E or go to the View Menu -> Sidebar -> PirateQuesting.)\nYou can add a toolbar icon by right-clicking on the Firefox toolbar and selecting \"Customize...\".\n\nFeel free to create new boxes for the tabs and drag the tabs to the new boxes.\nYour layout will automatically be saved.\n\nIf you have any problems, please let me (Gilgalad/Jonathan Fingland) know on Pirate Quest or on addons.mozilla.org");
				}

				mainWindow.getBrowser().addEventListener("DOMContentLoaded",
						piratequesting.PQPageLoad, true);

				piratequesting.loadModules();
				
			} catch (error) {
				alert(getErrorString(error));
			}

		}
	},
	addLoadProcess : function(pattern, func) {
		try {
			this.PQLoadCollection.push(new PageProcess(pattern, func));
		} catch (e) {
			alert(getErrorString(e));
		}
	},
	addResponseProcessor : function (pattern, func) {
		try {
			this.PQResponseProcessorCollection.push(new PageProcess(pattern, func));
		} catch (e) {
			alert(getErrorString(e));
		}
	},
	/**
	 * Works in a similar way to PQPageLoad except that it creates an HTML DOM Document from<br>
	 * text, and then goes through the PQLoadCollection.
	 * @param {String} url The address of the page from which the htmlText was received 
	 * @param {String} htmlText The text to be changed into an html document 
	 */
	ProcessResponse : function(url, htmlText) {
		var document = window.document;
		var rootElement = document.documentElement;

		// Create an iframe, make it hidden, and secure it against untrusted
		// content.
		var _iframe = document.createElement('iframe');
		_iframe.setAttribute("collapsed", true);
		_iframe.setAttribute("type", "content");

		// Insert the iframe into the window, creating the doc shell.
		rootElement.appendChild(_iframe);

		_iframe.docShell.allowJavascript = false;
		_iframe.docShell.allowAuth = false;
		_iframe.docShell.allowPlugins = false;
		_iframe.docShell.allowMetaRedirects = false;
		_iframe.docShell.allowSubframes = false;
		_iframe.docShell.allowImages = false;

		var doc = _iframe.contentDocument; 
		var strip = /<html[\s\S]*?>([\s\S]*?)<\/html>/i;
		if (strip.test(htmlText)) {
			doc.getElementsByTagName("html")[0].innerHTML = strip.exec(htmlText)[1];
			if (!(doc.body && (doc.body.firstChild.nodeType == 3) && ( doc.body.firstChild.nodeValue == "The server is performing the new day count resets - this will take several minutes." ))) {
				var curProc;
				//first run the standard processors 
				for (var i = 0, len = piratequesting.PQLoadCollection.length; i < len; i++) {
					curProc = piratequesting.PQLoadCollection[i];
					curProc.run(url, doc);
				}
				//then run the ajax response processors - at this time only the captcha code stuff 
				for (var i = 0, len = piratequesting.PQResponseProcessorCollection.length; i < len; i++) {
					curProc = piratequesting.PQResponseProcessorCollection[i];
					curProc.run(url, doc);
				}
			}
		}
	},
	/**
	 * Checks if the event target is a PQ page, then
	 * Cycles through the elements of PQLoadCollection and runs them on the event target document
	 * Also sets piratequesting.baseURL and sets the associated preference
	 * @param {DOMEvent} event
	 */
	PQPageLoad : function(event) {
		 /*
		 * try { alert(event.originalTarget); } catch (e) { alert(e.message); }
		 */
		if (event.originalTarget instanceof HTMLDocument) {
			var doc = event.originalTarget;
			// if it's just a frame element, then return and wait for the
			// main event to fire.
			// Of course, PQ pages don't have any frames that I'm aware
			// of... but who knows? it could change
			if (event.originalTarget.defaultView.frameElement)
				return;
			else {
				var docregex = /^http:\/\/(?:www\.|)piratequest\.net|http:\/\/76\.76\.6\.166|http:\/\/69\.72\.138\.4/;

				if (docregex.test(doc.location)) {
					var thisBase = docregex.exec(doc.location)[0];
					if (thisBase != top.piratequesting.baseURL) {
						top.piratequesting.baseURL = thisBase;
						try {
							top.piratequesting.prefs.setCharPref(
									"extensions.piratequesting.baseurl",
									top.piratequesting.baseURL);
						} catch (error) {
							alert("Getting: \n" + getErrorString(error));
						}

					}
					// we're on a piratequest page. yay!
					
					//check if it's reset time
					if (!(doc.body && (doc.body.firstChild.nodeType == 3) && ( doc.body.firstChild.nodeValue == "The server is performing the new day count resets - this will take several minutes." ))) {
					// now run all of the added test-function pairs
						var curProc;
						for (var i = 0; i < top.piratequesting.PQLoadCollection.length; i++) {
							curProc = top.piratequesting.PQLoadCollection[i];
							curProc.run(doc.location, doc);
						}
					}
				}
			}
		}
	},

	hasScript : function(scriptFile) {
		var found = false;
		for (var i = 0; ((!found) && (this.scripts.length > i)); i++) {
			if (this.scripts[i] == scriptFile)
				found = true;
		}
		return found;
	},

	addScript : function(scriptFile) {
		this.scripts.push(scriptFile);
	},

	loadScript : function(scriptFile) {
		if (this.hasScript(scriptFile))
			return;
		Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
				.getService(Components.interfaces.mozIJSSubScriptLoader)
				.loadSubScript(scriptFile);
		this.addScript(scriptFile);
	},

	loadCSS : function(cssFile) {
		var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
				.getService(Components.interfaces.nsIStyleSheetService);
		var ios = Components.classes["@mozilla.org/network/io-service;1"]
				.getService(Components.interfaces.nsIIOService);
		var uri = ios.newURI(cssFile, null, null);
		if (!sss.sheetRegistered(uri, sss.USER_SHEET))
			sss.loadAndRegisterSheet(uri, sss.USER_SHEET);

	},

	loadStrings : function(stringFile, group) {
		try {
			var nfunc = new Function("piratequesting.strings." + group
					+ " = new StringBundle('" + stringFile + "');");
			nfunc();
		} catch (e) {
			alert(getErrorString(e));
		}
	},

	loadModules : function() {

		function loadXML(file) {

			try {
				var ph = Components.classes["@mozilla.org/network/protocol;1?name=file"]
						.createInstance(Components.interfaces.nsIFileProtocolHandler);
				var modFile = ph.getURLSpecFromFile(file);
			} catch (e) {
				alert(getErrorString(e));
			}

			/**
			 * @namespace
			 */
			var xmlReq = new XMLHttpRequest();
			xmlReq.open("GET", modFile, true);

			xmlReq.onerror = function(e) {
				// onError(e);
			}

			xmlReq.onreadystatechange = function() {
				if (xmlReq.readyState == 4) {
					var xmlDoc = xmlReq.responseXML;
					try {
						var name = xmlDoc.getElementsByTagName("name")[0].firstChild.nodeValue;
						// eval("top.piratequesting." + name + "={ };");
						var nfunc = new Function("piratequesting." + name
								+ "= { };");
						nfunc();
					} catch (e) {
						alert(getErrorString(e));
					}

					try {
						var styles = xmlDoc.getElementsByTagName("style");
						for (var i = 0, style = styles[i]; i < styles.length; i++, style = styles[i]) {
							piratequesting.loadCSS(style.firstChild.nodeValue);
						}
						var stringss = xmlDoc.getElementsByTagName("strings");
						for (var i = 0, strings = stringss[i]; i < stringss.length; i++, strings = stringss[i]) {
							piratequesting.loadStrings(
									strings.firstChild.nodeValue, name);
						}
						var scripts = xmlDoc.getElementsByTagName("script");
						for (var i = 0, script = scripts[i]; i < scripts.length; i++, script = scripts[i]) {
							piratequesting
									.loadScript(script.firstChild.nodeValue);
						}
						var overlays = xmlDoc.getElementsByTagName("overlay");
						var oas, tid, tpid, overlay;
						for (var i = 0; i < overlays.length; i++) {
							overlay = overlays[i];
							oas = overlay.attributes;
							tid = oas.getNamedItem('tabid') || {
								nodeValue : null
							};
							tpid = oas.getNamedItem('tabpanelid') || {
								nodeValue : null
							};
							piratequesting.overlayRegistry.addOverlay(
									tid.nodeValue, tpid.nodeValue,
									overlay.firstChild.nodeValue);
						}
					} catch (e) {
						alert(getErrorString(e));
					}
				}
			}
			try {
				xmlReq.send(null);
			} catch (e) {
				alert(getErrorString(e));
			}
		}

		var moduleDir = Components.classes["@mozilla.org/file/local;1"]
				.createInstance(Components.interfaces.nsILocalFile);
		moduleDir
				.initWithPath(chromeToPath("chrome://piratequesting/content/modules"));
		if (moduleDir.isDirectory()) {
			var files = moduleDir.directoryEntries;
			var file;
			while (files.hasMoreElements()) {
				file = files.getNext()
						.QueryInterface(Components.interfaces.nsIFile);
				if (/\.xml$/.test(file.leafName)) {
					loadXML(file);
				}
			}
			// piratequesting.test();
		}
		if (piratequesting.sidebar) {
			piratequesting.sidebar.loadOverlays();
		}

	}

}

/*piratequesting.showContextMenu = function(event) {
	// show or hide the menuitem based on what the context menu is on
	// see http://kb.mozillazine.org/Adding_items_to_menus
	document.getElementById("context-piratequesting").hidden = gContextMenu.onImage;

}*/

/*piratequesting.onMenuItemCommand = function(e) {
	var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			.getService(Components.interfaces.nsIPromptService);
	promptService.alert(window, this.strings.core
					.getString("helloMessageTitle"),

			this.strings.core.getString("helloMessage"));
	toggleSidebar('viewPirateQuestingSidebar');

}*/
piratequesting.onToolbarButtonCommand = function(e) {
	piratequesting.onMenuItemCommand(e);
}

var mainWindow = window
		.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
		.getInterface(Components.interfaces.nsIWebNavigation)
		.QueryInterface(Components.interfaces.nsIDocShellTreeItem).rootTreeItem
		.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
		.getInterface(Components.interfaces.nsIDOMWindow);

/**
 * @namespace
 */
piratequesting.overlayRegistry = function() {
	var overlays = [];
	var index = 0;
	function overlay(tabid, tabpanelid, overlayFile) {

		var nfunc = function(tabid, tabpanelid, overlayFile) {
			var tabid = tabid;
			var tabpanelid = tabpanelid;
			var overlayFile = overlayFile;
			var added = false;

			return {
				toString : function() {
					return "tabid: " + tabid + "\ntabpanelid: " + tabpanelid
							+ "\noverlayFile: " + overlayFile;
				},
				getTabId : function() {
					return tabid;
				},
				getTabPanelId : function() {
					return tabpanelid;
				},
				getOverlayFile : function() {
					return overlayFile;
				},
				getAdded : function() {
					return added;
				},
				setAdded : function(val) {
					added = !!val; // ensure boolean
				}
			}
		}(tabid, tabpanelid, overlayFile);
		return nfunc;

	}

	return /** @lends piratequesting.overlayRegistry */{
		/**
		 * Adds Overlay based on supplied parameters
		 * 
		 * @public
		 * @param {String}
		 *            tabid
		 * @param {String}
		 *            tabpanelid
		 * @param {String}
		 *            stringFile
		 */
		addOverlay : function(tabid, tabpanelid, stringFile) {
			overlays.push(new overlay(tabid, tabpanelid, stringFile));
		},
		getOverlayByIndex : function(index) {
			return overlays[index];
		},
		getOverlayByTabId : function(tabid) {
			var ol = overlays.length;
			for (var i = 0; i < ol; i++) {
				if (overlays[i].getTabId() == tabid)
					return overlays[i];
			}
			return false;
		},
		count : function() {
			return overlays.length;
		},
		reset : function() {
			index = 0;
		},
		next : function() {
			if (index < overlays.length) {
				return overlays[index++];
			} else
				return null;
		},
		progress : function() {
			return Math.ceil(index * 100 / overlays.length);
		},
		resetAll : function() {
			// alert("restting");
			this.reset();
			var nex;
			while (nex = this.next()) {
				nex.setAdded(false);
			}
			this.reset();
		}

	}
}();