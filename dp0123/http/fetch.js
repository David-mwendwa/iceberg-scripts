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


const parseRequestToken = async function ({responsePage}) {
    let html = await responsePage.response.text();
    responsePage.response = new fetch.Response(html, responsePage.response);
    const $ = cheerio.load(html);
    let requestToken = $("input[name*='__RequestVerificationToken']").val();
    requestToken && setSharedVariable("request-token", requestToken);
  	return requestToken
};


const home = async function ({year, canonicalURL, headers}) {
    let customHeaders = {
        "Cache-Control": "max-age=0",
        "Upgrade-Insecure-Requests": "1",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = 'http://www.consultoria.gov.do/consulta/';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  	await parseRequestToken({responsePage})
    let listing = []
    let documentTypes = ["Leyes", "Decretos", "Reglamentos", "Resoluciones"]
    documentTypes.forEach(type => listing.push(`${canonicalURL}&documentType=${type}`))
    let uJson = JSON.stringify({listing: listing})
    responsePage.response = new fetch.Response(uJson, responsePage.response);
    responsePage.response.headers.set('content-type', 'application/json');
    return responsePage;
};

const documentTypeCodes = {
	Leyes: 1,
  	Decretos: 3,
    Reglamentos: 4,
  	Resoluciones: 7
    //Varios: 5,
}

const getListing = async function ({year, documentType, canonicalURL, headers}) {
  	await home({headers});
    let customHeaders = {
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Origin": "http://www.consultoria.gov.do",
        "Referer": "http://www.consultoria.gov.do/consulta/",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    data["__RequestVerificationToken"] = getSharedVariable("request-token");
    data["DocumentTypeCode"] = `${documentTypeCodes[documentType]}`;
    data["DocumentCategory"] = `0`;
    data["DocumentNumber"] = ``;
    data["DocumentTitle"] = ``;
    data["GacetaOficial"] = ``;
    data["PublicationYearOperator"] = `1`;
    data["PublicationYear"] = `+${year}`;
    data["PublicationYearEnd"] = ``;
    data["EmisionDateOperator"] = `1`;
    data["EmisionDate"] = ``;
    data["EmisionDateEnd"] = ``;
    data["President"] = `0`;
    data["Consultor"] = `0`;
    data["Category"] = ``;
    data["Institution"] = `0`;
    data["FullText"] = ``;
    data["ConsultTable_length"] = `10`;
    data["X-Requested-With"] = `XMLHttpRequest`;
    let body = querystring.stringify(data);
    let method = "POST";
    let requestOptions = {method, body, headers: _headers};
    let requestURL = 'http://www.consultoria.gov.do/Consulta/Home/Search?Length=7';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  	let html = await responsePage.response.text();
	let $ = cheerio.load(html);
  	$('table[id="ConsultTable"] tbody tr td:last-child').each(function(){
        let a = $(this).find('a[id="documentInfo"]')
        let idAttr = a.attr('onclick')
        let id = /showInfo\((\d+)\)/i.exec(idAttr)[1]
        let infoURL = `http://www.consultoria.gov.do/consulta/Home/DocumentInfo?documentId=${id}`    
        a.attr('href', infoURL)
    })
  	responsePage.response = new fetch.Response($.html(), responsePage.response);
    return responsePage;
};


const getDocumentInfo = async function ({canonicalURL, headers}) {
    let customHeaders = {
      "X-Requested-With": "XMLHttpRequest",
      "Referer": "http://www.consultoria.gov.do/consulta/",
      "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);

    let method = "GET";
    let requestOptions = {method, headers: _headers};
  	//http://www.consultoria.gov.do/consulta/Home/DocumentInfo?documentId=3397701
    let requestURL = canonicalURL
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return responsePage;
};


const getContent = async function ({canonicalURL, headers}) {
    let customHeaders = {
        "Upgrade-Insecure-Requests": "1",
        "Referer": "http://www.consultoria.gov.do/consulta/",
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
  	const isSearch = canonicalURL.match(/\?year=(\d+)$/i)
    const isListing = canonicalURL.match(/\?year=(\d+)&documentType=(.+)$/i);
  	const isContent = canonicalURL.match(/\?documentId=\d+&managementType=\d+/)
    const isDocInfo = canonicalURL.match(/DocumentInfo\?documentId=\d+/)
  	if (isSearch) {
    	let year = parseInt(isSearch[1])
        return [await home({year, canonicalURL, headers})]
      
    } else if (isListing) {
        let year = isListing[1];
        let documentType = isListing[2];
        return [await getListing({year, documentType, canonicalURL, headers})]
      
    } else if (isContent) {     
    	return [await getContent({canonicalURL, headers})]
      
    } else if (isDocInfo) {     
    	return [await getDocumentInfo({canonicalURL, headers})]
      
    } else {
        return defaultFetchURL({canonicalURL, headers});
    }
}