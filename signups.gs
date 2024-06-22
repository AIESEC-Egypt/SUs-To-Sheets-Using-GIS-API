function signupsLiveUpdating() {
  var today = new Date();
  // var numberOfDays = (24*60*60*1000) //  is the number of days
  // var today = Math.floor(today.setTime(today.getTime()-numberOfDays));
  Logger.log(today);
  var startDate = Utilities.formatDate(new Date(today), "GMT+3", "dd/MM/yyyy");
  Logger.log(startDate);
  var sheetSUs =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SignUps");
  var page_number = 1;
  var allData = [];
  do {
    var querySignups = `query {\n\tpeople(\n\t\tfilters: {\nhome_committee:1609\n registered: { from: \"${startDate}\" }, sort: created_at }\n\n\t\tper_page: 1000\n\t\tpage:${page_number}\n\t) {\npaging{\n\t\t\tcurrent_page\n\t\t\ttotal_items\n\t\t\ttotal_pages\n\t\t}\n\t\t\tdata {\n\t\t\tcreated_at\n\t\t\tid\n\t\t\tfull_name\n\tphone\n\t\t\tgender\n\t\t\tdob\n\t\t\tstatus\n\t\t\tacademic_experiences {\n\t\t\t\tbackgrounds {\n\t\t\t\t\tname\n\t\t\t\t}\n\t\t\t}\n\t\t\tperson_profile {\n\t\t\t\tselected_programmes\n\t\t\t}\n\t\t\thome_lc {\n\t\t\t\tname\n\t\t\t}\n\t\t\thome_mc {\n\t\t\t\tname\n\t\t\t}\n \n\t\t\tis_aiesecer\n\t\t\treferral_type\n\tlc_alignment{\n\t\t\t\tkeywords\n\t\t\t\t\n\t\t\t}\t\tlatest_graduation_date\n\topportunity_applications_count\n\t\t}\n\t}\n}\n`;
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
  } while (data.paging.current_page <= data.paging.total_pages);

  var newRows = [];
  var ids = sheetSUs.getRange(1, 1, sheetSUs.getLastRow(), 1).getValues();
  ids = ids.flat(1);
  for (let data of allData) {
    for (let i = 1; i < data.length; i++) {
      if (ids.indexOf(parseInt(data[i].id)) < 0) {
        var backgrounds = [];
        if (data[i].academic_experiences[0] != null) {
          if (data[i].academic_experiences[0].backgrounds[0] != null) {
            backgrounds.push(
              data[i].academic_experiences[0].backgrounds[0].name
            );
          }
        }
        newRows.push([
          data[i].id,
          data[i].created_at.substring(0, 10),
          data[i].full_name,
          data[i].phone,
          data[i].gender,
          data[i].dob,
          data[i].status,
          data[i].person_profile
            ? changeProductCode(data[i].person_profile.selected_programmes)
            : "-",
          backgrounds.join(","),
          data[i].home_lc.name,
          data[i].home_mc.name,
          data[i].lc_alignment ? data[i].lc_alignment.keywords : "-",
          data[i].is_aiesecer == false ? "No" : "Yes",
          data[i].referral_type,
          data[i].opportunity_applications_count,
          data[i].latest_graduation_date
            ? data[i].latest_graduation_date.substring(0, 10)
            : "-",
        ]);
      } else {
        var row = [];

        row.push([
          data[i].id,
          data[i].created_at.substring(0, 10),
          data[i].full_name,
          data[i].phone,
          data[i].gender,
          data[i].dob,
          data[i].status,
          data[i].person_profile
            ? changeProductCode(data[i].person_profile.selected_programmes)
            : "-",
          data[i].backgrounds,
          data[i].home_lc.name,
          data[i].home_mc.name,
          data[i].lc_alignment ? data[i].lc_alignment.keywords : "-",
          data[i].is_aiesecer == false ? "No" : "Yes",
          data[i].referral_type,
          data[i].opportunity_applications_count,
          data[i].latest_graduation_date
            ? data[i].latest_graduation_date.substring(0, 10)
            : "-",
        ]);
        sheetSUs
          .getRange(ids.indexOf(parseInt(data[i].id)) + 1, 1, 1, row[0].length)
          .setValues(row);
        // Logger.log("row")
        // Logger.log(row)
      }
    }
  }
  if (newRows.length > 0) {
    // Logger.log(newRows)
    var chunkSize = 500; // Adjust this size based on your data
    for (var i = 0; i < newRows.length; i += chunkSize) {
      var chunk = newRows.slice(i, i + chunkSize);
      sheetSUs
        .getRange(sheetSUs.getLastRow() + 1, 1, chunk.length, chunk[0].length)
        .setValues(chunk);
    }
    // Logger.log("newRows")
    // Logger.log(newRows)
  }
}
// function signupsLiveUpdating(){
//   var today = new Date()
//   var numberOfDays = (24*60*60*1000) * 3 //  is the number of days
//   var today = today.setTime(today.getTime()-numberOfDays)
//   var startDate = Utilities.formatDate(new Date(today), "GMT+2", "dd/MM/yyyy");

//   var sheetSUs = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SignUps")
//   var page_number = 1
//   var allData = []
//   do{
//     var querySignups = `query {\n\tpeople(\n\t\tfilters: {\nhome_committee:1609\n registered: { from: \"${startDate}\" }, sort: created_at }\n\n\t\tper_page: 1000\n\t\tpage:${page_number}\n\t) {\npaging{\n\t\t\tcurrent_page\n\t\t\ttotal_items\n\t\t\ttotal_pages\n\t\t}\n\t\t\tdata {\n\t\t\tcreated_at\n\t\t\tid\n\t\t\tfull_name\n\tcontact_detail{phone}\n\t\t\tgender\n\t\t\tdob\n\t\t\tstatus\n\t\t\tacademic_experiences {\n\t\t\t\tbackgrounds {\n\t\t\t\t\tname\n\t\t\t\t}\n\t\t\t}\n\t\t\tperson_profile {\n\t\t\t\tselected_programmes\n\t\t\t}\n\t\t\thome_lc {\n\t\t\t\tname\n\t\t\t}\n\t\t\thome_mc {\n\t\t\t\tname\n\t\t\t}\n\n\t\t\tis_aiesecer\n\t\t\treferral_type\n\tlc_alignment{\n\t\t\t\tkeywords\n\t\t\t\t\n\t\t\t}\t\tlatest_graduation_date\n\topportunity_applications_count\n\t\t}\n\t}\n}\n`
//     var query = JSON.stringify({query: querySignups})
//     var data = dataExtraction_Signups(query)
//     if(data != null)
//     {
//       if(data.length != 0){
//         allData.push(data.data)
//         page_number++
//       }
//     }
//     else{
//       break
//     }
//     //Logger.log(data.length)
//   }while(data.paging.current_page <= data.paging.total_pages);

//   var newRows = []
//   var ids = sheetSUs.getRange(1,1,sheetSUs.getLastRow(),1).getValues()
//   ids = ids.flat(1)
//   for(let data of allData){
//     for(let i = 0; i < data.length; i++){
//       Logger.log(i)

//       if(ids.indexOf(parseInt(data[i].id))==-1)
//       {
//         var backgrounds = []
//         if(data[i].academic_experiences[0] != null){
//           if(data[i].academic_experiences[0].backgrounds[0] != null)
//           {
//             backgrounds.push(data[i].academic_experiences[0].backgrounds[0].name)
//           }
//         }
//         newRows.push([
//             data[i].id,
//             data[i].created_at.substring(0,10),
//             data[i].full_name,
//             data[i].contact_detail.phone,
//             data[i].gender,
//             data[i].dob,
//             data[i].status,
//             data[i].person_profile? changeProductCode(data[i].person_profile.selected_programmes):"-",
//             backgrounds.join(","),
//             data[i].home_lc.name,
//             data[i].home_mc.name,
//             data[i].lc_alignment ? data[i].lc_alignment.keywords:"-",
//             data[i].is_aiesecer==false?"No":"Yes",
//             data[i].referral_type,
//             data[i].opportunity_applications_count,
//             data[i].latest_graduation_date?data[i].latest_graduation_date.substring(0,10):"-",
//           ])
//       }

//     }
//   }
//   if(newRows.length > 0){
//     sheetSUs.getRange(sheetSUs.getLastRow()+1,1,newRows.length,newRows[0].length).setValues(newRows)
//   }

// }

function fillSUFormulas() {
  const ss = SpreadsheetApp.openById(
    "1AE6mPcqDDpHXI7nkNphedqAVDPQyLd3RqszxSUDk2jU"
  );
  const backend = ss.getSheetByName("Backend");
  const sheetSUs =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SignUps");
  const sheetSUsData = sheetSUs
    .getRange(1, 1, sheetSUs.getLastRow(), sheetSUs.getLastColumn())
    .getValues();

  var backendIds = backend.getRange(1, 2, backend.getLastRow(), 1).getValues();
  backendIds = backendIds.flat(1);
  var lastRowWithData = sheetSUs.getLastRow();
  while (
    lastRowWithData > 1 &&
    sheetSUs.getRange(lastRowWithData, 17).getValue() === ""
  ) {
    lastRowWithData--;
  }

  // Logger.log(backendIds.length)
  var ids = sheetSUs.getRange(1, 1, sheetSUs.getLastRow(), 1).getValues();
  ids = ids.flat(1);
  // Logger.log(ids.length)

  var backendValues = backend
    .getRange(1, 1, backend.getLastRow(), backend.getLastColumn())
    .getValues();
  var values = sheetSUs
    .getRange(1, 1, sheetSUs.getLastRow(), sheetSUs.getLastColumn())
    .getValues();
  // Logger.log(backendValues)

  var Avals = sheetSUs.getRange("Q1:Q").getValues();
  var Alast = Avals.length;

  // Logger.log(ids[47021])
  // Logger.log(backendIds.indexOf(ids[47021]))
  // Logger.log(Alast)
  let lrow = sheetSUs.getLastRow();
  for (let i = lastRowWithData; i < lrow; i++) {
    if (sheetSUsData[lastRowWithData][0] == "") return;
    // Logger.log(i)
    var row = [];
    var index = backendIds.indexOf(ids[i]);
    //Logger.log(ids[i])
    // Logger.log(index)

    if (index > -1) {
      row.push("Yes");
      // Logger.log("Yes")
      row.push(backendValues[index][21]);
      if (backendValues[index][21] === "PR") {
        row.push(backendValues[index][20]);
      } else {
        row.push("Organic");
      }
      row.push(backendValues[index][6]);
      row.push(backendValues[index][22]);
    } else {
      row.push("No");
      // Logger.log("No")
      row.push(values[i - 1][13]);
      row.push("Organic");
      row.push(values[i - 1][8]);
    }
    // Logger.log(row)
    sheetSUs.getRange(i + 1, 17, 1, row.length).setValues([row]);

    // sheetSUs.getRange(i,17).setFormula(`=IF(ISERROR(MATCH(A${i},'Backend Alpha'!B:B,0)),"No","Yes")`)
    // sheetSUs.getRange(i,18).setFormula(`=IF(Q${i}="No",N${i},VLOOKUP(A${i},'Backend Alpha'!$B:$Z,21,FALSE))`)
    // sheetSUs.getRange(i,19).setFormula(`=IF(R${i}<>"PR","Organic",VLOOKUP(A${i},'Backend Alpha'!$B:$Z,20,FALSE))`)
    // sheetSUs.getRange(i,20).setFormula(`=IF(Q${i}="No",I${i},VLOOKUP(A${i},'Backend Alpha'!$B:$Z,6,FALSE))`)
  }
}
