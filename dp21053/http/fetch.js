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
        })
}

const listingPage = async function ({canonicalURL, headers}) {
    	let customHeaders = {
		    "Cache-Control": "max-age=0",
		    "sec-ch-ua": "\"Google Chrome\";v=\"93\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"93\"",
		    "sec-ch-ua-mobile": "?0",
		    "sec-ch-ua-platform": "\"Windows\"",
		    "Upgrade-Insecure-Requests": "1",
		    "Sec-Fetch-Site": "cross-site",
		    "Sec-Fetch-Mode": "navigate",
		    "Sec-Fetch-User": "?1",
		    "Sec-Fetch-Dest": "document",
		    "Referer": "https://www.google.com/",
		    "Accept-Encoding": "gzip, deflate, br"
		};
        let _headers = Object.assign(customHeaders, headers);
        let method = "GET";
        let requestOptions = {method, headers: _headers};
        let requestURL = 'https://www.medellin.gov.co/irj/portal/medellin?NavigationTarget=contenido%2F394-Proyectos-normativos';
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
        let html = await responsePage.response.text();
  		//let {html} = await puppeteerFetch({canonicalURL, headers});
  		let $ = cheerio.load(html, {decodeEntities: false})
        let urls = []
        $('div[id="contentAreaDiv"] a[href*="bit.ly"]').each(function(){
          	let href = $(this).attr('href')
        	urls.push(href)
        })
  		requestOptions.redirect = "manual";
  		for(let i=0; i<urls.length; i++) {
            let docURL = urls[i];
          	if (!/https?/.test(docURL)) {
              	//console.log('-------------', docURL)
              	docURL = `http://${docURL}`
                //console.log('***********', docURL)
            	//docURL ? url.resolve('http://bit.ly/2G8EeGB', docURL) : docURL;
            }
          	console.log(`resolving ${docURL}`);
            let responsePage = await fetchPage({canonicalURL: docURL, requestURL:docURL, requestOptions});
          	if (responsePage && responsePage.response && responsePage.response.status === 301) {
                let location = responsePage.response.headers.get("location");
              	console.log(`resolved to ${location}`);
                location = location ? url.resolve(requestURL, location) : location;
              	let a = $(`div[id="contentAreaDiv"] a[href*="${urls[i]}"]`);
              	a.attr('href', location);
              	a.attr('bitlyhref', docURL);
            }         	
        }
  		//responsePage.response = new fetch.Response($.html(), responsePage.response);
  		//return responsePage;
  		const data = $("div[id='contentAreaDiv']").html();
		return simpleResponse({mimeType:"text/html", responseBody:data, locale:"es", canonicalURL})
  		
};

async function puppeteerFetch({canonicalURL, headers}) {
    const page = await puppeteerManager.newPage();
    await page.goto(canonicalURL, {
        waitFor: "networkidle0",
        timeout: 30000
    }).catch(e => console.error(`Puppeteer still loading page ${canonicalURL}`));
    let html = await page.evaluate(() => document.documentElement.outerHTML);
    const $ = cheerio.load(html, {decodeEntities: false});
    $('base, script, iframe').remove();
    html = $.html();
    return {html, response: simpleResponse({
        canonicalURL,
        mimeType: "text/html",
        responseBody: html,
    })};
}

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
  	if (/pdf/i.test(canonicalURL)) {
        let responsePage = await fetchPage({canonicalURL, headers});
        responsePage.response.headers.set('content-type', 'application/pdf');
        return [responsePage];
    }
  
    const isListing = /\/medellin\?NavigationTarget=contenido.+394-Proyectos-normativos/i.exec(canonicalURL)
    if (isListing) {
    	return [await listingPage({canonicalURL, headers})]
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
