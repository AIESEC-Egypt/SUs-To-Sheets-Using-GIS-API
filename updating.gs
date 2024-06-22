function updateStatus() {
  const date = new Date();
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth() + 1;
  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
  Logger.log(daysInCurrentMonth);
  var startDate = "01/05/2024";
  var endDate = "30/06/2024";

  var sheetSUs =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SignUps");
  var page_number = 1;
  var allData = [];
  do {
    var querySignups = `query{\n\tpeople(\n\t\tfilters:{\n\nhome_committee:1609\n\t\tregistered:{from:\"${startDate}\" \n\t\t to:\"${endDate}\"}\n\t\tsort:created_at\n\t}\n\tper_page:3000\n\t\tpage:${page_number}\n\t\n\t){\n\t\tpaging{\n\t\t\ttotal_pages\n\t\t\tcurrent_page\n\t\t\ttotal_items}\n\t\tdata{\n\t\t\tid\n\n\t\t\t\n\t\t\tstatus\t\t\tperson_profile{\n\t\t\t\tselected_programmes\n\t\t\t\t\n\t\t\t}\n\t\t\t\n\t\t\t\n\t\t}\n\t}\n}`;
    var query = JSON.stringify({ query: querySignups });
    var data = dataExtraction_Signups(query);
    if (data != null) {
      if (data.length != 0) {
        allData.push(data.data);
        page_number++;
      }
    } else {
      break;
    }

    //Logger.log(data.length)
  } while (data.paging.current_page <= data.paging.total_pages);

  var newRows = [];
  var ids = sheetSUs.getRange(1, 1, sheetSUs.getLastRow(), 1).getValues();
  ids = ids.flat(1);
  for (let data of allData) {
    for (let i = 1; i < data.length; i++) {
      Logger.log(i);
      var row = [];
      row.push([
        data[i].status,
        data[i].person_profile
          ? changeProductCode(data[i].person_profile.selected_programmes)
          : "-",
      ]);
      var rowIndex = ids.indexOf(parseInt(data[i].id));
      Logger.log(rowIndex);
      Logger.log(data[i].id);
      sheetSUs.getRange(rowIndex + 1, 7, 1, 2).setValues(row);
    }
  }
}
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}
