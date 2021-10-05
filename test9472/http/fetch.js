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




const method0 = async function ({argument, canonicalURL, headers}) {
        let customHeaders = {
		    "sec-ch-ua": "\"Chromium\";v=\"88\", \"Google Chrome\";v=\"88\", \";Not A Brand\";v=\"99\"",
		    "sec-ch-ua-mobile": "?0",
		    "Upgrade-Insecure-Requests": "1",
		    "Sec-Fetch-Site": "cross-site",
		    "Sec-Fetch-Mode": "navigate",
		    "Sec-Fetch-User": "?1",
		    "Sec-Fetch-Dest": "document",
		    "Accept-Encoding": "gzip, deflate, br"
		};
        let _headers = Object.assign(customHeaders, headers);
        
        let method = "GET";
        let requestOptions = {method, headers: _headers};
        let requestURL = 'https://www.scotcourts.gov.uk/search-judgments/advanced';
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
        return responsePage;
    };




const getForm = async function ({canonicalURL, headers}) {
        let customHeaders = {
		    "Cache-Control": "max-age=0",
		    "sec-ch-ua": "\"Chromium\";v=\"88\", \"Google Chrome\";v=\"88\", \";Not A Brand\";v=\"99\"",
		    "sec-ch-ua-mobile": "?0",
		    "Upgrade-Insecure-Requests": "1",
		    "Origin": "https://www.scotcourts.gov.uk",
		    "Content-Type": "application/x-www-form-urlencoded",
		    "Sec-Fetch-Site": "same-origin",
		    "Sec-Fetch-Mode": "navigate",
		    "Sec-Fetch-User": "?1",
		    "Sec-Fetch-Dest": "document",
		    "Referer": "https://www.scotcourts.gov.uk/search-judgments/advanced",
		    "Accept-Encoding": "gzip, deflate, br"
		};
        let _headers = Object.assign(customHeaders, headers);
        const data = {};
data["ctl41_TSM"] = `;;System.Web.Extensions,+Version=4.0.0.0,+Culture=neutral,+PublicKeyToken=31bf3856ad364e35:en-GB:d28568d3-e53e-4706-928f-3765912b66ca:ea597d4b:b25378d2;;Telerik.Sitefinity,+Version=7.0.5144.0,+Culture=neutral,+PublicKeyToken=b28c218413bdf563:en-GB:e5513197-c48e-4d11-a2d7-736d9d8cfbee:3b9a1b05;Telerik.Sitefinity.Search.Impl,+Version=7.0.5144.0,+Culture=neutral,+PublicKeyToken=b28c218413bdf563:en-GB:727af723-94d5-40c1-bca3-6006f0b7d0a7:7561727d;Telerik.Web.UI,+Version=2014.1.403.40,+Culture=neutral,+PublicKeyToken=121fae78165ba3d4:en-GB:5de9c4da-3453-47ae-93b6-a3d0bbf802b2:a1a4383a`;
data["ctl42_TSSM"] = `;Telerik.Sitefinity.Resources,+Version=7.0.5144.0,+Culture=neutral,+PublicKeyToken=null:en:24870cff-3b72-49a5-9bd2-8e989f3ef1c5:7a90d6a;Telerik.Web.UI,+Version=2014.1.403.40,+Culture=neutral,+PublicKeyToken=121fae78165ba3d4:en:5de9c4da-3453-47ae-93b6-a3d0bbf802b2:580b2269;Telerik.Web.UI.Skins,+Version=2014.1.403.40,+Culture=neutral,+PublicKeyToken=121fae78165ba3d4:en:46433934-f487-4d61-9bb5-4b7ec3460d8a:6c8ef648`;
data["__EVENTTARGET"] = ``;
data["__EVENTARGUMENT"] = ``;
data["__VIEWSTATE"] = `/wEPDwUKMTAwMjA4MjgxM2QYAgUeX19Db250cm9sc1JlcXVpcmVQb3N0QmFja0tleV9fFgIFI1Q2MEFFOUNBRjAxNSRjdGwwMCRjdGwwMCRCcmVhZGNydW1iBRJDMDAxJHJlc3BvbnNlc1RydWUFFUMwMDIkbXVsdGlWaWV3UmVzdWx0cw8PZAICZLQn/Nfq4HjcJIGLtlJyXuVrxqRoLQB6GpeLHANwxOQw`;
data["__VIEWSTATEGENERATOR"] = `A2143307`;
data["__EVENTVALIDATION"] = `/wEdABT3nRFk5m1Fb1odjDzgn0n7myZ3hS4aedM25BvbiXUr9AlA7+6RiDak6L2Z31PB1hfPfbhtBj/akyYXF4BNsDnrVzzfR9NY89bbqefZT4k4xLvFhMXySGotC35yLkri3/LTdrKE50ESyaNQN3chHpInoSoUFFjI7n7c+uqkDC6ffj/6zzXbC+CabmFiY2OcIByzkvLDDf8yesFSgF2sybWFbYav9HVBcxDSgtlgHRwdQ/hiIL3+zAJH2QTGFnbOJS/LtgjEsb+khO1qt91qJp9g78CusQjbRnfTDY0aQJDdjNX8m7Pn2GumAwfvB7X25p/grd/Vszf00acMbAFeXVqBMQJl9LMLQo0fPAbLitibEqajrxSrsGcHbZqxjNbITie5Gk2GaUisiWs6KBUPuZ4iP1xdYP4PHj5q5V881YWKasRYJIcwwMzrsae7M2ARdRVR5rIDwkjMMTUyJFBoN5fP`;
data["ctl41"] = ``;
data["TC584C84A028$ctl00$ctl00$searchTextBox"] = ``;
data["T60AE9CAF015_ctl00_ctl00_Breadcrumb_ClientState"] = ``;
data["C001$JudgmentsType"] = `high-court-judgments`;
data["C001$CaseTitle"] = ``;
data["C001$CaseReference"] = ``;
data["C001$OpinionDate"] = ``;
data["C001$TransferDate"] = `2-11-2021`;
data["C001$ResultLimit"] = `100`;
data["C001$submitSearch"] = `Search`;
let body = querystring.stringify(data);
        let method = "POST";
        let requestOptions = {method, body, headers: _headers};
        let requestURL = 'https://www.scotcourts.gov.uk/search-judgments/advanced';
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
        return responsePage;
    };




const searchDateAndIssuer = async function ({date, issuer, canonicalURL, headers}) {
        let customHeaders = {
		    "sec-ch-ua": "\"Chromium\";v=\"88\", \"Google Chrome\";v=\"88\", \";Not A Brand\";v=\"99\"",
		    "sec-ch-ua-mobile": "?0",
		    "Upgrade-Insecure-Requests": "1",
		    "Sec-Fetch-Site": "same-origin",
		    "Sec-Fetch-Mode": "navigate",
		    "Sec-Fetch-User": "?1",
		    "Sec-Fetch-Dest": "document",
		    "Referer": "https://www.scotcourts.gov.uk/search-judgments/advanced?judgmentsType=high-court-judgments&caseTitle=&caseReferenceNumber=&opinionDate=&transferDate=12-11-2019&filterResponses=No&resultLimit=100",
		    "Accept-Encoding": "gzip, deflate, br"
		};
        let _headers = Object.assign(customHeaders, headers);
        
        let method = "GET";
        let requestOptions = {method, headers: _headers};
        let requestURL = 'https://www.scotcourts.gov.uk/search-judgments/judgment?id=b85283a8-8980-69d2-b500-ff0000d74aa7';
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
        return responsePage;
    };

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const match = canonicalURL.match(/\?(start|from)=(\d{4}-\d{2}-\d{2}).(end|to)=(\d{4}-\d{2}-\d{2})(&page=(\d+))?$/i);
    if (match) {
        let from = moment(match[2]);
        let to = moment(match[4]);
        let page = match[6] ? parseInt(match[6]) : 1;
        return [await fetchURL({canonicalURL, headers})]
    } else {
        return defaultFetchURL({canonicalURL, headers});
    }
}