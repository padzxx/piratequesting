var piratequesting = top.piratequesting;

piratequesting.Sea = {
	process : function(doc) {
		var oNewStyle = doc.createElement("style");
		oNewStyle.innerHTML = '#near_ships li a[title="Attack Sloop"]:after { content: " Sloop"; }';
		oNewStyle.innerHTML += '#near_ships li a[title="Attack Merchant Galleon"]:after { content: " Merchant Galleon"; }';
		oNewStyle.innerHTML += '#near_ships li a[title="Attack Barques"]:after { content: " Barques"; }';
		oNewStyle.innerHTML += '#near_ships li a[title="Attack Caravel"]:after { content: " Caravel"; }';
		oNewStyle.innerHTML += '#near_ships li a[title="Attack Schooner"]:after { content: " Schooner"; }';
		oNewStyle.innerHTML += '#near_ships li a[title="Attack Warship"]:after { content: " Warship"; }';
		oNewStyle.innerHTML += '#near_ships li a[title="Attack English Galleon"]:after { content: " English Galleon"; }';
		oNewStyle.innerHTML += '#near_ships li a[title="Attack Spanish Galleon"]:after { content: " Spanish Galleon"; }';
		oNewStyle.innerHTML += '#near_ships li a[title="Attack French Galleon"]:after { content: " French Galleon"; }';
		doc.body.appendChild(oNewStyle);
	}
};

piratequesting.addLoadProcess(new RegExp(piratequesting.strings.Sea
						.getString("page_regex"), ""),
		piratequesting.Sea.process);
