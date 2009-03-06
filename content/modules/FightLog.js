var piratequesting = top.piratequesting;

/**
 * Chirugeon page processing<br>
 * Changes time reamining into countdown timers<br>
 * Also adds links to attack and mug the players
 * 
 * @namespace
 */
piratequesting.FightLog = function() {

	if (!(piratequesting.DBConn.tableExists("fight")))
		piratequesting.DBConn
				.executeSimpleSQL('CREATE TABLE "fight" ("id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "my_id" INTEGER NOT NULL, "opponent_id" INTEGER NOT NULL , "winner_id" INTEGER NOT NULL, "prize" INTEGER NOT NULL , "experience" INTEGER NOT NULL , "datetime" DATETIME NOT NULL  DEFAULT CURRENT_TIMESTAMP)');
	if (!(piratequesting.DBConn.tableExists("player")))
		piratequesting.DBConn
				.executeSimpleSQL('CREATE TABLE "player" ("id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "user_id" INTEGER, "name" VARCHAR, "strength" DOUBLE, "defense" DOUBLE, "speed" DOUBLE, "level" INTEGER, "adjusted" INTEGER DEFAULT 1, "datetime" DATETIME DEFAULT CURRENT_TIMESTAMP )');
	if (!(piratequesting.DBConn.tableExists("attack")))
		piratequesting.DBConn
				.executeSimpleSQL('CREATE TABLE "attack" ("id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "fight_id" INTEGER NOT NULL , "player_id" INTEGER NOT NULL, "type" INTEGER NOT NULL , "damage" INTEGER NOT NULL )');

	var lastInsertID = piratequesting.DBConn.createStatement("SELECT last_insert_rowid()");
	
	var insertFight = piratequesting.DBConn
			.createStatement("INSERT INTO fight (my_id, opponent_id, winner_id, prize, experience) VALUES (?1, ?2, ?3, ?4, ?5)");
			/**
			 * @type StorageStatement
			 */
	var insertPlayer = piratequesting.DBConn
			.createStatement("INSERT INTO player (user_id, name, strength, defense, speed, level, adjusted) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)");
			
	var insertAttack = piratequesting.DBConn
			.createStatement("INSERT INTO attack (fight_id, player_id, type, damage) VALUES (?1, ?2, ?3, ?4)");
	
	var file = piratequesting.strings.FightLog.getString("file");

	return {
		clear : function() {
			piratequesting.DBConn.executeSimpleSQL("DELETE FROM fight");
			piratequesting.DBConn.executeSimpleSQL("DELETE FROM attack");
		},
		/**
		 * Standard Module Page Processor, however only gets called on an event
		 * 
		 * @param {Document}
		 *            doc
		 */
		process : function(doc) {
			try {
				var data = piratequesting.FightProcessor.output();
				// [opponent.name, winner.name, prizemoney, prizeexp,
				// me.strength, me.defense, me.speed, opponent.strength,
				// opponent.defense, opponent.speed];
				
				/*
				 * Basically, since fight is dependant on having the player_id and 
				 * attack is dependant on having both fight_id and player_id, we 
				 * have to process them in the following order
				 * 1. player
				 * 2. fight
				 * 3. attack   
				 */
				
				piratequesting.DBConn.beginTransaction();
				
				//we need to insert both players. 
				var ids = [];
				var types = ["me","opponent"];
				for each (player_type in types) {
					var player = data[player_type]; 
					insertPlayer.bindInt32Parameter(0,player.id);
					insertPlayer.bindUTF8StringParameter(1,player.name);
					insertPlayer.bindDoubleParameter(2,player.strength);
					insertPlayer.bindDoubleParameter(3,player.defense);
					insertPlayer.bindDoubleParameter(4,player.speed);
					insertPlayer.bindInt32Parameter(5,player.level);
					insertPlayer.bindInt32Parameter(6,1);
					insertPlayer.execute();
					lastInsertID.executeStep();
					
					ids[player_type] = 	lastInsertID.getInt32(0);
					lastInsertID.reset();
				}
				
				//now the fight itself
				
				insertFight.bindInt32Parameter(0,ids["me"]);
				insertFight.bindInt32Parameter(1,ids["opponent"]);
				insertFight.bindInt32Parameter(2,(data.me === data.winner) ? ids["me"] : ids["opponent"]);
				insertFight.bindInt32Parameter(3,((String)(data.prize)).stripCommas());
				insertFight.bindInt32Parameter(4,((String)(data.experience)).stripCommas());
				insertFight.execute();
				lastInsertID.executeStep();
				var fightID = lastInsertID.getInt32(0);
				lastInsertID.reset();
				
				var atype = 0;
				
				if (data.ambush.length > 0) {
					insertAttack.bindInt32Parameter(0,fightID);
					insertAttack.bindInt32Parameter(1,ids["me"]);
					insertAttack.bindInt32Parameter(2,atype);
					insertAttack.bindInt32Parameter(3,((String)((data.attacks.shift()).damage)).stripCommas());
					insertAttack.execute();
				}
				var attack;
				for (var i = 0, len = data.attacks.length; i < len; ++i ) {
					if (data.attacks[i] instanceof Misfire) {
						i++;
						atype = 2; 
					} else {
						atype = 1;
					}
					attack = data.attacks[i];
					insertAttack.bindInt32Parameter(0,fightID);
					insertAttack.bindInt32Parameter(1,(attack.attacker === data.me) ? ids["me"] : ids["opponent"]);
					insertAttack.bindInt32Parameter(2,atype);
					insertAttack.bindInt32Parameter(3, ((String)(attack.damage)).stripCommas());
					insertAttack.execute();
				}
				/*
				insert.bindUTF8StringParameter(0,
						value[0]); // opponent
				// name
				insert.bindUTF8StringParameter(1,
						value[1]); // winner
				// name
				insert.bindInt32Parameter(2,
						String(value[2]).stripCommas()); // prize
				// money
				insert.bindInt32Parameter(3,
						String(value[3]).stripCommas()); // prize
				// experience
				insert
						.bindDoubleParameter(4, value[4]); // my
				// strength
				insert
						.bindDoubleParameter(5, value[5]); // my
				// defense
				insert
						.bindDoubleParameter(6, value[6]); // my
				// speed
				insert
						.bindDoubleParameter(7, value[7]); // opponent
				// strength
				insert
						.bindDoubleParameter(8, value[8]); // opponent
				// defense
				insert
						.bindDoubleParameter(9, value[9]); // opponent
				// speed
				insert.execute();*/
				if (piratequesting.DBConn.transactionInProgress)
					piratequesting.DBConn.commitTransaction();
				var fightLogTab = findTab(file);
				if (fightLogTab != null) {
					fightLogTab.contentDocument.getElementById("update")
							.doCommand();
				}
			} catch (error) {
				alert(getErrorString(error));
			}
		},
		open : function() {
			openAndReuseOneTabPerURL(
					file,
					true);
		}

	}

}();

document.addEventListener("piratequesting:FightUpdated",function(event){ piratequesting.FightLog.process(event.relatedTarget); }, false);
