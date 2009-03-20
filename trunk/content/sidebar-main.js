var piratequesting = top.piratequesting;
var mainWindow = mainWindow || window
		.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
		.getInterface(Components.interfaces.nsIWebNavigation)
		.QueryInterface(Components.interfaces.nsIDocShellTreeItem).rootTreeItem
		.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
		.getInterface(Components.interfaces.nsIDOMWindow);

/**
 * Contains sidebar related methods
 * 
 * @namespace
 */
piratequesting.sidebar = {
	moduleBoxes : [],
	moduleItems : [],
	loaded:false,
	
	_element : null,
	load : function(event) {
		piratequesting.sidebar.strings = document.getElementById('piratequesting-sidebar-strings');
		piratequesting.sidebar._element = document.getElementById("piratequesting-sidebar");
	},
	getElement : function() {
		return piratequesting.sidebar._element;
	},
	addTabbox: function() {
		var ptb = sidebar.contentDocument.getElementById('plusTabboxBox');
		var mc = sidebar.contentDocument.getElementById('moduleContainer');
		var mb = piratequesting.sidebar.moduleBoxes;
		var newtb = new piratequesting.sidebar.Tabbox();
		mb.push(newtb);
		mc.insertBefore(newtb.getElement(), ptb);
	},
	removeTabbox: function(tabbox) {
		var mb = piratequesting.sidebar.moduleBoxes;
		var mbl = mb.length;
		for (var i =0; i< mbl; i++) {
			if (mb[i].getElement() == tabbox) { 
				mb.splice(i,1)
				break;
			}
		}
		var mc = sidebar.contentDocument.getElementById("moduleContainer");
		mc.removeChild(tabbox);
		piratequesting.sidebar.saveLayout();
	},

	/**
	 * Loads the overlays from the OverlayRegistry and database<br>
	 * The database is used to position the modules
	 * @param {nsIObserver} overlayObserver
	 */
	loadOverlays: function (overlayObserver) {
		if (piratequesting.sidebar.loaded) return;
		piratequesting.sidebar.loaded = true;
		overlayObserver = overlayObserver || observer;
		try {
			var pqor = piratequesting.overlayRegistry;
			var pqsb = piratequesting.sidebar;
			pqor.reset();
			var nex;
			while (nex=pqor.next()) {
				nex.added=false;
			}
			pqor.reset();
			//piratequesting.overlayRegistry.resetAll();
			var dbconn=piratequesting.DBConn;
			//First get the number of boxes we need for this layout
			var stmt = piratequesting.DBConn.createStatement("SELECT max(box) from moduleLayout");
			stmt.executeStep();
    		var numboxes = stmt.getInt32(0);
    		stmt.reset();
			//if (numboxes <= 0) 	numboxes = 1;
			
			var mb = pqsb.moduleBoxes;
			//now create the boxes we need
			for(var i=0; i<=numboxes; i++) {
				pqsb.addTabbox();

			}
			
			//next loop through the module information and create the tabs in the appropriate order
			stmt = dbconn.createStatement("SELECT box, position, tab_id from moduleLayout ORDER BY box ASC, position DESC");
			var box, position, tab_id, tabpanel_id, ti, co,ci;
			while (stmt.executeStep()) {
				box = stmt.getInt32(0);
				position = stmt.getInt32(1);
				tab_id = stmt.getString(2);
				co = pqor.getOverlayByTabId(tab_id)
				//if the overlay we're looking for still exists, then prepare for it 
				if (co) { 
					ti = new pqsb.TabItem(tab_id,co.getTabPanelId());
					pqsb.moduleItems.push(ti);
					mb[box].tabpanels.appendChild(ti.tabpanel);
					mb[box].tabs.insertBefore(ti.tab, mb[box].tabs.firstChild);
					co.added = true;
					addClass(ti.tab.parentNode,"hideControls");
				} 
			}
			stmt.reset();
			
			//now go through all of the modules and look for ones that haven't been added
			//then add them to the end of the first module box
			while (co = pqor.next()) {
				if ((co.getTabId()) && (!document.getElementById(co.getTabId()))) {
					ti = new pqsb.TabItem(co.getTabId(),co.getTabPanelId());
					pqsb.moduleItems.push(ti);
					mb[0].tabs.insertBefore(ti.tab,mb[0].tabs.firstChild);
					mb[0].tabpanels.appendChild(ti.tabpanel);
					co.setAdded(true);
					ci = document.getElementById(co.getTabId());
					addClass(ci.parentNode,"hideControls");
				}
			}
			//reset the internal counter so the observer can loop through as well
			pqor.reset();
			//do that magical addition
			overlayObserver.observe(null,"xul-overlay-merged", null);
		} catch (error) { alert(getErrorString(error)); }
	},
	
	/**
	 * Saves current layout to the database
	 */
	saveLayout: function () {
		var dbconn=piratequesting.DBConn;
		
		//Delete all of the records from the table
		dbconn.executeSimpleSQL('DELETE FROM "main"."moduleLayout"');
		var sls = dbconn.createStatement('INSERT INTO "main"."moduleLayout" ("box","position","tab_id") VALUES (?1, ?2, ?3)');
		//loop through all of the tabboxes, check if they have the right class, 
		//then loop through all of _their_ tabs' tabs and add each to the db
		dbconn.beginTransaction();
		
		var mc = document.getElementById("moduleContainer");
		var tbs = mc.getElementsByClassName("moduleBox");
		var tabs;
		var tabsl;
		var tbsl = tbs.length;
		for (var i = 0; i < tbsl; i++) {
			tabs = tbs[i].tabs.getElementsByTagName("tab");
			tabsl = tabs.length;
			for (var j =0; j < tabsl; j++ ) {
				sls.bindInt32Parameter(0, i); // box
				sls.bindInt32Parameter(1, j); // position
				sls.bindUTF8StringParameter(2, tabs[j].getAttribute("id")); // tab_id
				sls.execute();
			}
	
		}
		
		if (dbconn.transactionInProgress)
			dbconn.commitTransaction();
			
		
	}
}


var sidebar = mainWindow.document.getElementById("sidebar");
sidebar.contentWindow.addEventListener("load", piratequesting.sidebar.load,
		false);

/**
 * For creating new tabboxes (and tracking them) in the sidebar
 * 
 * @class
 * 
 */
piratequesting.sidebar.Tabbox = function() {
	try {
	this.tabs = document.createElement('tabs')
	this.tabs.className = 'tabList';
	var spacer = document.createElement("spacer");
	spacer.flex = "100";
	
	this.tabs.appendChild(spacer);
	
	var removeBtn = document.createElement("toolbarbutton");
	removeBtn.addEventListener("click", function (event) { var me = event.target; piratequesting.sidebar.removeTabbox(me.parentNode.parentNode); },false);
	this.tabs.appendChild(removeBtn);
	
	this.tabpanels = document.createElement('tabpanels');
	this.tabpanels.flex="1";
	var _element = document.createElement('tabbox');
	_element.className = 'moduleBox';
	_element.addEventListener("dragover", function (event) { nsDragAndDrop.dragOver(event, tbObserver); }, false);
	_element.addEventListener("dragdrop", function (event) { nsDragAndDrop.drop(event, tbObserver); }, false);
	_element.addEventListener("dragexit", function (event) { nsDragAndDrop.dragExit(event, tbObserver); }, false);
	_element.appendChild(this.tabs);
	//this.tabs.parent = this.tabs._tabbox = _element
	_element.appendChild(this.tabpanels);
	
	this.getElement = function() {
			return _element;

		}
	} catch (error) { alert(getErrorString(error)); }
	
}


/**
 * For creating the module panels and tabs
 * 
 * @class
 */
piratequesting.sidebar.TabItem = function(tabid,tabpanelid) {
	this.tabpanel = document.createElement('tabpanel');
	this.tabpanel.setAttribute('id', tabpanelid);
	this.tab = document.createElement('tab');
	this.tab.setAttribute('id', tabid);
	this.tab.setAttribute('linkedpanel', tabpanelid);
	this.tab.addEventListener("draggesture", function(event) { nsDragAndDrop.startDrag(event, tbObserver); }, false);
}

function overlayObserver()
{
  this.register();
}
overlayObserver.prototype = {
  observe: function(subject, topic, data) {
  	
  	function cleanUp() {
		sidebar.contentDocument.getElementById("pqmain_deck").selectedIndex="1";
		
		//setTimeout( function () {
		var mod_boxes = sidebar.contentDocument.getElementsByTagName("tabbox"); 
		//Node.prototype.getChildrenByClassName.call(sidebar.contentDocument.firstChild, "moduleBox");
		for (var i=0,len=mod_boxes.length;i<len;++i) {
			if (hasClassName(mod_boxes[i],"moduleBox")) {
				mod_boxes[i].selectedIndex = 0;
			}
			//var num_tabs = mod_boxes[i].getElementsByTagName("tab").length;
			//mod_boxes[i].getElementsByTagName("tab")[num_tabs-1].click();
			//mod_boxes[i].getElementsByTagName("tab")[0].click();
		}
  	}
  	
  	if (topic == "xul-overlay-merged") {
  		try { 
  		var nex = piratequesting.overlayRegistry.next();
  		if (nex) {
  			sidebar.contentDocument.getElementById("pqloadprogress").value = piratequesting.overlayRegistry.progress();
  			try {
  				sidebar.contentDocument.loadOverlay(nex.getOverlayFile(),this);
  			} catch (error) {
  				cleanUp();
  				alert("Failed to load: " + nex.getOverlayFile() + "\nReported Error " + getErrorString(error));
  			}
  		} else {
  			cleanUp()
  		}
  		} catch (error) { alert(getErrorString(error)); }
  	}
  },
  register: function() {
    var observerService = Components.classes["@mozilla.org/observer-service;1"]
                          .getService(Components.interfaces.nsIObserverService);
    observerService.addObserver(this, "xul-overlay-merged", false);
  },
  unregister: function() {
    var observerService = Components.classes["@mozilla.org/observer-service;1"]
                            .getService(Components.interfaces.nsIObserverService);
    observerService.removeObserver(this, "xul-overlay-merged");
  }
}


