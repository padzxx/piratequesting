var piratequesting = top.piratequesting;

/**
 * Module for changing links pointing to PQ pages at different addresses so they point to the same one the user is on
 * @namespace 
 */
piratequesting.LinkFix = {

	/**
	 * Standard Module Page Processor 
	 * @param {Document} doc
	 */
	process : function(doc) {
		
		//now look through every node and find the text nodes. 
		//then, if the parent isn't a link, break up the node
		//and create a link around the url
		/**
		 * @param {Node} element
		 */
		function replaceText(element) {
			if (element.nodeType == 3) {
				var regex = /((?:(?:https?|ftp):\/\/)(?:[\w\d:#@%/;$()~_?\+-=\\\.&]+))/gi;
				var text1, link, text2;
				var parts = element.nodeValue.split(regex);
				//every second part is a link address
				for (var i=0, len = parts.length;i<len;++i){
					if (i%2 == 0) {
						if (parts[i] != "") {
							element.parentNode.insertBefore(doc.createTextNode(parts[i]),element);
						}
					} else {
						link = doc.createElement('a');
						link.setAttribute('href', parts[i]);
						link.appendChild(doc.createTextNode(parts[i]));
						element.parentNode.insertBefore(link,element);
					}
				}
				element.parentNode.removeChild(element);
			} else {
				var ce = element.childNodes;
				var cen;
				for (var i = 0, cel = ce.length; i<cel;++i) {
					
					if (!/^(a|textarea|input)$/ig.test(ce[i].nodeName)) {
						replaceText(ce[i]);
					}
				}
			}
		}	
		var section;
		if (section = doc.getElementById('forumpad'))
			replaceText(section);
		else if (section = doc.getElementById('mailpad'))
			replaceText(section);
		else if (section = doc.getElementById('towncrier'))
			replaceText(section);
		
		
		var regex = /(http:\/\/piratequest\.net|http:\/\/www\.piratequest\.net|http:\/\/76\.76\.6\.166)/g;
		var atags = doc.getElementsByTagName("a");
		for (var i = 0; i < atags.length; i++) {
			if (atags[i].getAttribute("href") != null)
				atags[i].setAttribute("href", atags[i].getAttribute("href")
								.replace(regex, piratequesting.baseURL));
		}
		
	}
};
piratequesting.addLoadProcess("", piratequesting.LinkFix.process);

