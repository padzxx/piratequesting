var piratequesting = top.piratequesting;

/**
 * Training Log writer and processor
 * 
 * @namespace
 */
piratequesting.TrainingLog = function() {

	if (!(piratequesting.DBConn.tableExists("training"))) 
		piratequesting.DBConn
				.executeSimpleSQL('CREATE TABLE "training" ("id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "awake" INTEGER, "port" VARCHAR, "chance" INTEGER, "rolled" INTEGER, "datetime" DATETIME NOT NULL  DEFAULT CURRENT_TIMESTAMP, "level" INTEGER)');
	if (!(piratequesting.DBConn.tableExists("training_result"))) 
		piratequesting.DBConn
				.executeSimpleSQL('CREATE TABLE "training_result" ("id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "training_id" INTEGER NOT NULL , "energy" INTEGER NOT NULL  DEFAULT 0, "attribute" INTEGER, "increase" DOUBLE)');

	var file = piratequesting.strings.TrainingLog.getString("file");
	var insertPrimary = piratequesting.DBConn
			.createStatement("INSERT INTO training (awake, port, rolled, chance, level) VALUES (?1, ?2, ?3, ?4, ?5)");
	var insertResult = piratequesting.DBConn
			.createStatement("INSERT INTO training_result (training_id,attribute, energy, increase) VALUES (?1, ?2, ?3, ?4)");
	
	function write (data) {
		try {
			piratequesting.DBConn.beginTransaction();
			
			insertPrimary.bindInt32Parameter(0,data.awake);
			insertPrimary.bindUTF8StringParameter(1,data.port); // port
			var matches;
			if (data.failure && (data.failure != "")) {
				if (piratequesting.baseTheme == piratequesting.CLASSIC_THEME) {
					matches = ((String) (data.failure)).split(/\D+/);
					
					insertPrimary.bindInt32Parameter(2,matches[1]);
					insertPrimary.bindInt32Parameter(3,matches[2]);
				} else if (piratequesting.baseTheme == piratequesting.DEFAULT_THEME) {
					insertPrimary.bindInt32Parameter(2,data.failure.toNumber());
					insertPrimary.bindInt32Parameter(3,data.chance);
				}
				
			} else {
				insertPrimary.bindInt32Parameter(2,null);
				insertPrimary.bindInt32Parameter(3,data.lastchance);
			}
			if (data.level) {
				insertPrimary.bindInt32Parameter(4,data.level);
			} else {
				insertPrimary.bindInt32Parameter(4,null);
			}
			insertPrimary.execute();
			if (piratequesting.DBConn.transactionInProgress) piratequesting.DBConn.commitTransaction();
			
			if (!data.failure || data.failure == "") {
				var lid = piratequesting.DBConn.lastInsertRowID;
				piratequesting.DBConn.beginTransaction();
				
					for (var i = 0, len = data.success.length; i<len; ++i)  {
						matches =  data.success[i].match(/Trained ([,\d]+) times and gained ([,.\d]+) (Strength|Defense|Speed)./i);
						insertResult.bindInt32Parameter(0,lid);
						insertResult.bindUTF8StringParameter(1,matches[3]);
						insertResult.bindInt32Parameter(2,matches[1]);
						insertResult.bindDoubleParameter(3,matches[2]);
						insertResult.execute();
					}
					
				if (piratequesting.DBConn.transactionInProgress) piratequesting.DBConn.commitTransaction();
			}
			var trainLogTab = findTab(file);
			if (trainLogTab != null) {
				trainLogTab.contentDocument.getElementById("update").doCommand();
			}
		
		} catch (error) { dumpError(error); }
	}
	
	return {
		
		
		clear: function() {
			piratequesting.DBConn.executeSimpleSQL("DELETE FROM trainlog");
		},
		
		/**
		 * Standard Module Page Processor,
		 * 
		 * @param {Document}
		 *            doc
		 */
		process : function() {
			var data = piratequesting.TrainingProcessor.output();
			// SELECT awake, port, chance, rolled, sum(energy),
			// round(sum(increase),3), group_concat(attribute, ", ") FROM
			// training left join training_result on training.id = training_id
			// group by training_id
			try { 
				if (!data.injured && ((data.failure && (data.failure != "")) || (data.success.length > 0)) ) {
					write(data);
				}
			} catch (error) { dumpError(error);}

		},
		open : function() {
			openAndReuseOneTabPerURL(file,true);
		}
	}

}();

document.addEventListener("piratequesting:TrainingUpdated",function(event){ piratequesting.TrainingLog.process(); }, false);