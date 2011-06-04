/*******************************************************************************
 * ***** BEGIN LICENSE BLOCK Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for
 * the specific language governing rights and limitations under the License.
 *
 * The Original Code is Pirate Questing.
 *
 * The Initial Developer of the Original Code is Jonathan Fingland. Portions
 * created by the Initial Developer are Copyright (C) 2008 the Initial
 * Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or the
 * GNU Lesser General Public License Version 2.1 or later (the "LGPL"), in which
 * case the provisions of the GPL or the LGPL are applicable instead of those
 * above. If you wish to allow use of your version of this file only under the
 * terms of either the GPL or the LGPL, and not to allow others to use your
 * version of this file under the terms of the MPL, indicate your decision by
 * deleting the provisions above and replace them with the notice and other
 * provisions required by the GPL or the LGPL. If you do not delete the
 * provisions above, a recipient may use your version of this file under the
 * terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK *****
 */

/**
 * Debug Status for including all status types. Intended for filter usage, not statement level.  
 */
const PQ_DEBUG_ALL = 15;
const PQ_DEBUG_DETAILED = 7;
const PQ_DEBUG_STANDARD = 3;

const PQ_DEBUG_EXTREME = 8
const PQ_DEBUG_STATUS = 4;
const PQ_DEBUG_WARNING = 2;
const PQ_DEBUG_ERROR = 1;
const PQ_DEBUG_OFF = 0;
const PQ_DEFAULT_DEBUG_LEVEL = PQ_DEBUG_OFF; //failsafe

function get_PQDebugLevel() {
	if (top.piratequesting) {
		return top.piratequesting.prefs.getIntPref("DebugLevel");
	} else {
		return PQ_DEFAULT_DEBUG_LEVEL;
	}
}

function pqdump(message, level) {
	var debug_stmt_lvl = level || PQ_DEBUG_ALL;
	if (get_PQDebugLevel() & debug_stmt_lvl) {
		dump(message);
	}
}

function pqlog(obj, level) {
	var debug_stmt_lvl = level || PQ_DEBUG_ALL;
	if (console && console.log) {
		if (get_PQDebugLevel() & debug_stmt_lvl) {
			console.log(obj);
		}
	}
}

function debugResponse(text, length) {
	var _length = (length) ? length : 600;
	var pageitex = new RegExp("[\\s\\S]{1," + length + "}", "g");// /[\s\S]{1,600}/g;
	var pm = pageitex.exec(text);
	while (pm != null) {
		alert(pm[0]);
		pm = pageitex.exec(text);
	}
}

var pathToChrome = function(aPath) {
	var up = Components.classes['@mozilla.org/network/url-parser;1?auth=no'].getService(Components.interfaces["nsIURLParser"]);
	up.parseFileName();
	
}

var chromeToPath = function(aPath) {
	if (!aPath || !(/^chrome:/.test(aPath))) 
		return; // not a chrome url
	var rv;
	var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces["nsIIOService"]);
	var uri = ios.newURI(aPath, "UTF-8", null);
	var cr = Components.classes['@mozilla.org/chrome/chrome-registry;1'].getService(Components.interfaces["nsIChromeRegistry"]);
	rv = cr.convertChromeURL(uri).spec;
	if (/^file:/.test(rv)) 
		rv = this.urlToPath(rv);
	else 
		rv = this.urlToPath("file://" + rv);
	return rv;
}

var chromeToURL = function(aPath) {

	if (!aPath || !(/^chrome:/.test(aPath))) 
		return; // not a chrome url
	var rv;
	
	var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces["nsIIOService"]);
	var uri = ios.newURI(aPath, "UTF-8", null);
	var cr = Components.classes['@mozilla.org/chrome/chrome-registry;1'].getService(Components.interfaces["nsIChromeRegistry"]);
	rv = cr.convertChromeURL(uri).spec;
	if (!(/^file:/.test(rv))) 
		rv = "file://" + rv;
	return rv;
}
var urlToPath = function(aPath) {

	if (!aPath || !/^file:/.test(aPath)) 
		return;
	var rv;
	var ph = Components.classes["@mozilla.org/network/protocol;1?name=file"].createInstance(Components.interfaces.nsIFileProtocolHandler);
	rv = ph.getFileFromURLSpec(aPath).path;
	
	return rv;
}

var findTab = function(url) {
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	var browserEnumerator = wm.getEnumerator("navigator:browser");
	var tab = null;
	// Check each browser instance for our URL
	while (browserEnumerator.hasMoreElements()) {
		/**
		 * @type {Browser}
		 */
		var browserInstance = browserEnumerator.getNext().getBrowser();
		
		// Check each tab of this browser instance
		var numTabs = browserInstance.tabContainer.childNodes.length;
		for (var index = 0; index < numTabs; index++) {
			var currentBrowser = browserInstance.getBrowserAtIndex(index);
			if (url == currentBrowser.currentURI.spec) {
				tab = currentBrowser;
				break;
			}
		}
	}
	return tab;
}

var openAndReuseOneTabPerURL = function(url, refresh) {
	// thanks go to developer.mozilla.org for this gem of a function
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	var browserEnumerator = wm.getEnumerator("navigator:browser");
	
	// Check each browser instance for our URL
	var found = false;
	while (!found && browserEnumerator.hasMoreElements()) {
		var browserInstance = browserEnumerator.getNext().getBrowser();
		
		// Check each tab of this browser instance
		var numTabs = browserInstance.tabContainer.childNodes.length;
		for (var index = 0; index < numTabs; index++) {
			var currentBrowser = browserInstance.getBrowserAtIndex(index);
			if (url == currentBrowser.currentURI.spec) {
				// The URL is already opened. Select this tab.
				browserInstance.selectedTab = browserInstance.tabContainer.childNodes[index];
				
				// Focus *this* browser
				browserInstance.focus();
				if (refresh) 
					currentBrowser.loadURI(url);
				
				found = true;
				break;
			}
		}
	}
	
	// Our URL isn't open. Open it now.
	if (!found) {
		var recentWindow = wm.getMostRecentWindow("navigator:browser");
		if (recentWindow) {
			// Use an existing browser window
			recentWindow.gBrowser.selectedTab = recentWindow.gBrowser.addTab(url);
		}
		else {
			// No browser windows are open, so open a new one.
			// how this can ever happen in an extension is beyond me. --JF
			window.open(url);
		}
	}
}
var getLastWindow = function() {
	// thanks go to developer.mozilla.org for this gem of a function
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	var recentWindow = wm.getMostRecentWindow("navigator:browser");
	return recentWindow ? recentWindow : null;
}

function fixAmp(text) {
	var regex = /&amp;/ig;
	text = text.replace(regex, "&");
	return text;
}

function fixURL(url) {
	var regex = /\/\/|\/\.\//g;
	url = url.replace(regex, "/");
	return url;
}


/*
 * var getPQDB = (function() { var file =
 * Components.classes["@mozilla.org/file/directory_service;1"]
 * .getService(Components.interfaces.nsIProperties).get("ProfD",
 * Components.interfaces.nsIFile); file.append("piratequesting.sqlite"); var db =
 * Components.classes["@mozilla.org/storage/service;1"]
 * .getService(Components.interfaces.mozIStorageService) .openDatabase(file);
 * function openDB() { return db; } return openDB; })();
 */
function getErrorString(e) {
	if (typeof e === "string") 
		return e;
	return "Message: " + e.message + "\nFile: " + e.fileName + "  line: " + e.lineNumber;
}

function showPQSBStyle() {
	var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIWebNavigation).QueryInterface(Components.interfaces.nsIDocShellTreeItem).rootTreeItem.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindow);
	var header = mainWindow.document.getElementsByTagName('sidebarheader')[0];
	addClass(header, "piratequesting");
}

function hidePQSBStyle() {
	var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIWebNavigation).QueryInterface(Components.interfaces.nsIDocShellTreeItem).rootTreeItem.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindow);
	var header = mainWindow.document.getElementsByTagName('sidebarheader')[0];
	removeClass(header, "piratequesting");
}



function toggleSBStyle() {
	try {
		var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIWebNavigation).QueryInterface(Components.interfaces.nsIDocShellTreeItem).rootTreeItem.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindow);
		var header = mainWindow.document.getElementsByTagName('sidebarheader')[0];
		var style_regex = /piratequesting/i;
		var cur_style = header.className;
		if (style_regex.test(cur_style)) 
			header.className = cur_style.replace(style_regex, "");
		else 
			header.className = cur_style + " piratequesting";
		header.className = header.className.replace(/\s\s/, " ");
	} 
	catch (e) {
		dumpError(e);
	}
}

/**
 * Checks if the supplied element has the supplied className<br/>
 * Note: Could be more efficient to use split() and indexOf
 * @param {DOMElement} element
 * @param {String} className
 * @return {Boolean}
 */
function hasClassName(element, className) {
	if ((element instanceof XULElement) || (element instanceof HTMLElement)) {
		var cls = " " + element.className + " ";
		return (cls.indexOf(" " + className + " ") > -1)
		//return test.test(element.className);
	}
	else 
		throw "Not a valid XUL or HTML element";
}

/**Timer code from
 *  http://www.dailycoding.com/Posts/object_oriented_programming_with_javascript__timer_class.aspx
 *	-- slightly modified
 * @class
 * @property {Integer} Interval Frequency of elapse event of the timer in millisecond
 * @property {Integer} Tick Reference to function to run every Interval is elapsed
 * @property {Document} document Target document
 */
var Timer = function(callback, interval) {

	/**
	 * @type Number
	 */
	var interval = interval || 1000; // set default
	/**
	 *
	 * @param {Number} new_interval
	 */
	this.setInterval = function(new_interval) {
		interval = new_interval;
	}
	
	/**
	 * @return Number
	 */
	this.getInterval = function() {
		return interval;
	}
	
	/**
	 * @type Boolean
	 */
	var enabled = false;
	
	this.isEnabled = function() {
		return enabled;
	}
	
	
	
	/**
	 * Holds interval id of the timer
	 * @private
	 */
	var timerId = 0;
	var self = this;
	
	function func() {
		try {
			callback();
		} 
		catch (e) {
		
			pqdump("stopping in timer");
			self.Stop();
		}
		
	}
	/**
	 * To start this timer
	 */
	this.Start = function() {
		if (!enabled) {
			try {
				timerId = setInterval(func, interval);
				enabled = true;
			} 
			catch (e) {
			
				dumpError(e);
			}
		}
	};
	
	/**
	 * To stop this timer
	 */
	this.Stop = function() {
		if (enabled) {
			enable = false;
			clearInterval(timerId);
		}
	};
	
};

function CountdownTimer(seconds, options) {
	var callback = options.callback ||
	function() {
	};
	var onFinish = options.onFinish;
	var remaining = seconds;
	
	var timer = new Timer(tick, 1000);
	
	function tick() {
		remaining--;
		try {
		callback(remaining);
		} catch (e) {
			pqdump("CountdownTimer callback error \n", PQ_DEBUG_ERROR);
			dumpError(e);	
		}
		if (remaining <= 0) {
			pqdump("Stopping Timer\n");
			timer.Stop();
		}
	}
	this.Start = timer.Start;
	this.Stop = timer.Stop;
}

RegExp.escape = (function() {
	var specials = ['/', '.', '*', '+', '?', '|', '$', '(', ')', '[', ']', '{', '}', '\\'];
	
	var sRE = new RegExp('(\\' + specials.join('|\\') + ')', 'g');
	
	return function(text) {
		return text.replace(sRE, '\\$1');
	}
})();

/**
 * Does a deep search for the child.
 * @param {nsIDOMElement} element
 * @param {nsIDOMElement} child
 * @return {Boolean/Integer} Returns false if the child was not found, and returns the integer index of the immediate child node
 */
function hasChildNode(element, child) {
	var cnl = element.childNodes.length;
	var cns = element.childNodes;
	if (element == child) 
		return true;
	for (var i = 0; i < cnl; i++) {
		if (hasChildNode(cns[i], child)) 
			return i;
	}
	return false;
}

function addClass(element, className) {
	element.className = element.className || "";
	//first check if it exists
	var classes = element.className.split(" ");
	for (var i = 0; i < classes.length; i++) {
		if (classes[i] == className) 
			return;
	}
	classes.push(className);
	element.className = classes.join(" ");
}

function removeClass(element, className) {
	element.className = element.className || "";
	var classes = element.className.split(" ");
	for (var i = 0; i < classes.length; i++) {
		if (classes[i] == className) {
			classes.splice(i, 1);
			break;
		}
	}
	element.className = classes.join(" ");
}

function getChildrenByClassName(element, className) {
	var matches = [];
	if (element.nodeType != 1) 
		return matches;
	if (hasClassName(element, className)) 
		matches.push(element);
	var ec = element.childNodes;
	var ecl = ec.length
	for (var i = 0; i < ecl; i++) {
		matches = matches.concat(getChildrenByClassName(ec[i], className));
		
	}
	return matches;
}


Node.prototype.getChildrenByClassName = function(className) {
	var result = this.ownerDocument.evaluate("descendant::*[contains(concat(' ',@class,' '), ' " + className + " ')]", this, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	var matches = [];
	for (var i = 0, len = result.snapshotLength; i < len; ++i) {
		matches.push(result.snapshotItem(i));
	}
	return matches;
}




function clearResponse(box) {
	while (box.hasChildNodes()) {
		box.removeChild(box.childNodes[0]);
	}
}

function createResponse(box, elements, rows, fade) {
	// first remove old nodes
	clearResponse(box);
	
	// then insert new labels
	box.appendChild(createLabel(elements.join("\n"), rows, fade));
}


function createLabel(text, rows, fade) {
	//split to get the number of lines
	var lines = text.split("\n").length;
	
	//create and set the attributes for the textbox
	var tbox = document.createElement('textbox');
	tbox.setAttribute('class', "plain");
	tbox.setAttribute("multiline", "true");
	if (rows) 
		tbox.setAttribute("rows", rows);
	tbox.setAttribute('value', text);
	tbox.setAttribute('style', "height:");
	
	//set our *special* type attribute
	tbox.setAttribute('type', "response");
	
	//now add fade effect to indicate freshness of the data
	if (fade) 
		colorFade(tbox, "background", fade, "ebe5cb", 50, 50);
	return tbox;
}

//from http://www.leigeber.com/2008/05/javascript-color-fading-script/
// main function to process the fade request //
function colorFade(id, element, start, end, steps, speed) {
	var startrgb, endrgb, er, eg, eb, step, rint, gint, bint, step, r, g, b;
	var target;
	if (typeof id == "string") 
		target = document.getElementById(id);
	else 
		target = id;
	steps = steps || 20;
	speed = speed || 20;
	clearInterval(target.timer);
	endrgb = colorConv(end);
	er = endrgb[0];
	eg = endrgb[1];
	eb = endrgb[2];
	if (!target.r) {
		startrgb = colorConv(start);
		r = startrgb[0];
		g = startrgb[1];
		b = startrgb[2];
		target.r = r;
		target.g = g;
		target.b = b;
	}
	rint = Math.round(Math.abs(target.r - er) / steps);
	gint = Math.round(Math.abs(target.g - eg) / steps);
	bint = Math.round(Math.abs(target.b - eb) / steps);
	if (rint == 0) {
		rint = 1
	}
	if (gint == 0) {
		gint = 1
	}
	if (bint == 0) {
		bint = 1
	}
	target.step = 1;
	target.timer = setInterval(function() {
		animateColor(id, element, steps, er, eg, eb, rint, gint, bint)
	}, speed);
}

// incrementally close the gap between the two colors //
function animateColor(id, element, steps, er, eg, eb, rint, gint, bint) {
	var target;
	if (typeof id == "string") 
		target = document.getElementById(id);
	else 
		target = id;
	var color;
	if (target.step <= steps) {
		var r = target.r;
		var g = target.g;
		var b = target.b;
		if (r >= er) {
			r = r - rint;
		}
		else {
			r = parseInt(r) + parseInt(rint);
		}
		if (g >= eg) {
			g = g - gint;
		}
		else {
			g = parseInt(g) + parseInt(gint);
		}
		if (b >= eb) {
			b = b - bint;
		}
		else {
			b = parseInt(b) + parseInt(bint);
		}
		color = 'rgb(' + r + ',' + g + ',' + b + ')';
		if (element == 'background') {
			target.style.backgroundColor = color;
		}
		else 
			if (element == 'border') {
				target.style.borderColor = color;
			}
			else {
				target.style.color = color;
			}
		target.r = r;
		target.g = g;
		target.b = b;
		target.step = target.step + 1;
	}
	else {
		clearInterval(target.timer);
		color = 'rgb(' + er + ',' + eg + ',' + eb + ')';
		if (element == 'background') {
			target.style.backgroundColor = color;
		}
		else 
			if (element == 'border') {
				target.style.borderColor = color;
			}
			else {
				target.style.color = color;
			}
	}
}

// convert the color to rgb from hex //
function colorConv(color) {
	var rgb = [parseInt(color.substring(0, 2), 16), parseInt(color.substring(2, 4), 16), parseInt(color.substring(4, 6), 16)];
	return rgb;
}

/**
 *
 * @param {String} tag
 * @param {Object} attributes
 * @return {Node}
 */
Document.prototype.newElement = function(tag, attributes) {
	var element = this.createElement(tag);
	if (attributes) {
		for (attribute in attributes) {
		
			element.setAttribute(attribute, attributes[attribute]);
		}
	}
	return element;
	
}
/**
 *
 * @param {String} event_name
 */
Document.prototype.fire = function(event_name, target, detail) {
	var detail = detail || 0;
	var evt = this.createEvent("MouseEvents");
	evt.initMouseEvent(event_name, false, true, window, detail, 0, 0, 0, 0, false, false, false, false, 0, target);
	
	this.dispatchEvent(evt);
}

document.fire = Document.prototype.fire;
/**
 *
 * @param {String} tag
 * @param {Obect} attributes
 * @return {Node}
 */
Node.prototype.newElement = function(tag, attributes) {
	var element = this.ownerDocument.createElement(tag);
	if (attributes) {
		for (attribute in attributes) {
		
			element.setAttribute(attribute, attribues[attribute]);
		}
	}
	return element;
	
}

/**
 *
 * @param {Node} element
 * @return {Node}
 */
Node.prototype.insert = function(element) {
	this.appendChild(element);
	return this;
}

/**
 *
 * @param {Object} attributes
 * @return {Node}
 */
Node.prototype.setAttributes = function(attributes) {
	if (attributes) {
		for (attribute in attributes) {
		
			this.setAttribute(attribute, attributes[attribute]);
		}
	}
	return this;
}

/**
 *
 * @param {String} text
 * @return {Node}
 */
Node.prototype.update = function(text) {
	this.appendChild(this.ownerDocument.createTextNode(text));
	return this;
}

function dumpError(error) {
	pqdump("\n" + getErrorString(error) + "\n", PQ_DEBUG_ERROR);
}

if (typeof AjaxRequest == "undefined") {


	function AjaxRequest(url, options) {
		var options = options || {};
		var requestNumber = options.requestNumber || ++AjaxRequest.requestNumber;
		var http = new XMLHttpRequest();
		var protocol = (options.protocol || "get").toLowerCase();
		var params = options.params;
		var async = (options.async === false) ? false : true;
		var onFailure = options.onFailure ||
		function() {
			pqdump('\nAjax request to ' + url + ' failed.\n');
		};
		var onSuccess = options.onSuccess ||
		function() {
			pqdump('\nAjax request to ' + url + ' succeeded.\n');
		};
		var onStateChange = options.onStateChange;
		var proc = !!options.proc
		
		/*a note on the follow and redirect stuff. 
		 * Follow means I should respect Location header. 
		 * isRedirect is used to modify the request and params used. 
		 * 		params are still carried forward so that the processor knows how to handle it, 
		 * 		but the method is always get, and the params used in the request come from the location redirect 
		*/
		var follow = (!!options.follow) || false;
		var isRedirect = (!!options.isRedirect) || false;
		
		if (protocol == "get") {
			if (url.indexOf("?") != -1) { //has query component
				url += "&" + params; 
			} else {
				url += "?" + params;
			}
		}
		
		http.open(protocol, url, async);
		http.setRequestHeader("Cache-Control", "no-cache");
		if (protocol == "post") {
			http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			http.setRequestHeader("Content-length", params.length);
			http.setRequestHeader("Connection", "close");
		}
		//http.onerror = options.onError;
		http.onreadystatechange = function() {
			if (onStateChange) 
				onStateChange(http, requestNumber);
			if (http.readyState == 4) {
				//uncomment the next line to dump all headers from the request
				//http.channel.visitResponseHeaders(HeaderVisitor);
				if (piratequesting.ACCEPTED_STATUS.indexOf(http.status) != -1) {
					pqdump("Ajax operating...\n")
					
					if (follow && http.getResponseHeader("Location")) {
						var new_url = http.getResponseHeader("Location");
						pqdump("\tfollowing redirect on ajax to " + new_url + "\n");
						
						var new_opts = {
							requestNumber: requestNumber,
							protocol: protocol,
							params: params,
							async:async,
							onFailure: onFailure,
							onSuccess: onSuccess,
							onStateChange: onStateChange,
							proc:proc,
							follow: follow,
							isRedirect: true
						}
						AjaxRequest(new_opts);
					}
					else {
						try {
							if (params) {
								params = params.parseQuery();
							}
							
							if (proc) {
								pqdump("Processing Response...\n", PQ_DEBUG_STATUS);
								piratequesting.ProcessResponse(url, http.responseText, requestNumber, Date.parse(http.getResponseHeader("Date"), params));
							}
						} 
						catch (e) {
						
							pqdump("Is it me?");
							dumpError(e)
						}
						try {
							onSuccess(http, requestNumber);
						} 
						catch (e) {
						
							pqdump("Failure in AJAX onSuccess");
							dumpError(e)
						}
					}
				}
				else {
					try {
						onFailure(http, requestNumber);
					} 
					catch (e) {
						dumpError(e)
					}
				}
			}
		}
		http.send(params);
		return http;
	}
	
	
	AjaxRequest.requestNumber = 0;
	
}

/**
 * From PrototypeJS.org Prototype Javascript framework.
 */
Function.prototype.bind = function() {
	if (arguments.length < 1) 
		return this;
	var __method = this, args = Array.prototype.slice.call(arguments, 0), object = args.shift();
	return function() {
		var largs = Array.prototype.slice.call(arguments, 0);
		return __method.apply(object, args.concat(largs));
	}
}

/**
 * From PrototypeJS.org Prototype Javascript framework.
 */
Function.prototype.curry = function() {
	if (arguments.length < 1) 
		return this;
	var __method = this, args = Array.prototype.slice.call(arguments, 0);
	return function() {
		var largs = Array.prototype.slice.call(arguments, 0);
		return __method.apply(window, args.concat(largs));
	}
}

/**
 * Implements the nsIHeaderVisitor Interface
 */
var HeaderVisitor = function() {
	return {
		visitHeader: function(aHeader, aValue) {
			pqdump(aHeader + ": " + aValue + "\n");
		}
	}
}();

function notifyObservers(aSubject, aTopic, data) {
	Components.classes["@mozilla.org/observer-service;1"]
	          .getService(Components.interfaces.nsIObserverService)
	          .notifyObservers(aSubject, aTopic, data);
}

