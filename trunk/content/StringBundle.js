function StringBundle(url) {
	this._url = url;
	this._StringBundle = StringBundle.create(this._url);
}

StringBundle.create = function(url) {
	return Cc["@mozilla.org/intl/stringbundle;1"]
			.getService(Ci.nsIStringBundleService).createBundle(url);
}
StringBundle.prototype = {

  getStringBundle : function() {
		return this._StringBundle;
	},

	getUrl : function() {
		return this._url;
	},

	set_url : function(url) {
		this._url = url;
		delete this._stringBundle;
		this._stringBundle = StringBundle.create(this._url, this._appLocale);
	},

	getAll : function() {
		var strings = [];
		var enumerator = this._StringBundle.getSimpleEnumeration();
		var string;
		while (enumerator.hasMoreElements()) {
			string = enumerator.getNext().QueryInterface(Ci.nsIPropertyElement);
			strings.push({
				key : string.key,
				value : string.value
			});
		}
		return strings;
	},

	getString : function(key) {
		return this._StringBundle.GetStringFromName(key);
	},

	getFormattedString : function(key, args) {
		return this._StringBundle.formatStringFromName(key, args, args.length);
	}
}
