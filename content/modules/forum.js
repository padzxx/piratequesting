var piratequesting = top.piratequesting;

piratequesting.Forum = {
	process : function(doc) {
		var oNewStyle = doc.createElement("style");
		oNewStyle.innerHTML = 'td.post2 hr + small { display:block; max-height:' + piratequesting.prefs.getIntPref("ForumSigsMaxSize") + 'px; overflow:auto; }';
		doc.body.appendChild(oNewStyle);
	}
};

piratequesting.addLoadProcess(new RegExp("index\\.php\\?on=forum&tid=", ""),piratequesting.Forum.process);
