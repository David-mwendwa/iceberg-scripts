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


async function fetchPage({canonicalURL, requestURL, requestOptions, headers, noProxy=false}) {
    if (!requestOptions) requestOptions = {method: "GET", headers};
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL
    return await fetchWithCookies(requestURL, requestOptions, noProxy ? "no-proxy" : null)
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
  	if(/^http:/i.test(canonicalURL)){
      	let requestURL = canonicalURL.replace(/^http:/i, "https:");
        return [await fetchPage({canonicalURL, headers, requestURL})];
    }
  
  	if(/https:\/\/dadsa\.gov\.co\/index\.php\/resoluciones-internas\//i.test(canonicalURL)){
      	let requestURL = canonicalURL.replace(/^http:/i, "https:");
        let responsePage = await fetchPage({canonicalURL, headers, requestURL});
      	let data = await responsePage.response.text();
      	const $ = cheerio.load(data)
        $("a[href*='pdf']").each(function () {
            let href = $(this).attr('href');
          	if (/pdfhttps?/ig.test(href)) {
            	href = /(https?.+pdf)http/g.exec(href)
              	href = href && href[1]
            }
            href = href && encodeURI(decodeURI(href))
      		$(this).attr('href', href)
        })
        responsePage.response = new fetch.Response($.html(), responsePage.response);
      	return [responsePage]
    }
  	return defaultFetchURL({canonicalURL, headers}); 	
}