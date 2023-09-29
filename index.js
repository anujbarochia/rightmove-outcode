const csvtojson = require("csvtojson");
const axios = require("axios");
const fs = require("fs");

const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const csvWriter = createCsvWriter({
  path: "data.csv",
  header: [
    { id: "previous", title: "Previous Outcode" },
    { id: "new", title: "New Outcode" },
  ],
});

const baseUrl =
  "https://www.rightmove.co.uk/property-for-sale/search.html?searchLocation=WC2N&useLocationIdentifier=false&previousSearchLocation=";
const csvFilePath = "outcodes.csv";

(async () => {
  const json = await csvtojson().fromFile(csvFilePath);
  const responses = [];

  for (const row of json) {
    const param = row.Outcode;

    const url = baseUrl.replace("WC2N", param);

    try {
      const response = await axios.get(url);
      // const headers = response.headers;
      const redirectedUrl = response.request.res.responseUrl;
      const urlObject = new URL(redirectedUrl);
      const identifier = urlObject.searchParams.get("locationIdentifier");
      const newOutcode = identifier.split("^")[1];
      responses.push({ previous: param, new: newOutcode });
      // const newObj = { [param]: newOutcode };
      console.log(`Postcode for ${param}: ${newOutcode} `);
    } catch (error) {
      console.error(
        `Error fetching data for parameter ${param}: ${error.message}: ${url}:`
      );
    }
    // console.log(`response ${responses}`);
  }
  await csvWriter
    .writeRecords(responses)
    .then(() => console.log("CSV record written successfully"))
    .catch((error) => console.error("Error writing CSV record:", error));
})();
