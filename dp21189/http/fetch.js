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
    return await fetchWithCookies(requestURL, requestOptions,"no-proxy")
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({URL: requestURL}, requestOptions),
                response
            };
        });
}


const parseViewState = async function ({responsePage}) {
    let html = await responsePage.response.text();
  	responsePage.response = new fetch.Response(html, responsePage.response);
    const $ = cheerio.load(html, {xmlMode: true, decodeEntities: false});
    let viewState = $("input[name='javax.faces.ViewState']").val();
    viewState = viewState || $("update[id *='javax.faces.ViewState']").text().trim();
    if (viewState) setSharedVariable('view-state', viewState);
  	return viewState
};

const transformXMLtoHTML = async function ({ responsePage }) {
    let html = await responsePage.response.text()
    html = html.replace(/<!\[CDATA\[|\]\]>|<\?xml[^>]*>/g, "");
    const $ = cheerio.load(html, { xmlMode: true, decodeEntities: false });
  	const tableContent = $("update[id*='A4064']").html();
  	let content = `<html><body><table>${tableContent}</table></body></html>`;
  	responsePage.response = new fetch.Response(content, responsePage.response);
    responsePage.response.headers.set('content-type', 'text/html');
}

const injectPaginationLinks = async function ({responsePage}) {
    let html = await responsePage.response.text();
  	html = html.replace(/partial-response|changes|update/g, 'div');
	let $ = cheerio.load(html);
	html = $('div[id$="tblHistorico2"]');
	$ = cheerio.load(`<html><body><div class="ui-datatable-tablewrapper"></body></html>`);
	$('div.ui-datatable-tablewrapper').append(html);
    let paginator = $('.ui-paginator-current').last().text().trim();
    let total = /(\d+)$/.exec(paginator)
    total = total && total[0]
    let pages = Math.ceil(parseInt(total) / 10);
    let divToAppendPaginationLink = $("tbody")
    divToAppendPaginationLink.append('<h2>Pagination Links</h2><hr/>');
    let BASE_URL = responsePage.canonicalURL.replace(/&page=.+/i, '');
  	console.log('res-canonical-------', responsePage.canonicalURL)
    let i = 0;
    for (let page = 2; page <= pages; page++) {
        divToAppendPaginationLink.append(`<a style='margin: 5px;' class='pagination-link' href='${BASE_URL}&page=${page}'>page ${page}</a> ${++i % 10 === 0 ? '<br/>' : ''}`);
    }
    responsePage.response = new fetch.Response($.html(), responsePage.response);
}

const getHome = async function ({canonicalURL, headers}) {
        let customHeaders = {
		    "Cache-Control": "max-age=0",
		    "sec-ch-ua": "\"Google Chrome\";v=\"93\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"93\"",
		    "sec-ch-ua-mobile": "?0",
		    "sec-ch-ua-platform": "\"Windows\"",
		    "Upgrade-Insecure-Requests": "1",
		    "Sec-Fetch-Site": "none",
		    "Sec-Fetch-Mode": "navigate",
		    "Sec-Fetch-User": "?1",
		    "Sec-Fetch-Dest": "document",
		    "If-None-Match": "\"116879e4\"",
		    "Accept-Encoding": "gzip, deflate, br"
		};
        let _headers = Object.assign(customHeaders, headers);
        
        let method = "GET";
        let requestOptions = {method, headers: _headers};
        let requestURL = 'https://www.minenergia.gov.co/en/foros';
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  		await parseViewState({ responsePage });
        return responsePage;
    };


const searchByDates = async function ({from, to, canonicalURL, headers}) {
  		await getHome({canonicalURL, headers});
        let customHeaders = {
		    "sec-ch-ua": "\"Google Chrome\";v=\"93\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"93\"",
		    "sec-ch-ua-mobile": "?0",
		    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
		    "Faces-Request": "partial/ajax",
		    "X-Requested-With": "XMLHttpRequest",
		    "sec-ch-ua-platform": "\"Windows\"",
		    "Origin": "https://www.minenergia.gov.co",
		    "Sec-Fetch-Site": "same-origin",
		    "Sec-Fetch-Mode": "cors",
		    "Sec-Fetch-Dest": "empty",
		    "Referer": "https://www.minenergia.gov.co/en/foros",
		    "Accept-Encoding": "gzip, deflate, br"
		};
        let _headers = Object.assign(customHeaders, headers);
        const data = {};
        data["javax.faces.partial.ajax"] = `true`;
        data["javax.faces.source"] = `A4064:formHistorico:j_idt44`;
        data["javax.faces.partial.execute"] = `@all`;
        //data["javax.faces.partial.render"] = `A4064:formHistorico:tblHistorico2+A4064:formHistorico:tituloFiltro`;
        data["javax.faces.partial.render"] = `A4064:formHistorico:tblHistorico2 A4064:formHistorico:tituloFiltro`;
        data["A4064:formHistorico:j_idt44"] = `A4064:formHistorico:j_idt44`;
        data["A4064:formHistorico"] = `A4064:formHistorico`;
        data["javax.faces.encodedURL"] = `https://www.minenergia.gov.co/en/foros?p_p_id=ForosUser_WAR_ForosUserportlet&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_cacheability=cacheLevelPage&p_p_col_id=column-1&p_p_col_count=3&p_p_col_pos=2&_ForosUser_WAR_ForosUserportlet__jsfBridgeAjax=true&_ForosUser_WAR_ForosUserportlet__facesViewIdResource=%2Fviews%2Fview.xhtml`;
        data["A4064:formHistorico:fecRealizacionDesde_input"] = `${from.format("YYYY-MM-DD")} 00:00`;
        data["A4064:formHistorico:fecRealizacionHasta_input"] = `${to.format("YYYY-MM-DD")} 00:00`;
        data["A4064:formHistorico:j_idt34_input"] = `0`;
        data["A4064:formHistorico:j_idt34_focus"] = ``;
        data["A4064:formHistorico:palClave"] = ``;
        data["A4064:formHistorico:j_idt40_input"] = ``;
        data["A4064:formHistorico:j_idt40_focus"] = ``;
        data["A4064:formHistorico:txtIntro_input"] = ``;
        data["javax.faces.ViewState"] = getSharedVariable("view-state");
  		console.log(`from---${from.format("YYYY-MM-DD")} 00:00, to---${to.format("YYYY-MM-DD")} 00:00\n${canonicalURL}`)
        let body = querystring.stringify(data);
        let method = "POST";
        let requestOptions = {method, body, headers: _headers};
        let requestURL = 'https://www.minenergia.gov.co/en/foros?p_p_id=ForosUser_WAR_ForosUserportlet&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_cacheability=cacheLevelPage&p_p_col_id=column-1&p_p_col_count=3&p_p_col_pos=2&_ForosUser_WAR_ForosUserportlet__jsfBridgeAjax=true&_ForosUser_WAR_ForosUserportlet__facesViewIdResource=%2Fviews%2Fview.xhtml';
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  		setSharedVariable('last-search', from.format("YYYY-MM-DD") + to.format("YYYY-MM-DD"));
  		await parseViewState({ responsePage });
  		await injectPaginationLinks({ responsePage });
  		let html = await responsePage.response.text()
    	html = html.replace(/<!\[CDATA\[|\]\]>|<\?xml[^>]*>/g, "");
    	const $ = cheerio.load(html, { xmlMode: true, decodeEntities: false });
  		responsePage.response = new fetch.Response($.html(), responsePage.response);
    	responsePage.response.headers.set('content-type', 'text/html');
        return responsePage;
    };


const getPages = async function ({from, to, page, canonicalURL, headers}) {
        if (getSharedVariable('last-search') !== from.format("YYYY-MM-DD") + to.format("YYYY-MM-DD")) {
        	await searchByDates({from, to, canonicalURL, headers});
        }
        let customHeaders = {
		    "sec-ch-ua": "\"Google Chrome\";v=\"93\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"93\"",
		    "sec-ch-ua-mobile": "?0",
		    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
		    "Faces-Request": "partial/ajax",
		    "X-Requested-With": "XMLHttpRequest",
		    "sec-ch-ua-platform": "\"Windows\"",
		    "Origin": "https://www.minenergia.gov.co",
		    "Sec-Fetch-Site": "same-origin",
		    "Sec-Fetch-Mode": "cors",
		    "Sec-Fetch-Dest": "empty",
		    "Referer": "https://www.minenergia.gov.co/en/foros",
		    "Accept-Encoding": "gzip, deflate, br"
		};
        let _headers = Object.assign(customHeaders, headers);
        const data = {};
        data["javax.faces.partial.ajax"] = `true`;
        data["javax.faces.source"] = `A4064:formHistorico:tblHistorico2`;
        data["javax.faces.partial.execute"] = `A4064:formHistorico:tblHistorico2`;
        data["javax.faces.partial.render"] = `A4064:formHistorico:tblHistorico2`;
        data["A4064:formHistorico:tblHistorico2"] = `A4064:formHistorico:tblHistorico2`;
        data["A4064:formHistorico:tblHistorico2_pagination"] = `true`;
        data["A4064:formHistorico:tblHistorico2_first"] = `${(page - 1) * 10}`;
        data["A4064:formHistorico:tblHistorico2_rows"] = `10`;
        data["A4064:formHistorico"] = `A4064:formHistorico`;
        data["javax.faces.encodedURL"] = `https://www.minenergia.gov.co/en/foros?p_p_id=ForosUser_WAR_ForosUserportlet&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_cacheability=cacheLevelPage&p_p_col_id=column-1&p_p_col_count=3&p_p_col_pos=2&_ForosUser_WAR_ForosUserportlet__jsfBridgeAjax=true&_ForosUser_WAR_ForosUserportlet__facesViewIdResource=%2Fviews%2Fview.xhtml`;
        data["A4064:formHistorico:fecRealizacionDesde_input"] = `${from.format("YYYY-MM-DD")} 00:00`;
        data["A4064:formHistorico:fecRealizacionHasta_input"] = `${to.format("YYYY-MM-DD")} 00:00`;
        data["A4064:formHistorico:j_idt34_input"] = `0`;
        data["A4064:formHistorico:j_idt34_focus"] = ``;
        data["A4064:formHistorico:palClave"] = ``;
        data["A4064:formHistorico:j_idt40_input"] = ``;
        data["A4064:formHistorico:j_idt40_focus"] = ``;
        data["A4064:formHistorico:txtIntro_input"] = ``;
        data["javax.faces.ViewState"] = getSharedVariable("view-state");
        let body = querystring.stringify(data);
        let method = "POST";
        let requestOptions = {method, body, headers: _headers};
        let requestURL = 'https://www.minenergia.gov.co/en/foros?p_p_id=ForosUser_WAR_ForosUserportlet&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_cacheability=cacheLevelPage&p_p_col_id=column-1&p_p_col_count=3&p_p_col_pos=2&_ForosUser_WAR_ForosUserportlet__jsfBridgeAjax=true&_ForosUser_WAR_ForosUserportlet__facesViewIdResource=%2Fviews%2Fview.xhtml';
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  		await parseViewState({ responsePage }); 
  		await transformXMLtoHTML({ responsePage })		
        return responsePage;
    };


const getDocument = async function ({idForo, idLbl, canonicalURL, headers}) {
      let customHeaders = {
        "sec-ch-ua": "\"Google Chrome\";v=\"93\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"93\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "?1",
        "Sec-Fetch-Dest": "document",
        "Referer": "https://www.minenergia.gov.co/en/foros",
        "Accept-Encoding": "gzip, deflate, br"
      };
      let _headers = Object.assign(customHeaders, headers);
      let method = "GET";
      let requestOptions = {method, headers: _headers};
      let requestURL = `https://www.minenergia.gov.co/foros?idForo=${idForo}&idLbl=${idLbl}`;
  	  //requestURL = requestURL.replace(/\+/g, ' ')
      let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions}); 	  
      return responsePage;
};

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
  	
    const isSearch = /\?(start|from)=(\d{4}-\d{2}-\d{2}).(end|to)=(\d{4}-\d{2}-\d{2})&page=1$/i.exec(canonicalURL);
    const isPagination = /\?(start|from)=(\d{4}-\d{2}-\d{2}).(end|to)=(\d{4}-\d{2}-\d{2})(&page=(\d+))?$/i.exec(canonicalURL);
    const isDocument = /https:\/\/www\.minenergia\.gov\.co(?:\/en)?\/foros\?idForo=(\d+)&idLbl=(.+)/i.exec(canonicalURL)
    if (isSearch) {
        let from = moment(isSearch[2]);
        let to = moment(isSearch[4]);
        return [await searchByDates({from, to, canonicalURL, headers})]
      
    } else if (isPagination) {
        let from = moment(isPagination[2]);
        let to = moment(isPagination[4]);
        let page = parseInt(isPagination[6]);
      	return [await getPages({from, to, page, canonicalURL, headers})];       
      
    } else if (isDocument) {
     	let idForo = parseInt(isDocument[1])
        let idLbl = isDocument[2]
    	return [await getDocument({idForo, idLbl, canonicalURL, headers})]      
      
    } else {
        return [await fetchPage({canonicalURL, headers})];
    }
}