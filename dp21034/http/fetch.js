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


const getHome = async function ({canonicalURL, headers}) {
        let customHeaders = {
		    "authority": "mincultura.gov.co",
		    "cache-control": "max-age=0",
		    "sec-ch-ua": "\"Google Chrome\";v=\"93\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"93\"",
		    "sec-ch-ua-mobile": "?0",
		    "sec-ch-ua-platform": "\"Windows\"",
		    "upgrade-insecure-requests": "1",
		    "sec-fetch-site": "cross-site",
		    "sec-fetch-mode": "navigate",
		    "sec-fetch-user": "?1",
		    "sec-fetch-dest": "document",
		    "if-modified-since": "Sat, 25 Sep 2021 05:39:13 GMT",
		    "Accept-Encoding": "gzip, deflate, br"
		};
        let _headers = Object.assign(customHeaders, headers);
        
        let method = "GET";
        let requestOptions = {method, headers: _headers};
        let requestURL = 'https://mincultura.gov.co/ministerio/transparencia-y-acceso-a-informacion-publica/publicidad%20de%20proyectos%20de%20especificos%20de%20regulacion/Paginas/default.aspx';
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
        return responsePage;
    };


const getEvent = async function ({canonicalURL, headers}) {
        let customHeaders = {
		    "authority": "mincultura.gov.co",
		    "sec-ch-ua": "\"Google Chrome\";v=\"93\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"93\"",
		    "sec-ch-ua-mobile": "?0",
		    "sec-ch-ua-platform": "\"Windows\"",
		    "upgrade-insecure-requests": "1",
		    "sec-fetch-site": "same-origin",
		    "sec-fetch-mode": "navigate",
		    "sec-fetch-user": "?1",
		    "sec-fetch-dest": "document",
		    "referer": "https://mincultura.gov.co/ministerio/transparencia-y-acceso-a-informacion-publica/publicidad%20de%20proyectos%20de%20especificos%20de%20regulacion/Paginas/default.aspx",
		    "Accept-Encoding": "gzip, deflate, br"
		};
        let _headers = Object.assign(customHeaders, headers);
        
        let method = "GET";
        let requestOptions = {method, headers: _headers};
  		let requestURL = canonicalURL;
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
        return responsePage;
    };

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const match = canonicalURL.match(/default\.asp$/i);
  	const isEvent = canonicalURL.match(/\.aspx$/i);
    if (match) {
        return [await getHome({canonicalURL, headers})]
    } else if (isEvent) {
        return [await getEvent({canonicalURL, headers})]   
    } else {
        return defaultFetchURL({canonicalURL, headers});
    }
}