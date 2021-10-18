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
        let limits = JSON.stringify({lowerLimit, upperLimit})
  		responsePage.response = new fetch.Response(limits, responsePage.response);
    	responsePage.response.headers.set('content-type', 'application/json');
        return responsePage;
    };

    
// Deals with documents from 2014 - 2021
const getDocumentsByYear = async function ({year, canonicalURL, headers}) {
  		let responsePage = await getLimits({year, canonicalURL, headers})
        let {lowerLimit, upperLimit} = JSON.parse(await responsePage.response.text())
        let pageOnes = []
        for (let i = lowerLimit; i <= upperLimit; i++) {
            pageOnes.push(`https://sirena.corantioquia.gov.co/esirena/CtrlPublicaciones?ctrlAction=C&year=${year}&numero=${i}&pagina=1`)
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
  		let requestURL = canonicalURL.replace(/&year=\d+/g, '')
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
        return responsePage;
    };


async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    } 
  	if (/doc=(\d+)$/i.test(canonicalURL)) {
        let responsePage = await fetchPage({canonicalURL, headers});
        responsePage.response.headers.set('content-type', 'application/pdf');
        return [responsePage];
    }  
    const match = canonicalURL.match(/\?year=(\d+)$/i);
  	const isPagination = canonicalURL.match(/\?ctrlAction=C&year=(\d+)&numero=(\d+)&pagina=(\d+)$/i);
  	const isUpto2015 = canonicalURL.match(/&item=(\d+)$/i)
    if (match) {
        let year = parseInt(match[1]);
        return [await getDocumentsByYear({year, canonicalURL, headers})]
      
    } else if (isPagination) {
    	let numero = isPagination[1];
      	let page = isPagination[2]
        return [await getListing({numero, page, canonicalURL, headers})];
               
    } else {
        return defaultFetchURL({canonicalURL, headers});
    }
}