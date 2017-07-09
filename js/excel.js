

var wb = new fin.desktop.excel.Workbook('name');

var wsheet = wb.addSheet('name');

// subscribe data changes from Excel
var cellRanges = [
		[1,2],  	 // single cell
		[3,3,10,10]  // multi-cell range
	]
wsheet.subscribe(cellRanges, function callback(data) {
 									//  [
 									//   { row: 1, column: 1, address: "A1", value: "abc" },
									//   { row: 2, column: 3, address: "B1", value: 100 },
									//	]
				})


