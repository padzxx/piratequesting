netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect")

/**
 * drag and drop observation methods for tabboxes All methods for compliance
 * with methods in chrome://global/content/nsDragAndDrop.js
 * @namespace
 * 
 */
var tbObserver = {
	/**
	 * Compliance with nsDragAndDrop in chrome://global/content/nsDragAndDrop.js
	 * called from startDrag() Note: action is defined in nsDragAndDrop, and
	 * doesn't have much meaning here anyways. It's been left in just in case it
	 * may be useful later.
	 * 
	 * @methodOf tbObserver
	 * 
	 * @param {DOMEvent} event
	 * @param {Object} transferData { data : null }
	 * @param {Integer} action Constants from nsIDragService e.g. DRAGDROP_ACTION_MOVE
	 */
	onDragStart : function(event, transferData, action) {
		/**
		 * id of the event target
		 * @type String
		 */
		var txt = event.target.getAttribute("id");
		/**
		 * @fieldOf transferData
		 * @type TransferData
		 */
		transferData.data = new TransferData();
		transferData.data.addDataForFlavour("text/unicode", txt);
	},
	/**
	 * Compliance with nsDragAndDrop in chrome://global/content/nsDragAndDrop.js
	 * called from dragOver() and drop()
	 * @methodOf tbObserver
	 * 
	 * @return {FlavourSet}
	 */
	getSupportedFlavours : function() {
		var flavours = new FlavourSet();
		flavours.appendFlavour("text/unicode");
		return flavours;
	},

	/**
	 * Compliance with nsDragAndDrop in chrome://global/content/nsDragAndDrop.js
	 * @methodOf tbObserver
	 * @param {DOMEvent} event
	 * @param {nsIDragSession} session
	 */
	onDragExit : function(event, session) {
		/**
		 * The tabbox element of our module which fired the event
		 * @type XULElement
		 */
		var tb = event.target;
		while ((tb.tagName != 'tabbox') || (!hasClassName(tb, 'moduleBox')))
			tb = tb.parentNode;

		tb.style.backgroundPosition = "-100px 0px";
	},

	/**
	 * @methodOf tbObserver
	 * @param {DOMEvent} event
	 * @param {Flavour} flavour
	 * @param {nsIDragSession} session
	 */
	onDragOver : function(event, flavour, session) {
		/**
		 * The tabbox element of our module which fired the event
		 * @type XULElement
		 */
		var tb = event.target;
		while ((tb.tagName != 'tabbox') || (!hasClassName(tb, 'moduleBox')))
			tb = tb.parentNode;

		var tabs = tb._tabs.getElementsByTagName("tab");
		var str = "";
		var tab;
		var x = event.pageX;
		var before = false;
		var beforeElem = null;

		for (var i = 0; i < tabs.length; i++) {
			tab = tabs[i];
			if (!tab.getBoundingClientRect)
				break;
			beforeElem = tab;

			if (x < (tab.getBoundingClientRect().left + ((tab
					.getBoundingClientRect().right - tab
					.getBoundingClientRect().left) / 2))) {
				before = true;
				break;
			}
		}

		if (before) {
			tb.style.backgroundPosition = (beforeElem.getBoundingClientRect().left - 10)
					+ "px 0px";
		} else if (beforeElem) {
			tb.style.backgroundPosition = (beforeElem.getBoundingClientRect().right - 10)
					+ "px 0px";
		} else {
			tb.style.backgroundPosition = (tb.getBoundingClientRect().left - 5)
					+ "px 0px";
		}
	},

	/**
	 * @methodOf tbObserver
	 * @param {DOMEvent} event
	 * @param {Object} dropdata 
	 * @param {nsIDragSession} session
	 */
	onDrop : function(event, dropdata, session) {
		if (dropdata.data != "") {
			/**
			 * The tabbox element of our module which fired the event
			 * @type XULElement
			 */
			var tb = event.target;
			while ((tb.tagName != 'tabbox') || (!hasClassName(tb, 'moduleBox')))
				tb = tb.parentNode;

			tb.style.backgroundPosition = "-100px 0px";
			
			/**
			 * Array of tabs (childNodes of _tabs)
			 * @type Array 
			 */
			var tabs = tb._tabs.getElementsByTagName("tab");
			var before = false;
			var beforeElem;
			/**
			 * @type XULElement
			 */
			var tab;
			var x = event.pageX;
			for (var i = 0; i < tabs.length; i++) {
				tab = tabs[i];
				if (!tab.getBoundingClientRect)
					break;
				beforeElem = tab;

				if (x < (tab.getBoundingClientRect().left + ((tab
						.getBoundingClientRect().right - tab
						.getBoundingClientRect().left) / 2))) {
					before = true;
					break;
				}
			}
			tab = session.sourceNode;
			var tabpanel = document.getElementById(tab.linkedPanel);
			var tpp = tab.parentNode.parentNode;

			/**
			 * 
			 */
			var neighbour =  tab.previousSibling || tab.nextSibling;

			if (neighbour && (tpp != tb)) {
				if (before) {
					tb._tabs.insertBefore(tab, beforeElem);
				} else {
					tb._tabs.insertBefore(tab, tb._tabs.getElementsByTagName('spacer')[0]);
				}
				tb.tabpanels.appendChild(tabpanel);
				tab.control.selectedIndex = tab.control.getIndexOfItem(tab);
				tpp.tabpanels.selectedPanel = document
						.getElementById(neighbour.linkedPanel);
				tpp.selectedIndex = neighbour.parentNode.getIndexOfItem(neighbour);

			} else {
				if (before) {
					tb._tabs.insertBefore(tab, beforeElem);
				} else {
					tb._tabs.insertBefore(tab, tb._tabs.getElementsByTagName('spacer')[0]);
				}
				tb.tabpanels.appendChild(tabpanel);
				tab.control.selectedIndex = tab.control.getIndexOfItem(tab);

			}

			var len = tb._tabs.childNodes.length;
			for (var i = 0; i < len; i++) {
				tb._tabs.appendChild(tb._tabs.firstChild);
			}
			var tbs = tb._tabs.getElementsByTagName('tab');
			if (tbs.length > 0) {
				addClass(tb._tabs, "hideControls");
			}
			var tps = tpp._tabs.getElementsByTagName('tab');
			if (tps.length == 0) {
				removeClass(tpp._tabs, "hideControls");
			}	
			piratequesting.sidebar.saveLayout();
		}
	}
};
