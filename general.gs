function dataExtraction_Signups(query) {
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
  var recievedDate = JSON.parse(response.getContentText())["data"]["people"];
  return recievedDate;
}
