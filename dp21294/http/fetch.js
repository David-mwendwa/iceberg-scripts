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
  	if (requestURL.match(/^https/i)) {
        requestOptions.agent = new https.Agent({rejectUnauthorized: false, keepAlive: true});
    }
    return await fetchWithCookies(requestURL, requestOptions, "zone-2captcha-country-co")
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({URL: requestURL}, requestOptions),
                response
            };
        });
}


const getListing = async function ({year, canonicalURL, headers}) {
        let customHeaders = {
		    "Cache-Control": "max-age=0",
		    "sec-ch-ua": "\"Google Chrome\";v=\"93\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"93\"",
		    "sec-ch-ua-mobile": "?0",
		    "sec-ch-ua-platform": "\"Windows\"",
		    "Upgrade-Insecure-Requests": "1",
		    "Sec-Fetch-Site": "same-origin",
		    "Sec-Fetch-Mode": "navigate",
		    "Sec-Fetch-Dest": "document",
		    "Referer": `https://dapre.presidencia.gov.co/normativa/proyectos-de-decreto/proyectos-decreto-${year}`,
		    "Accept-Encoding": "gzip, deflate, br"
		};
        let _headers = Object.assign(customHeaders, headers);
        
        let method = "GET";
        let requestOptions = {method, headers: _headers};
        let requestURL = `https://dapre.presidencia.gov.co/normativa/proyectos-de-decreto/proyectos-decreto-${year}`;
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
        return responsePage;
    };


async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const match = /proyectos-decreto-(\d+)$/i.exec(canonicalURL);
    if (match) {
        let year = parseInt(match[1])
        return [await getListing({year, canonicalURL, headers})]
      
    } else {
        const response = await defaultFetchURL({canonicalURL, headers});

		let out = [];

        if (response && response.length && response[0].response.ok && /\.zip\b/i.test(canonicalURL)) {
            out = await unzip({request: response[0].request, response: response[0].response});
            let accepted = [];
            let $ = cheerio.load("<html lang='en'><body><h2>Contents</h2><ul id='list'></ul></body></html>");
            let ul = $("ul#list");
            for (let i = 0; i < out.length; i++) {
                let responsePage = out[i];
                responsePage.canonicalURL = encodeURI(decodeURI(responsePage.canonicalURL));
                ul.append(`<li><a href="${responsePage.canonicalURL}">${responsePage.canonicalURL}</a></li>\n`);
                let contentType = responsePage.response.headers.get("content-type");
                if(/empty|spreadsheet|excel/i.test(contentType)){
                    continue;
                }
                if (/\.pdf$/i.test(responsePage.canonicalURL)) {
                    responsePage.response.headers.set('content-type', "application/pdf");
                } else if (/\.doc$/i.test(responsePage.canonicalURL)) {
                    responsePage.response.headers.set('content-type', "application/msword");
                } else if (/\.docx$/i.test(responsePage.canonicalURL)) {
                    responsePage.response.headers.set('content-type', "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
                } else if (/\.html?$/i.test(responsePage.canonicalURL)) {
                    responsePage.response.headers.set('content-type', "text/html");
                } else if (/\.txt$/i.test(responsePage.canonicalURL)) {
                    responsePage.response.headers.set('content-type', "text/plain");
                } else if (/\.xml$/i.test(responsePage.canonicalURL)) {
                    responsePage.response.headers.set('content-type', "text/xml");
                } else if (/\.json$/i.test(responsePage.canonicalURL)) {
                    responsePage.response.headers.set('content-type', "application/json");
                } else {
                    continue;
                }
                accepted.push(responsePage);
            }
            out = accepted;
            out.push(simpleResponse({canonicalURL, mimeType:"text/html", responseBody: $.html()}))
        } else {
            return response;
        }
        return out;
    }
}