String.prototype.stripTags = function() {
  var regExp = /<\/?[^>]+>/gi;
  var regex = /[\n\r\t\s]+/gi;
  var ands = /&.+?;/gi;
  return this.replace(regExp, "").replace(ands, " ").replace(regex, " ");
}

String.prototype.strip = function(pattern) {
  if (!pattern) throw "must supply a valid pattern";
  return this.replace(pattern, "");
}
String.prototype.stripwhitespace = function() {
  var regex = /[\s]/g;
  return this.replace(regex, "");
}

if (!String.prototype.trim) {
	String.prototype.trim = function () {
	  if (this != "") {
	    var regex = /^[\s]+|[\s]+$/g;
	    return this.replace(regex, "");
	  }
	  return "";
	}
}

String.prototype.stripCommas = function () {
  var regex = /,/g;
  return this.replace(regex, "");
}

String.prototype.addCommas = function () {
  var x = this.split('.');
  var x1 = x[0];
  var x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }
  return x1 + x2;
}

String.prototype.stripDollars = function () {
  var regex = /\$/g;
  return this.replace(regex, "");
}

String.prototype.toNumber = function() {
  var regex = /[^\d.+-]/g;
  return this.replace(regex, "");
}
