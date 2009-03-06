/*******************************************************************************
 * ***** BEGIN LICENSE BLOCK Version: MPL 1.1/GPL 2.0/LGPL 2.1
 * 
 * The contents of this file are subject to the Mozilla Public License Version
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for
 * the specific language governing rights and limitations under the License.
 * 
 * The Original Code is Pirate Questing.
 * 
 * The Initial Developer of the Original Code is Jonathan Fingland. Portions
 * created by the Initial Developer are Copyright (C) 2008 the Initial
 * Developer. All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or the
 * GNU Lesser General Public License Version 2.1 or later (the "LGPL"), in which
 * case the provisions of the GPL or the LGPL are applicable instead of those
 * above. If you wish to allow use of your version of this file only under the
 * terms of either the GPL or the LGPL, and not to allow others to use your
 * version of this file under the terms of the MPL, indicate your decision by
 * deleting the provisions above and replace them with the notice and other
 * provisions required by the GPL or the LGPL. If you do not delete the
 * provisions above, a recipient may use your version of this file under the
 * terms of any one of the MPL, the GPL or the LGPL.
 * 
 * ***** END LICENSE BLOCK *****
 */
function LogViewer () { 
	

	return {

		length : 0,
	
		DBConn : function() {
			var PQCom = Components.classes['@pq.ashita.org/pqcom;1']
											.getService().wrappedJSObject;
			return PQCom.database;

		}(),
	
		tableName : null,
	
		tree : null,
		aTableData : null,
		aTableType : null,
		aColumns : null,
		query : null,
	
		onLoad : function() {
			document.getElementById('from').addEventListener('keypress',
					this.HandleKeyPressUpdate, true);
			document.getElementById('howmany').addEventListener('keypress',
					this.HandleKeyPressUpdate, true);
			netscape.security.PrivilegeManager
					.enablePrivilege("UniversalXPConnect");
	    
			
			this.showCount();
			this.tree = document.getElementById("log");
			this.showResults();
		},
	
		onUnload : function() {
		},
	
		showCount : function() {
			var stmt = this.DBConn
					.createStatement("SELECT count(id) as total from "
							+ this.tableName);
			stmt.executeStep();
	    
			this.length = stmt.getInt32(0);
			document.getElementById("tl").setAttribute("value", this.length);
			stmt.reset();
		},
	
		selectQuery : function() {
			// alert(sQuery);
			this.aTableData = new Array();
			this.aTableType = new Array();
			// if aColumns is not null, there is a problem in tree display
			// this.aColumns = new Array();
			this.aColumns = null;
			var bResult = false;
	
			try { // mozIStorageStatement
				var stmt = this.DBConn.createStatement(this.query);
			} catch (e) {
				alert(getErrorString(e));
				return false;
			}
	
			var iCols = 0;
			var iType, colName;
			try {
				// do not use stmt.columnCount in the for loop, fetches the value
				// again and again
				iCols = stmt.columnCount;
				this.aColumns = new Array();
				var aTemp, aType;
				for (var i = 0; i < iCols; i++) {
					colName = stmt.getColumnName(i);
					aTemp = [colName, iType];
					this.aColumns.push(aTemp);
				}
			} catch (e) {
				alert(getErrorString(e));
				return false;
			}
	
			var cell;
			var bFirstRow = true;
			try {
				while (stmt.executeStep()) {
					aTemp = [];// new Array();
					aType = [];
					for (i = 0; i < iCols; i++) {
						iType = stmt.getTypeOfIndex(i);
						if (bFirstRow) {
							this.aColumns[i][1] = iType;
						}
						switch (iType) {
							case stmt.VALUE_TYPE_NULL :
								cell = "";
								break;
							case stmt.VALUE_TYPE_INTEGER :
								// use getInt64, not getInt32 otherwise long int
								// as in places.sqlite/cookies.sqlite shows funny
								// values
								cell = stmt.getInt64(i);
								break;
							case stmt.VALUE_TYPE_FLOAT :
								cell = stmt.getDouble(i);
								break;
							case stmt.VALUE_TYPE_TEXT :
								cell = stmt.getString(i);
								break;
							case stmt.VALUE_TYPE_BLOB : // todo - handle blob
														// properly
								break;
							default :
								sData = "<unknown>";
						}
						aTemp.push(cell);
						aType.push(iType);
					}
					this.aTableData.push(aTemp);
					this.aTableType.push(aType);
					bFirstRow = false;
				}
			} catch (e) {
				alert(getErrorString(e));
				return false;
			} finally {
				// must be reset after executeStep
				stmt.reset();
			}
	    
			return true;
		},
	
		selectionMenu : function() {
			var idList = new Array();
			var tree = document.getElementById("log");
			var rangeCount = tree.view.selection.getRangeCount();
			for (var i = 0; i < rangeCount; i++) {
				var start = {};
				var end = {};
				tree.view.selection.getRangeAt(i, start, end);
				for (var c = start.value; c <= end.value; c++) {
					idList.push(tree.view.getCellText(c, this.tree.columns
									.getNamedColumn('uid')));
				}
			}
			return idList;
	
		},
	
		showResults : function() {
			var sel = document.getElementById("recordgroup").selectedItem
					.getAttribute("value");
			// alert(sel);
			if (sel == 0) {
				var from = document.getElementById("from").value;
				var howmany = document.getElementById("howmany").value;
				if (/-[0-9]+/.test(String(from))) {
					this.query = this.query.replace(/ORDER BY datetime (desc|asc)/i,
							"ORDER BY datetime asc");
					from = Number(from) * -1;
				} else {
					this.query = this.query.replace(/ORDER BY datetime (desc|asc)/i,
							"ORDER BY datetime desc");
				}
				this.query = this.query.replace(/LIMIT -?[,0-9]+/i, "LIMIT " + from
								+ "," + howmany);
			} else {
				this.query = this.query.replace(/LIMIT -?[,0-9]+/i, "LIMIT -1");
			}
			// alert(document.getElementById("query").childNodes[0].nodeValue);
			// document.getElementById("query").childNodes[0].nodeValue =
			// document.getElementById("query").childNodes[0].nodeValue.replace(/LIMIT
			// [0-9]+/, "LIMIT 10");
			// document.getElementById("log").builder.rebuild();
			if (this.selectQuery()) {
				this.tree.view = new DatabaseTreeView(this.aTableData, this.aColumns);
			} else {
				alert("Error encountered querying database.");
			}
	
		},
	
		delete : function() {
			var idList = this.selectionMenu();
			if (idList.length == 0) {
				alert("No records selected.");
				return;
			}
			query = "DELETE FROM " + this.tableName + " WHERE uid IN ("
					+ idList.join(",") + ")";
			this.DBConn.executeSimpleSQL(query);
			this.showResults();
			var tree = document.getElementById("log");
			tree.view.selection.clearSelection();
			this.showCount();
		},
	
		selectAll : function() {
			var tree = document.getElementById("log");
			tree.view.selection.selectAll();
		},
	
		HandleKeyPressUpdate : function(e) {
			switch (e.keyCode) {
				case e.DOM_VK_RETURN :
				case e.DOM_VK_ENTER :
					this.showResults();
				case e.DOM_VK_ESCAPE :
					content.focus();
					return;
			}
		}
	}
};

function DatabaseTreeView(aTableData, aColumns) {
	// http://kb.mozillazine.org/Sorting_Trees
	// 2 dimensional array containing table contents
	// Column information (index, order, type)
	// Number of rows in the table
	this.rowCount = aTableData.length;
	this.colCount = aColumns.length;
	this.treebox = null;
	this.aColumns = new Array();
	for (var i = 0; i < this.colCount; i++) {
		// alert([aColumns[i][0], 0, aColumns[i][1]]);
		this.aColumns[aColumns[i][0]] = [aColumns[i][0], 0, aColumns[i][1]];
	}

	this.aTableData = new Array();
	var aTemp;
	for (var i = 0; i < this.rowCount; i++) {
		aTemp = new Array();
		for (var j = 0; j < this.colCount; j++)
			aTemp[aColumns[j][0]] = aTableData[i][j];
		this.aTableData.push(aTemp);
	}

	// this.aColumns = aColumns;

	this.getCellText = function(row, column) {
		// alert(row+"\n"+column.id);
		var sResult;
		try {
			sResult = this.aTableData[row][column.id];
		} catch (e) {
			return "<" + row + "," + column.id + ">";
		}
		return sResult;
	};

	this.setTree = function(treebox) {
		this.treebox = treebox;
		this.checkColumns()
	};
	this.isContainer = function(row) {
		return false;
	};
	this.isSeparator = function(row) {
		return false;
	};
	this.isSorted = function(row) {
		return false;
	};
	this.cycleHeader = function(col) {
		this.SortColumn(col);
	}
	this.getLevel = function(row) {
		return 0;
	};
	this.getImageSrc = function(row, col) {
		return null;
	};
	this.getRowProperties = function(row, props) {
	};
	this.getCellProperties = function(row, col, props) {
	};
	this.getColumnProperties = function(colid, col, props) {
	};

	this.checkColumns = function() {
		// only bother if the tree exists (it's null a couple of times.... go
		// figure) and actually has columns
		if (this.treebox != null) {
			if (this.treebox.columns.count > 0) {
				var cur = this.treebox.columns.getFirstColumn();
				while (cur != null) {
					if (cur.element.hasAttribute("sortActive")) {
						if ((cur.element.getAttribute("sortActive") == "true")
								&& cur.element.hasAttributes("sortDirection")) {
							if (cur.element.getAttribute("sortDirection") == "descending") {
								this.aColumns[cur.id][1] = 1;
								this.sortCol(cur, 1);
							} else {
								this.aColumns[cur.id][1] = 0;
								this.sortCol(cur, 0);
							}
							return;
						}
					}
					cur = cur.getNext();
				}
			}
		}
	};

	this.clearIndicators = function() {
		if (this.treebox != null) {
			if (this.treebox.columns.count > 0) {
				var cur = this.treebox.columns.getFirstColumn();
				while (cur != null) {
					cur.element.setAttribute("sortActive", "false");
					cur.element.removeAttribute("sortDirection");
					cur = cur.getNext();
				}
			}
		}

	};

	this.setIndicator = function(colname, order) {
		if (this.treebox != null) {
			this.treebox.columns.getNamedColumn(colname).element.setAttribute(
					"sortActive", "true");
			this.treebox.columns.getNamedColumn(colname).element.setAttribute(
					"sortDirection", (order == 0) ? "ascending" : "descending");
		}
	};

	this.sortCol = function(col, order) {
		var index = col.id;
		var name = this.aColumns[index][0];
		var order = this.aColumns[index][1];
		var isnum = ((this.aColumns[index][2] == 1 || this.aColumns[index][2] == 2)
				? 1
				: 0);
		this.clearIndicators();
		this.setIndicator(index, order);
		this.SortTable(this.aTableData, index, order, isnum);// sort the
																// table
	};

	this.SortColumn = function(col) {
		var index = col.id;
		this.aColumns[index][1] = (this.aColumns[index][1] == 0) ? 1 : 0; // switch
		// order
		// flag
		var name = this.aColumns[index][0];
		var order = this.aColumns[index][1];
		var isnum = ((this.aColumns[index][2] == 1 || this.aColumns[index][2] == 2)
				? 1
				: 0);
		this.clearIndicators();
		this.setIndicator(index, order);

		this.SortTable(this.aTableData, index, order, isnum);// sort the
																// table
	};

	// This is the actual sorting method, extending the array.sort() method
	this.SortTable = function(table, col, order, isnum) {
		if (isnum) { // use numeric comparison
			if (order == 0) { // ascending
				this.columnSort = function(a, b) {
					return (a[col] - b[col]);
				};
			} else { // descending
				this.columnSort = function(a, b) {
					return (b[col] - a[col]);
				};
			}
		} else { // use string comparison
			if (order == 0) { // ascending
				this.columnSort = function(a, b) {
					return (a[col].toLowerCase() < b[col].toLowerCase())
							? -1
							: (a[col].toLowerCase() > b[col].toLowerCase())
									? 1
									: 0;
				};
			} else { // descending
				this.columnSort = function(a, b) {
					return (a[col].toLowerCase() > b[col].toLowerCase())
							? -1
							: (a[col].toLowerCase() < b[col].toLowerCase())
									? 1
									: 0;
				};
			}
		}
		// use array.sort(comparer) method
		table.sort(this.columnSort);
	};
}
 /*   try {
      var myComponent = Components.classes['@pq.ashita.org/pqcom;1']
         .getService().wrappedJSObject;
      this.DBConn = myComponent.database;
    } catch (error) {
      alert(error);
    }*/
