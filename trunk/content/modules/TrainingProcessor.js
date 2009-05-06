var piratequesting = top.piratequesting;


piratequesting.TrainingProcessor = function() {
	
	var level,
		chance,
		lastchance,
		port,
		success,
		injured,
		failure,
		awake,
		codesrc; 
	
	
	function clear() {
			level = 0;
			lastchance = chance;
			chance = 0;
			awake=null;
			port = "";
			success = [];
			failure = null;
			codesrc= null;
			injured = false;
	}
	
		
	return {
		output :function () {
			return {
				level:level,
				lastchance:lastchance,
				chance: chance,
				port:port,
				success:success,
				injured:injured,
				failure:failure,
				awake:awake,
				codesrc:codesrc
			}
		},
			
		/**
		 * @param {Document} doc
		 */
		process:function(doc) {
			try { 
			clear();
			//this will get all of the successful trains
			var result;
			var th3=doc.evaluate('//h3[starts-with(.,"Trained")]',doc.getElementById('train'),null,XPathResult.ANY_TYPE,null);  
			while (result = th3.iterateNext()) {
				success.push(result.textContent); 
			}
			level = doc.evaluate('substring-after(substring-before(string(id("profile_info")//div[@class="user_role"][last()])," ["),"lvl:")',doc,null,XPathResult.STRING_TYPE,null).stringValue.stripCommas();
			
			port = doc.evaluate('//title',doc,null,XPathResult.STRING_TYPE,null).stringValue.split(" | ")[1]; 
			
			failure = doc.evaluate('id("train")//h3[starts-with(.,"Failed")]',doc,null,XPathResult.STRING_TYPE,null).stringValue; 
			
			codesrc = doc.evaluate('id("train")//img[@alt="Image Verification"]/@src',doc,null,XPathResult.STRING_TYPE,null).stringValue;
			
			awake = doc.evaluate('substring-before(id("prog-bar-awake")/@title," /")',doc,null,XPathResult.STRING_TYPE,null).stringValue;
			
			injured = doc.evaluate('contains(id("train"),"You can\'t train while hurt")',doc,null,XPathResult.Boolean_TYPE,null).booleanValue;
			//javascript: function bob() {var text = doc.evaluate('substring-before(id("train")//div[@class="right"]/p[1]/strong[2],"%")',doc,null,XPathResult.STRING_TYPE,null).stringValue; alert(text);} bob();
			chance = doc.evaluate('substring-before(id("train")//div[@class="right"]/p[1]/strong[2],"%")',doc,null,XPathResult.NUMBER_TYPE,null).numberValue;
			
			
			var evt = document.createEvent("MouseEvents");
			evt.initMouseEvent('piratequesting:TrainingUpdated',false,true, window,
   				0, 0, 0, 0, 0, false, false, false, false, 0, null);

			document.dispatchEvent(evt);
			} catch (error) {
				dumpError(error);
				
			}
			
		}
	}
}();

piratequesting.addLoadProcess(new RegExp(piratequesting.strings.TrainingProcessor
						.getString("page_regex"), ""),
		piratequesting.TrainingProcessor.process);