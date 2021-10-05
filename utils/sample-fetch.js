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


function setSharedVariable(key, value) {
}

function getSharedVariable(key) {
}


async function fetchPage({canonicalURL, requestURL, requestOptions, headers}) {
    if (!requestOptions) requestOptions = {method: "GET", headers};
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
    if (requestURL.match(/^https/i)) {
        requestOptions.agent = new https.Agent({rejectUnauthorized: false});
        console.log("using a custom agent");
    }
    return await fetchWithCookies(requestURL, requestOptions)
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({URL: requestURL}, requestOptions),
                response
            };
        });
}

const getHome = async function ({headers}) {
    let customHeaders = {
        "Pragma": "no-cache",
        "Cache-Control": "no-cache",
        "Upgrade-Insecure-Requests": "1",
        "DNT": "1",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);

    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = 'https://www.mincetur.gob.pe/institucional/acerca-del-ministerio/dispositivos-legales-mincetur/';
    let responsePage = await fetchPage({canonicalURL: requestURL, requestOptions});
    await parseForm({responsePage});
    let formPage = await getForm({headers});
    return {home: responsePage, form: formPage};
};

const getForm = async function ({headers}) {
    let customHeaders = {
        "Pragma": "no-cache",
        "Cache-Control": "no-cache",
        "Upgrade-Insecure-Requests": "1",
        "DNT": "1",
        "Referer": "https://www.mincetur.gob.pe/institucional/acerca-del-ministerio/dispositivos-legales-mincetur/",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);

    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = 'https://consultasenlinea.mincetur.gob.pe/DocumentosNormativos/Publico/FrmConsultaTransparencia.aspx';
    let responsePage = await fetchPage({canonicalURL: requestURL, requestOptions});
    await parseForm({responsePage});
    return responsePage;
};

const parseForm = async function ({responsePage}) {
    let html = await responsePage.response.text();
    responsePage.response = new fetch.Response(html, responsePage.response);
    const $ = cheerio.load(html);
    let viewState = $("input[name*='__VIEWSTATE']").val();
    viewState && setSharedVariable("view-state", viewState);
};

const parsePagination = async function ({responsePage, canonicalURL}) {
    let html = await responsePage.response.text();
    const $ = cheerio.load(html);
    let label = $("table[class *= pager] table").last().text().replace(/\s+/g, " ").trim();
    let pages = parseInt((/\d+\s+de\s+(\d+)/i.exec(label) || ["0"])[1]);
    let baseURL = canonicalURL.replace(/&page=\d+/i, "");
    let count = 0;
    for (let i = 2; i <= pages; i++) {
        $("body").append(`<a href="${baseURL}&page=${i}">Page ${i}</a> &nbsp; ${++count % 5 === 0 ? "<br/>" : ""}`)
    }
    responsePage.response = new fetch.Response($.html(), responsePage.response);
};

const parseResults = async function ({responsePage, page, year}) {
    let html = await responsePage.response.text();
    const $ = cheerio.load(html);
    responsePage.response = new fetch.Response(html, responsePage.response);
    let hasResults = page <= 1 || !!$("form>table table>tbody>tr:has(a)").length;
    if (!hasResults) {
        responsePage.response.status = 503;
        responsePage.response.ok = false;
    }
    let shouldHaveResults = $("select[name*='ANO'] > option").toArray().map(opt => parseInt($(opt).val())).filter((c, i, a) => a.indexOf(c) === i).indexOf(year) >= 0;
    if (!shouldHaveResults) {
        responsePage.response.status = 404;
        responsePage.response.ok = false;
        console.error("Should not have results: " + responsePage.canonicalURL);
    }
};

const search = async function ({year, type, page, canonicalURL, headers}) {
    let searchCode = year + type;
    if (page && page > 1) {
        let saved = getSharedVariable("last-search");
        if (saved !== searchCode)
            await search({year, type, page: 1, canonicalURL, headers});
    } else if (page === 1) {
        await getHome({headers});
    }
    let customHeaders = {
        "Pragma": "no-cache",
        "Cache-Control": "no-cache",
        "Origin": "https://consultasenlinea.mincetur.gob.pe",
        "Upgrade-Insecure-Requests": "1",
        "DNT": "1",
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": "https://consultasenlinea.mincetur.gob.pe/DocumentosNormativos/Publico/FrmConsultaTransparencia.aspx",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    type = /DECRETO SUPREMO/i.test(type) ? 4 : type;
    type = /RESOLUCI[^\s]+N DIRECTORAL/i.test(type) ? 5 : type;
    let viewState = getSharedVariable("view-state");
    if (!viewState) {
        await getHome({headers});
        viewState = getSharedVariable("view-state");
    }
    let form = {
        "ToolkitScriptManager1_HiddenField": ";;AjaxControlToolkit,+Version=4.1.40412.0,+Culture=neutral,+PublicKeyToken=28f01b0e84b6d53e:es-PE:acfc7575-cdee-46af-964f-5d85d9cdcf92:475a4ef5:effe2a26:3ac3e789",
        "__EVENTTARGET": "",
        "__EVENTARGUMENT": "",
        "__VIEWSTATE": viewState,
        "__SCROLLPOSITIONX": "0",
        "__SCROLLPOSITIONY": "0",
        "UC_ANO_OBJ$DDL_ANO_PROC": year,
        "UC_TIP_DISP_OBJ$DDL_COD_DISP": type,
        "TB_NRO_RESO": "",
        "TB_TEMA": "",
        "TBPAGINA": page
    };
    if (page > 1) {
        form = Object.assign(form, {
            "IBBUSCAR.x": "7",
            "IBBUSCAR.y": "9"
        });
    } else form["BUSCAR"] = "Buscar";
    let body = querystring.stringify(form);
    let method = "POST";
    let requestOptions = {method, body, headers: _headers};
    let requestURL = 'https://consultasenlinea.mincetur.gob.pe/DocumentosNormativos/Publico/FrmConsultaTransparencia.aspx';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    setSharedVariable("last-search", searchCode);
    await parseForm({responsePage});
    if (page === 1)
        await parsePagination({responsePage, canonicalURL});
    await parseResults({responsePage, page, year});
    return responsePage;
};

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const match = canonicalURL.match(/\?year=(\d{4})&type=([^&]+)(&page=(\d+))?$/i);
    if (match) {
        let year = parseInt(match[1]);
        let type = decodeURIComponent(match[2]);
        let page = match[4] ? parseInt(match[4]) : 1;
        return [await search({year, page, type, canonicalURL, headers})]
    } else {
        return defaultFetchURL({canonicalURL, headers});
    }
}