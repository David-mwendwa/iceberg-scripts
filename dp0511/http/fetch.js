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

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
  	const match = canonicalURL.match(/https:\/\/www\.oic\.ie\/decisions\/.+FOI.+Act.+\d{4}/)
    if (match) {
      	const res = await fetchPage({canonicalURL, headers});
        let data = await res.response.text();
      	const $ = cheerio.load(data)
        $('#pagination > ul > li').each(function () {
          $(this).find('a').each(function () {
            let paginationURL = $(this).attr('href');
            let match = /(?<==)\d+/.exec(paginationURL)
            let page = match && match[0] || 1
            let newPaginationURL = `https://www.oic.ie/decisions/index.xml?page=${page}&query=&section=&subsection=&acts=FOI Act 2014&Language=en`
            $(this).attr('href', newPaginationURL)
          })
        })
      res.response = new fetch.Response($.html(), res.response);
      return [res];
    }else {
    	return [await fetchPage({canonicalURL, headers})];
    }
}
