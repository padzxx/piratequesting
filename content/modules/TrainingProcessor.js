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
		codesrc,
		key; 
	
	
	function clear() {
			level = 0;
			lastchance = chance;
			chance = 0;
			awake=null;
			success = [];
			failure = null;
			codesrc= null;
			injured = false;
			key = null;
	}
	
		
	return {
		
		getKey : function () {
			//if the key hasn't been set yet then we have to go out and get it. first from prefs and then, failing that, from PQ itself  
			if (key === null)
			{
					
				key = top.piratequesting.prefs.getCharPref("training_key");
				if (!key)
				{
					//cross your fingers. async: false is teh evils.
					var ajax = AjaxRequest(piratequesting.baseURL + "/index.php?on=train", { onError: function() { pqdump("Error occurred while checking training page\n"); }, proc:true, async:false });
				}
			}
			return key;
		},
		
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
			pqdump("PQ: Processing Training Page (TrainingProcessor.js)\n", PQ_DEBUG_STATUS);
			if (piratequesting.baseTheme == piratequesting.CLASSIC_THEME) {
				pqdump("\tTheme: Classic\n", PQ_DEBUG_STATUS);
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
			} else if (piratequesting.baseTheme ==piratequesting.DEFAULT_THEME) {
				pqdump("\tTheme: Default\n", PQ_DEBUG_STATUS);
				try 
				{
					clear();
					
					key = doc.evaluate('id("contentarea")//div[starts-with(@id,"key")]',doc,null,XPathResult.STRING_TYPE,null).stringValue; 
					chance = doc.evaluate('id("train_success")/text()',doc,null,XPathResult.STRING_TYPE,null).stringValue.toNumber();
					port = doc.evaluate('id("sidebar")/ul[@class="menucontent"][1]/li[1]/a/em/text()',doc,null,XPathResult.STRING_TYPE,null).stringValue;
					codesrc = doc.evaluate('id("train")//img[@alt="Image Verification"]/@src',doc,null,XPathResult.STRING_TYPE,null).stringValue;
					
					pqdump("\tKey: "+ key + "\n");
					pqdump("\tChance: "+ chance + "\n");
					pqdump("\tPort: "+ port + "\n");
					
					top.piratequesting.prefs.setCharPref("training_key", key);
					document.fire('piratequesting:TrainingUpdated');
					
				} 
				catch (e)
				{
					dumpError(e);
				}
				
				
			}
			
		},
		processRawTrain : function(text, url, data) {
			try{
				
				//pqdump("Raw response:\n\n"+text+"\n\n");
				
				var response_object = JSON.parse(text);
										
				clear();
				
				codesrc = response_object.capcha;
				var succ = response_object.success;
				var message = response_object.message;
				
				
				if (!succ) {
					//trim out the garbage HINT about respected status. It's not even formatted properly.
					message = message.replace(/^([\s\S]+?\d+)([\s\S]*)/,"$1");
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
					level = response_object.user_level;
					awake = response_object.awake;
				}
				//this is really weird. The key is is repeated twice in use, even though the value returned is not. Seriously, wtf?
				key = response_object.key;
				key = key + "" + key;
				
				top.piratequesting.prefs.setCharPref("training_key",key);
				chance = response_object.successchance;
				document.fire('piratequesting:TrainingUpdated');
				
  			} catch (error) {
				dumpError(error);
			}
		},
		portCheck: function (doc) {
			if (piratequesting.baseTheme == piratequesting.DEFAULT_THEME) {
				port = doc.evaluate("id('sidebar')/ul[@class='menucontent']/li/a[starts-with(@href,'/index.php?on=city')]/em/text()", doc, null, XPathResult.STRING_TYPE, null).stringValue;
				//pqdump("port: " + port + "\n");
			}
		}
	}
}();
piratequesting.addLoadProcess(new RegExp("", ""),piratequesting.TrainingProcessor.portCheck, piratequesting.TrainingProcessor);
piratequesting.addLoadProcess(new RegExp(piratequesting.strings.TrainingProcessor.getString("page_regex"), ""),piratequesting.TrainingProcessor.process);
piratequesting.addRawProcessor(/index.php\?ajax=train/,piratequesting.TrainingProcessor.processRawTrain,piratequesting.TrainingProcessor);