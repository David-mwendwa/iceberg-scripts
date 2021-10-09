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


const getLimits = async function ({year, canonicalURL, headers}) {
        let customHeaders = {
		    "sec-ch-ua": "\"Chromium\";v=\"94\", \"Google Chrome\";v=\"94\", \";Not A Brand\";v=\"99\"",
		    "sec-ch-ua-mobile": "?0",
		    "sec-ch-ua-platform": "\"Windows\"",
		    "Sec-Fetch-Site": "same-origin",
		    "Sec-Fetch-Mode": "cors",
		    "Sec-Fetch-Dest": "empty",
		    "Referer": "https://sirena.corantioquia.gov.co/esirena/CtrlPublicaciones",
		    "Accept-Encoding": "gzip, deflate, br"
		};
        let _headers = Object.assign(customHeaders, headers);        
        let method = "GET";
        let requestOptions = {method, headers: _headers};
        let requestURL = 'https://sirena.corantioquia.gov.co/esirena/CtrlPublicaciones?ctrlAction=C&doAction=A&pagina=1';
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  		let json = await responsePage.response.text()
        let obj = JSON.parse(json)
        let total = obj && obj.boletines && obj.boletines[year] && obj.boletines[year].length;
        let lowerLimit = obj && obj.boletines && obj.boletines[year] && obj.boletines[year][0].numero
        let upperLimit = obj && obj.boletines && obj.boletines[year] && obj.boletines[year][total-1].numero;
  		let limits = {lowerLimit, upperLimit}
        return limits
    };

// Deals with documents from 2014 - 2021
const getDocumentsByYear = async function ({year, canonicalURL, headers}) {
  		let {lowerLimit, upperLimit} = await getLimits({year, canonicalURL, headers})
        //throw(`lower: ${lowerLimit}, upper: ${upperLimit}`)
        let requestURL = `https://sirena.corantioquia.gov.co/esirena/CtrlPublicaciones?agno=${year}&ctrlAction=C&pagina=1`;
        let responsePage = await fetchPage({canonicalURL: requestURL, headers});
        let pageOnes = []
        for (let i = lowerLimit; i <= upperLimit; i++) {
            pageOnes.push(`https://sirena.corantioquia.gov.co/esirena/CtrlPublicaciones?ctrlAction=C&numero=${i}&pagina=1`)
        }
        let uJson = JSON.stringify({"pageOnes": pageOnes})
  		responsePage.response = new fetch.Response(uJson, responsePage.response);
    	responsePage.response.headers.set('content-type', 'application/json');
        return responsePage;
    };

const getListing = async function ({numero, page, canonicalURL, headers}) {
        let customHeaders = {
		    "sec-ch-ua": "\"Chromium\";v=\"94\", \"Google Chrome\";v=\"94\", \";Not A Brand\";v=\"99\"",
		    "sec-ch-ua-mobile": "?0",
		    "sec-ch-ua-platform": "\"Windows\"",
		    "Sec-Fetch-Site": "same-origin",
		    "Sec-Fetch-Mode": "cors",
		    "Sec-Fetch-Dest": "empty",
		    "Referer": "https://sirena.corantioquia.gov.co/esirena/CtrlPublicaciones",
		    "Accept-Encoding": "gzip, deflate, br"
		};
        let _headers = Object.assign(customHeaders, headers);
        
        let method = "GET";
        let requestOptions = {method, headers: _headers};
        let requestURL = `https://sirena.corantioquia.gov.co/esirena/CtrlPublicaciones?ctrlAction=C&numero=${numero}&pagina=${page}`;
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
        return responsePage;
    };

// Fetch documents from 2004 to 2015
const getUntil2015Home = async function ({item, canonicalURL, headers}) {
        let customHeaders = {
		    "Cache-Control": "max-age=0",
		    "sec-ch-ua": "\"Chromium\";v=\"94\", \"Google Chrome\";v=\"94\", \";Not A Brand\";v=\"99\"",
		    "sec-ch-ua-mobile": "?0",
		    "sec-ch-ua-platform": "\"Windows\"",
		    "Upgrade-Insecure-Requests": "1",
		    "Sec-Fetch-Site": "same-origin",
		    "Sec-Fetch-Mode": "navigate",
		    "Sec-Fetch-User": "?1",
		    "Sec-Fetch-Dest": "document",
		    "Referer": "https://www.corantioquia.gov.co/Paginas/VerContenido.aspx?List=MenuInferior&item=107",
		    "Accept-Encoding": "gzip, deflate, br"
		};
        let _headers = Object.assign(customHeaders, headers);        
        let method = "GET";
        let requestOptions = {method, headers: _headers};
        let requestURL = `https://www.corantioquia.gov.co/Paginas/VerContenido.aspx?List=MenuInferior&item=${item}`;
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  		//throw(canonicalURL)
        return responsePage;
    };


const getUntil2015Documents = async function ({item, canonicalURL, headers}) {
  		await getUntil2015Home({item, canonicalURL})
        let customHeaders = {
		    "sec-ch-ua": "\"Chromium\";v=\"94\", \"Google Chrome\";v=\"94\", \";Not A Brand\";v=\"99\"",
		    "X-Requested-With": "XMLHttpRequest",
		    "sec-ch-ua-mobile": "?0",
		    "sec-ch-ua-platform": "\"Windows\"",
		    "Origin": "https://www.corantioquia.gov.co",
		    "Sec-Fetch-Site": "same-origin",
		    "Sec-Fetch-Mode": "cors",
		    "Sec-Fetch-Dest": "empty",
		    "Referer": "https://www.corantioquia.gov.co/Paginas/VerContenido.aspx?List=MenuInferior&item=356",
		    "Accept-Encoding": "gzip, deflate, br"
		};
        let _headers = Object.assign(customHeaders, headers);
        const data = {};
		let body = querystring.stringify(data);
        let method = "POST";
        let requestOptions = {method, body, headers: _headers};
        let requestURL = 'https://www.corantioquia.gov.co/_vti_bin/Lists.asmx';
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  		//throw(item)
        return responsePage;
    };


async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const match = canonicalURL.match(/\?year=(\d+)$/i);
  	const isPagination = canonicalURL.match(/\?ctrlAction=C&numero=(\d+)&pagina=(\d+)$/i);
  	const isUpto2015 = canonicalURL.match(/&item=(\d+)$/i)
    if (match) {
        let year = parseInt(match[1]);
        return [await getDocumentsByYear({year, canonicalURL, headers})]
      
    } else if (isPagination) {
    	let numero = isPagination[1];
      	let page = isPagination[2]
        return [await getListing({numero, page, canonicalURL, headers})];
      
    } else if (isUpto2015) {
      	let item = isUpto2015[1]
      	return [await getUntil2015Documents({item, canonicalURL, headers})];
               
    } else {
        return defaultFetchURL({canonicalURL, headers});
    }
}