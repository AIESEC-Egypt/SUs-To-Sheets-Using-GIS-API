function dataExtraction_Applications(query) {
  var requestOptions = {
    method: "post",
    payload: query,
    contentType: "application/json",
    headers: {
      access_token: "",
    },
  };
  var response = UrlFetchApp.fetch(
    `https://gis-api.aiesec.org/graphql?access_token=${requestOptions["headers"]["access_token"]}`,
    requestOptions
  );
  console.log(response.getContentText());
  var recievedDate = JSON.parse(response.getContentText())["data"][
    "allOpportunityApplication"
  ];
  return recievedDate;
}

function applicationsLiveUpdating() {
  var today = new Date();
  var numberOfDays = 24 * 60 * 60 * 1000 * 5; // 5 is the number of days
  var today = today.setTime(today.getTime() - numberOfDays);
  var startDate = "30/01/2024"; //Utilities.formatDate(new Date(today), "GMT+2", "dd/MM/yyyy");
  var endDate = "30/06/2024";

  var sheetOGXApplications =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("OGX Applications");
  var page_number = 1;
  var allData = [];
  do {
    var querySignups = `query {\n\tallOpportunityApplication(\n\t\tfilters: {\n\t\t\tcreated_at: { from: \"${startDate}\", to: \"${endDate}\"}\n\t\t\tperson_home_mc: 1609\n\t\t\tsort:created_at\n\t\t}\n\t\tper_page: 1000\n\t\tpage:${page_number}\n\t) {\n\t\tpaging {\n\t\t\ttotal_items\n\t\t\ttotal_pages\n\t\t\tcurrent_page\n\t\t}\n\n\t\tdata {\n\t\tid\n\t\tperson {\n\t\t\t\tcreated_at\n\t\t\t\tid\n\t\t\t\tfull_name\n\t\t\t\tcontact_detail {\n\t\t\t\t\tphone\n\t\t\t\t}\n\t\t\t\temail\n\t\t\t\tgender\n\t\t\t\tdob\n\t\t\t\tstatus\n\t\t\t\tacademic_experiences {\n\t\t\t\t\tbackgrounds {\n\t\t\t\t\t\tname\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\tperson_profile {\n\t\t\t\t\tselected_programmes\n\t\t\t\t}\n\t\t\t\thome_lc {\n\t\t\t\t\tname\n\t\t\t\t}\n\t\t\t\thome_mc {\n\t\t\t\t\tname\n\t\t\t\t}\n\t\t\t\tlc_alignment {\n\t\t\t\t\tkeywords\n\t\t\t\t}\n\t\t\t\tis_aiesecer\n\t\t\t\treferral_type\n\t\t\t}\n\n\t\t\topportunity {\n\t\t\t\tid\n\t\t\t\ttitle\n\t\t\t\thome_lc {\n\t\t\t\t\tname\n\t\t\t\t}\n\t\t\t\thome_mc {\n\t\t\t\t\tname\n\t\t\t\t}\n\t\t\t\tprogramme {\n\t\t\t\t\tshort_name_display\n\t\t\t\t}\n\t\t\t\tsub_product {\n\t\t\t\t\tname\n\t\t\t\t}\n\t\t\t\topportunity_duration_type {\n\t\t\t\t\tduration_type\n\t\t\t\t}\n\t\t\t}\n\n\t\tstatus\n\tcreated_at\n\t\t\tdate_matched\n\t\t\tdate_approved\n\t\t\tdate_realized\n\t\t\tdate_approval_broken\n\t\t\texperience_end_date\n\t\t\tslot {\n\t\t\t\tstart_date\n\t\t\t\tend_date\n\t\t\t}\n\t\t\tupdated_at\n\t\t}\n\t}\n}\n`;
    var query = JSON.stringify({ query: querySignups });
    var data = dataExtraction_Applications(query);
    if (data != null) {
      if (data.length != 0) {
        allData.push(data.data);
        page_number++;
      }
    } else {
      break;
    }
    Logger.log(data.length);
  } while (data.paging.current_page <= data.paging.total_pages);

  var newRows = [];
  var ids = sheetOGXApplications
    .getRange(1, 1, sheetOGXApplications.getLastRow(), 1)
    .getValues();
  ids = ids.flat(1);
  for (let data of allData) {
    for (let i = 1; i < data.length; i++) {
      Logger.log(i);
      if (ids.indexOf(parseInt(data[i].id)) < 0) {
        newRows.push([
          data[i].id,
          data[i].person.created_at.substring(0, 10),
          data[i].person.id,
          data[i].person.full_name,
          data[i].person.contact_detail
            ? data[i].person.contact_detail.phone
            : "-",
          data[i].person.email,
          data[i].person.gender,
          data[i].person.dob,
          data[i].person.status,
          "",
          data[i].person.person_profile
            ? changeProductCode(
                data[i].person.person_profile.selected_programmes
              )
            : "-",
          data[i].person.home_lc.name,
          data[i].person.home_mc.name,
          data[i].person.lc_alignment
            ? data[i].person.lc_alignment.keywords
            : "-",
          data[i].person.is_aiesecer == false ? "No" : "Yes",
          data[i].person.referral_type,

          data[i].opportunity.id,
          data[i].opportunity.title,
          data[i].opportunity.home_lc.name,
          data[i].opportunity.home_mc.name,
          data[i].opportunity.programme.short_name_display,
          data[i].opportunity.sub_product
            ? data[i].opportunity.sub_product.name
            : data[i].opportunity.programme.short_name_display == "GTe"
            ? "Education"
            : "-",
          data[i].opportunity.opportunity_duration_type.duration_type,
          data[i].status,

          data[i].created_at ? data[i].created_at.substring(0, 10) : "",
          data[i].date_matched ? data[i].date_matched.substring(0, 10) : "",
          data[i].date_approved ? data[i].date_approved.substring(0, 10) : "",
          data[i].date_realized ? data[i].date_realized.substring(0, 10) : "",
          data[i].date_approval_broken
            ? data[i].date_approval_broken.substring(0, 10)
            : "",
          data[i].experience_end_date
            ? data[i].experience_end_date.substring(0, 10)
            : "",
          data[i].slot ? data[i].slot.start_date.substring(0, 10) : "",
          data[i].slot ? data[i].slot.end_date.substring(0, 10) : "",
          data[i].status == "realization_broken"
            ? data[i].updated_at.substring(0, 10)
            : "",
        ]);
      } else {
        var row = [];

        row.push([
          data[i].id,
          data[i].person.created_at.substring(0, 10),
          data[i].person.id,
          data[i].person.full_name,
          data[i].person.contact_detail
            ? data[i].person.contact_detail.phone
            : "-",
          data[i].person.email,
          data[i].person.gender,
          data[i].person.dob,
          data[i].person.status,
          "",
          data[i].person.person_profile
            ? changeProductCode(
                data[i].person.person_profile.selected_programmes
              )
            : "-",
          data[i].person.home_lc.name,
          data[i].person.home_mc.name,
          data[i].person.lc_alignment
            ? data[i].person.lc_alignment.keywords
            : "-",
          data[i].person.is_aiesecer == false ? "No" : "Yes",
          data[i].person.referral_type,

          data[i].opportunity.id,
          data[i].opportunity.title,
          data[i].opportunity.home_lc.name,
          data[i].opportunity.home_mc.name,
          data[i].opportunity.programme.short_name_display,
          data[i].opportunity.sub_product
            ? data[i].opportunity.sub_product.name
            : data[i].opportunity.programme.short_name_display == "GTe"
            ? "Education"
            : "-",
          data[i].opportunity.opportunity_duration_type.duration_type,
          data[i].status,

          data[i].created_at ? data[i].created_at.substring(0, 10) : "-",
          data[i].date_matched ? data[i].date_matched.substring(0, 10) : "-",
          data[i].date_approved ? data[i].date_approved.substring(0, 10) : "-",
          data[i].date_realized ? data[i].date_realized.substring(0, 10) : "-",
          data[i].date_approval_broken
            ? data[i].date_approval_broken.substring(0, 10)
            : "-",
          data[i].experience_end_date
            ? data[i].experience_end_date.substring(0, 10)
            : "-",
          data[i].slot ? data[i].slot.start_date.substring(0, 10) : "-",
          data[i].slot ? data[i].slot.end_date.substring(0, 10) : "-",
          data[i].status == "realization_broken"
            ? data[i].updated_at.substring(0, 10)
            : "-",
        ]);
        sheetOGXApplications
          .getRange(ids.indexOf(parseInt(data[i].id)) + 1, 1, 1, row[0].length)
          .setValues(row);
      }
    }
  }
  if (newRows.length > 0) {
    sheetOGXApplications
      .getRange(
        sheetOGXApplications.getLastRow() + 1,
        1,
        newRows.length,
        newRows[0].length
      )
      .setValues(newRows);
  }
}

function findIndex_1stopp(opps) {
  var dates = {
    convert: function (d) {
      // Converts the date in d to a date-object. The input can be:
      //   a date object: returned without modification
      //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
      //   a number     : Interpreted as number of milliseconds
      //                  since 1 Jan 1970 (a timestamp)
      //   a string     : Any format supported by the javascript engine, like
      //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
      //  an object     : Interpreted as an object with year, month and date
      //                  attributes.  **NOTE** month is 0-11.
      return d.constructor === Date
        ? d
        : d.constructor === Array
        ? new Date(d[0], d[1], d[2])
        : d.constructor === Number
        ? new Date(d)
        : d.constructor === String
        ? new Date(d)
        : typeof d === "object"
        ? new Date(d.year, d.month, d.date)
        : NaN;
    },
    compare: function (a, b) {
      // Compare two dates (could be of any type supported by the convert
      // function above) and returns:
      //  -1 : if a < b
      //   0 : if a = b
      //   1 : if a > b
      // NaN : if a or b is an illegal date
      // NOTE: The code inside isFinite does an assignment (=).
      return isFinite((a = this.convert(a).valueOf())) &&
        isFinite((b = this.convert(b).valueOf()))
        ? (a > b) - (a < b)
        : NaN;
    },
    inRange: function (d, start, end) {
      // Checks if date in d is between dates in start and end.
      // Returns a boolean or NaN:
      //    true  : if d is between start and end (inclusive)
      //    false : if d is before start or after end
      //    NaN   : if one or more of the dates is illegal.
      // NOTE: The code inside isFinite does an assignment (=).
      return isFinite((d = this.convert(d).valueOf())) &&
        isFinite((start = this.convert(start).valueOf())) &&
        isFinite((end = this.convert(end).valueOf()))
        ? start <= d && d <= end
        : NaN;
    },
  };
  var first = opps[0].created_at.toString().substring(0, 10);
  var index = 0;
  for (let i = 1; i < opps.length; i++) {
    var output = dates.compare(
      opps[i].created_at.toString().substring(0, 10),
      first
    );
    if (output == -1) {
      first = opps[i].created_at.toString().substring(0, 10);
      index = i;
    } else if (output == 0) {
      first = opps[i].created_at.toString().substring(0, 10);
      index = i;
    }
  }

  return index;
}

function changeProductCode(num) {
  var product = "";
  if (num == "7") product = "GV New";
  else if (num == "8") product = "GTa";
  else if (num == "9") product = "GTe";
  else if (num == "1") product = "GV Old";
  else if (num == "2") product = "GT";
  else if (num == "5") product = "GE";

  return product;
}
