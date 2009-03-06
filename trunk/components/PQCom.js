/*******************************************************************************
 * constants
 ******************************************************************************/

// reference to the interface defined in nsIHelloWorld.idl
const nsIPQCom = Components.interfaces.nsIPQCom;

// reference to the required base interface that all components must support
const nsISupports = Components.interfaces.nsISupports;

// UUID uniquely identifying our component
// You can get from: http://kruithof.xs4all.nl/uuid/uuidgen here
const CLASS_ID = Components.ID("{a1677ac0-c3a0-11dd-ad8b-0800200c9a66}");

// description
const CLASS_NAME = "PirateQuesting Javascript XPCOM Component";

// textual unique identifier
const CONTRACT_ID = "@pq.ashita.org/pqcom;1";

/*******************************************************************************
 * class definition
 ******************************************************************************/

/**
 * 
 * @class
 */
function PQCom() {
	if (PQCom.PQComInstance)
		return PQCom.PQComInstance;
	PQCom.PQComInstance = this;

	var file = Components.classes["@mozilla.org/file/directory_service;1"]
			.getService(Components.interfaces.nsIProperties).get("ProfD",
					Components.interfaces.nsIFile);
	file.append("piratequesting.sqlite");

	this.database = Components.classes["@mozilla.org/storage/service;1"]
			.getService(Components.interfaces.mozIStorageService)
			.openDatabase(file);

	this.wrappedJSObject = this;
};
PQCom.PQComInstance = null;

/**
 * @lends PQCom.prototype  
 */
PQCom.prototype = {

	// define the function we want to expose in our interface
	hello : function() {
		return "Hello World!";
	},

	QueryInterface : function(aIID) {
		if (!aIID.equals(nsIPQCom) && !aIID.equals(nsISupports))
			throw Components.results.NS_ERROR_NO_INTERFACE;
		return this;
	}
};

/*******************************************************************************
 * class factory
 * 
 * This object is a member of the global-scope Components.classes. It is keyed
 * off of the contract ID. Eg:
 * 
 * myHelloWorld = Components.classes["@dietrich.ganx4.com/helloworld;1"].
 * createInstance(Components.interfaces.nsIHelloWorld);
 * 
 ******************************************************************************/
var PQComFactory = {
	createInstance : function(aOuter, aIID) {
		if (aOuter != null)
			throw Components.results.NS_ERROR_NO_AGGREGATION;
		return (new PQCom()).QueryInterface(aIID);
	}
};

/*******************************************************************************
 * module definition (xpcom registration)
 ******************************************************************************/
var PQComModule = {
	registerSelf : function(aCompMgr, aFileSpec, aLocation, aType) {
		aCompMgr = aCompMgr
				.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		aCompMgr.registerFactoryLocation(CLASS_ID, CLASS_NAME, CONTRACT_ID,
				aFileSpec, aLocation, aType);
	},

	unregisterSelf : function(aCompMgr, aLocation, aType) {
		aCompMgr = aCompMgr
				.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		aCompMgr.unregisterFactoryLocation(CLASS_ID, aLocation);
	},

	getClassObject : function(aCompMgr, aCID, aIID) {
		if (!aIID.equals(Components.interfaces.nsIFactory))
			throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

		if (aCID.equals(CLASS_ID))
			return PQComFactory;

		throw Components.results.NS_ERROR_NO_INTERFACE;
	},

	canUnload : function(aCompMgr) {
		return true;
	}
};

/*******************************************************************************
 * module initialization
 * 
 * When the application registers the component, this function is called.
 ******************************************************************************/
function NSGetModule(aCompMgr, aFileSpec) {
	return PQComModule;
}