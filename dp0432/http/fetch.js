"use strict";

const querystring = require("querystring");
const FormData = require("form-data");
const moment = require('moment');
const url = require('url');
const cheerio = require('cheerio');
const fetch = require('node-fetch');//to reconstruct response fetch.Response(html,....)

const fetcher = require("../../utils/fetcher");
let fetchWithCookies = fetcher.fetchWithCookies;
// let fetch = fetcher.fetch;//only use fetchWithCookies or defaultFetchURL for Tests
let defaultFetchURL = fetcher.defaultFetchURL;


let map = {};

function setSharedVariable(key, value) { map[key] = value; }

function getSharedVariable(key) {return map[key];}


async function fetchPage({canonicalURL, requestURL, requestOptions, headers}) {
      if (!requestOptions) requestOptions = {method: "GET", headers};
      if (!canonicalURL) canonicalURL = requestURL;
      if (!requestURL) requestURL = canonicalURL;
      return await fetchWithCookies(requestURL, requestOptions)
          .then(response => {
              return {
                  canonicalURL,
                  request: Object.assign({URL: requestURL}, requestOptions),
                  response
              };
          });
}


const getHome = async function ({argument, canonicalURL, headers}) {
      let customHeaders = {
        "authority": "www.csol.ie",
        "cache-control": "max-age=0",
        "upgrade-insecure-requests": "1",
        "sec-fetch-site": "none",
        "sec-fetch-mode": "navigate",
        "sec-fetch-user": "?1",
        "sec-fetch-dest": "document",
        "sec-ch-ua": "\"Google Chrome\";v=\"95\", \"Chromium\";v=\"95\", \";Not A Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
      };
      let _headers = Object.assign(customHeaders, headers);

      let method = "GET";
      let requestOptions = {method, headers: _headers};
      let requestURL = 'https://www.csol.ie/ccms/highCourtSearch.html?execution=e1s1';
      let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
      return responsePage;
};


const getProceedings = async function ({argument, canonicalURL, headers}) {
      let customHeaders = {
        "authority": "www.csol.ie",
        "sec-ch-ua": "\"Google Chrome\";v=\"95\", \"Chromium\";v=\"95\", \";Not A Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-site": "same-origin",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty",
        "referer": "https://www.csol.ie/ccms/web/high-court-search/search",
        "Accept-Encoding": "gzip, deflate, br"
      };
      let _headers = Object.assign(customHeaders, headers);

      let method = "GET";
      let requestOptions = {method, headers: _headers};
      let requestURL = 'https://www.csol.ie/ccms/api/high-court-search/proceedings';
      let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
      let proceedings = JSON.parse(await responsePage.response.text());
      proceedings = JSON.stringify({proceedings: proceedings})
      responsePage.response = new fetch.Response(proceedings, responsePage.response);
      responsePage.response.headers.set('content-type', 'application/json');
      return responsePage;
};


const generateListingURLs = async function({year, canonicalURL, headers}) {
      let responsePage = await getProceedings({canonicalURL, headers})
      let {proceedings} = JSON.parse(await responsePage.response.text())
      let listing = []
      proceedings.forEach(item => {
        listing.push(`https://www.csol.ie/ccms/api/high-court-search/search?year=${year}&proceedings=${item.proceedingType}`)
      })
      let lJson = JSON.stringify({listing: listing})
      responsePage.response = new fetch.Response(lJson, responsePage.response);
      responsePage.response.headers.set('content-type', 'application/json');
      return responsePage;
}


const getListing = async function ({year, proceedings, canonicalURL, headers}) {
      let customHeaders = {
        "authority": "www.csol.ie",
        "sec-ch-ua": "\"Google Chrome\";v=\"95\", \"Chromium\";v=\"95\", \";Not A Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-site": "same-origin",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty",
        "referer": "https://www.csol.ie/ccms/web/high-court-search/search",
        "Accept-Encoding": "gzip, deflate, br"
      };
      let _headers = Object.assign(customHeaders, headers);      
      let method = "GET";
      let requestOptions = {method, headers: _headers};
      let requestURL = `https://www.csol.ie/ccms/api/high-court-search/search?year=${year}&proceedings=${proceedings}`;
      let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
      let results = JSON.parse(await responsePage.response.text());
      results = JSON.stringify({results: results})
      responsePage.response = new fetch.Response(results, responsePage.response);
      responsePage.response.headers.set('content-type', 'application/json');
      return responsePage; 		
};


const getDocument = async function ({argument, canonicalURL, headers}) {
      let customHeaders = {
        "authority": "www.csol.ie",
        "sec-ch-ua": "\"Google Chrome\";v=\"95\", \"Chromium\";v=\"95\", \";Not A Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-site": "same-origin",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty",
        "referer": "https://www.csol.ie/ccms/web/high-court-search/case-details/2020/12/CA",
        "Accept-Encoding": "gzip, deflate, br"
      };
      let _headers = Object.assign(customHeaders, headers);

      let method = "GET";
      let requestOptions = {method, headers: _headers};
      let requestURL = 'https://www.csol.ie/ccms/api/high-court-search/case-details?year=2020&caseRecordId=12&proceedingType=CA';
      let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
      return responsePage;
};


async function fetchURL({canonicalURL, headers}) {
      if (/https?:.*https?:/i.test(canonicalURL)) {
          console.error("Rejecting URL", canonicalURL, `returning [];`);
          return [];
      }
      const isHome = canonicalURL.match(/https:\/\/www\.csol\.ie\/ccms\/highCourtSearch\.html\?execution=e1s1/i);
      const isSearch = canonicalURL.match(/\?year=(\d+)$/)
      const isProceedings = canonicalURL.match(/https:\/\/www\.csol\.ie\/ccms\/api\/high-court-search\/proceedings/)
      const isListing = canonicalURL.match(/\?year=(\d+)&proceedings=(.+)/i);
      if (isHome) {
          return [await getHome({canonicalURL, headers})]

      } else if (isSearch) {
          let year = parseInt(isSearch[1])
          return [await generateListingURLs({year, canonicalURL, headers})]

      } else if (isProceedings) {
          return [await getProceedings({canonicalURL, headers})]

      } else if (isListing) {
          let year = parseInt(isListing[1])
          let proceedings = isListing[2]
          return [await getListing({year, proceedings, canonicalURL, headers})]

      } else {
          return defaultFetchURL({canonicalURL, headers});
      }
}