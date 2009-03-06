var piratequesting = top.piratequesting;

/**
 * Chirugeon page processing<br>
 * Changes time reamining into countdown timers<br>
 * Also adds links to attack and mug the players
 * 
 * @namespace
 */
piratequesting.Captcha = function () {

	function enter (url,imgsrc, failure) {
			var params = {image:imgsrc, out:null, failure: failure};       
			window.openDialog("chrome://piratequesting/content/modules/codeDialog.xul", "",
		    "chrome, dialog, modal, resizable=no, status=no, height=265, width=400", params).focus();
			if ((params.out != null) && (params.out != "")) {
				submit(url,params.out);
		    }
		    //if params.out was null or empty then the user obviously didn't enter a code
		}
		
		function submit (url,code) {
			var http = new XMLHttpRequest();
			var params = 'iv_check=' + code;
			http.open("POST", url, true);
			http.onerror = function (error) {
				alert(getErrorString(error));
			}
			// Send the proper header information along with the request
			http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			http.setRequestHeader("Content-length", params.length);
			http.setRequestHeader("Connection", "close");
		
			http.onreadystatechange = function () {
				if(http.readyState == 4) {
					if (http.status == 200) {
						piratequesting.ProcessResponse(url, http.responseText);
					} else {
						alert("Code submission failed due to error");
					}
				}
			}
			http.send(params);
		}
			
	return {
		/**
		 * Standard Module Page Processor
		 * 
		 * @param {nsIDOMDocument}
		 *            doc
		 */
		process : function(doc,url) {
			var codesrc = doc.evaluate('id("contentarea")//img[@alt="Image Verification"]/@src',doc,null,XPathResult.STRING_TYPE,null).stringValue;
			//only check if this was a failure 
			if (codesrc) {
				var failure = doc.evaluate('contains(id("contentarea")//*[./*/img[@alt="Image Verification"]],"The code you entered is incorrect")',doc,null,XPathResult.BOOLEAN_TYPE,null).booleanValue;
				enter(url, piratequesting.baseURL + codesrc, failure);
			}
	
		}
	}
}();
piratequesting.addResponseProcessor(new RegExp("", ""),
		piratequesting.Captcha.process);
