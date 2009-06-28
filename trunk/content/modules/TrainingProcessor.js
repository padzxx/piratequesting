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
				success:success,
				port:port,
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
			if (piratequesting.baseTheme =="classic") {
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
				
				document.fire('piratequesting:TrainingUpdated');
				/*var evt = document.createEvent("MouseEvents");
				evt.initMouseEvent(,false,true, window,
	   				0, 0, 0, 0, 0, false, false, false, false, 0, null);
	
				document.dispatchEvent(evt);*/
				} catch (error) {
					dumpError(error);
					
				}
			}
			
		},
		processRawTrain : function(text, url, data) {
			try{
				var parser=new DOMParser();
  				var doc=parser.parseFromString(text,"text/xml");
  				//dump(text+"\n"+data+"\n");
  				
  				/*for (part in data) {
  					dump ("\ndata." + part + ":\t" + data[part]);
  				}*/
				
				clear();
				
				codesrc = doc.evaluate("//capcha", doc, null, XPathResult.STRING_TYPE, null).stringValue;
				var succ = doc.evaluate("boolean(//success[.=1])", doc, null, XPathResult.BOOL_TYPE, null).booleanValue;
				var message = doc.evaluate("//message", doc, null, XPathResult.STRING_TYPE, null).stringValue;
				if (!succ) {
					failure = message;
				} else {
					message = message.split("  ");
					var value, type, typecheck = /[\s\S]*?(strength|defense|speed)[\s\S]*/i, valCheck = /[\s\S]*?([,.\d]+)[\s\S]*/;
					for (var i =0,len=message.length;i<len;++i) {
						type = message[i].replace(typecheck,"$1").toLowerCase();
						value = message[i].replace(valCheck,"$1");
						message[i] = "Trained " + data[type].addCommas() + " times and gained " + value + " " + type + ".";  
					}
					success=message;
				}
				if (piratequesting.Player) {
					level = piratequesting.Player.getLevel();
					awake = piratequesting.Player.getStat("awake");
				}
				
				chance = doc.evaluate("//successchance", doc, null, XPathResult.NUMBER_TYPE, null).numberValue;
				document.fire('piratequesting:TrainingUpdated');
				
  			} catch (error) {
				dumpError(error);
			}
		},
		portCheck: function (doc) {
			if (piratequesting.baseTheme == "default") {
				port = doc.evaluate("id('sidebar')/ul[@class='menucontent']/li/a[starts-with(@href,'/index.php?on=city')]/em/text()", doc, null, XPathResult.STRING_TYPE, null).stringValue;
				//dump("port: " + port + "\n");
			}
		}
	}
}();
piratequesting.addLoadProcess(new RegExp("", ""),piratequesting.TrainingProcessor.portCheck, piratequesting.TrainingProcessor);
piratequesting.addLoadProcess(new RegExp(piratequesting.strings.TrainingProcessor.getString("page_regex"), ""),piratequesting.TrainingProcessor.process);
piratequesting.addRawProcessor(/index.php\?ajax=train/,piratequesting.TrainingProcessor.processRawTrain,piratequesting.TrainingProcessor);