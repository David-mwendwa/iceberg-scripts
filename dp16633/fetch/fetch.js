async function fetchPage({canonicalURL, requestURL, requestOptions, headers}) {
    if (!requestOptions) requestOptions = {method: "GET", headers};
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
  	if (requestURL.match(/^https/i)) {
        requestOptions.agent = new https.Agent({rejectUnauthorized: false, keepAlive: true});
    }
  	//return await fetchWithCookies(requestURL, requestOptions, "zone-g1-country-co")
  	return await fetchWithCookies(requestURL, requestOptions, "zone-g1-country-bo")
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
    let viewState = $("input[name='javax.faces.ViewState']").val() || $("input[name='__VIEWSTATE']").val() || $("update[id *='javax.faces.ViewState']").text().trim();
  	if (viewState) setSharedVariable('view-state', viewState);
    let viewStateGenerator = $("input[name='__VIEWSTATEGENERATOR']").val()
    if (viewStateGenerator) setSharedVariable('view-state-generator', viewStateGenerator);
  	return viewState
};

const home = async function ({argument, canonicalURL, headers}) {
    let customHeaders = {
      "DNT": "1",
      "Referer": "https://www.bbv.com.bo/marco-legal",
      "Sec-Fetch-Dest": "iframe",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "same-origin",
      "Upgrade-Insecure-Requests": "1",
      "sec-ch-ua": "\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = 'https://www.bbv.com.bo/docslegalsg/tLegalDocumento/ShowTLegalDocumentoTableWeb.aspx';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    await parseViewState({ responsePage });
    return responsePage;
};

const searchByYear = async function ({year, canonicalURL, headers}) {
  	await home({ headers });
    setSharedVariable('last-search', year);
  	let vsg = getSharedVariable('view-state-generator')
    //throw(vsg)
    let customHeaders = {
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "DNT": "1",
        "Origin": "https://www.bbv.com.bo",
        "Referer": "https://www.bbv.com.bo/docslegalsg/tLegalDocumento/ShowTLegalDocumentoTableWeb.aspx",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "X-MicrosoftAjax": "Delta=true",
        "X-Requested-With": "XMLHttpRequest",
        "sec-ch-ua": "\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    data["ctl00$scriptManager1"] = `ctl00$PageContent$UpdatePanel1|ctl00$PageContent$AnioFilter`;
    data["__EVENTTARGET"] = `ctl00$PageContent$AnioFilter`;
    data["__EVENTARGUMENT"] = ``;
    data["__LASTFOCUS"] = `ctl00_PageContent_AnioFilter`;
    data["__VIEWSTATE"] = getSharedVariable('view-state');
    data["__VIEWSTATEGENERATOR"] = getSharedVariable('view-state-generator');
    data["ctl00$pageLeftCoordinate"] = ``;
    data["ctl00$pageTopCoordinate"] = ``;
    data["isd_geo_location"] = `<location>
    <latitude>40,4636670</latitude>
    <longitude>-3,7492200</longitude>
    <unit>meters</unit>
    <error>LOCATION_ERROR_DISABLED</error>
    </location>
    `;
    data["ctl00$PageContent$_clientSideIsPostBack"] = `N`;
    data["ctl00$PageContent$IdEmitidoFilter"] = `--ANY--`;
    data["ctl00$PageContent$IdTipoDocumentoFilter"] = `--ANY--`;
    data["ctl00$PageContent$AnioFilter"] = `${year}`;
    data["ctl00$PageContent$TLegalDocumentoSearch1"] = ``;
    data["ctl00$PageContent$TLegalDocumentoSearch2"] = ``;
    data["ctl00$PageContent$TLegalDocumentoPagination$_CurrentPage"] = `0`;
    data["ctl00$PageContent$TLegalDocumentoPagination$_PageSize"] = `10`;
    data["__ASYNCPOST"] = `true`;
    let body = querystring.stringify(data);
    let method = "POST";
    let requestOptions = {method, body, headers: _headers};
    let requestURL = 'https://www.bbv.com.bo/docslegalsg/tLegalDocumento/ShowTLegalDocumentoTableWeb.aspx';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  	let html = await responsePage.response.text();
    const $ = cheerio.load(html);
  	responsePage.response.headers.set('content-type', 'text/html');
  	responsePage.response = new fetch.Response($('#ctl00_PageContent_TLegalDocumentoTableControlCollapsibleRegion').html(), responsePage.response);
    return responsePage;
};

const pagination = async function ({year, page, canonicalURL, headers}) {
  	throw(JSON.stringify({year, page, type: typeof page}, null, 4))
  	if (+page > 1) {
    	let yearLastSearched = getSharedVariable('last-search');
  		if(yearLastSearched!==year){
        	await searchByYear({year, canonicalURL, headers});
        }
    }
    let customHeaders = {
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "DNT": "1",
        "Origin": "https://www.bbv.com.bo",
        "Referer": "https://www.bbv.com.bo/docslegalsg/tLegalDocumento/ShowTLegalDocumentoTableWeb.aspx",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "X-MicrosoftAjax": "Delta=true",
        "X-Requested-With": "XMLHttpRequest",
        "sec-ch-ua": "\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    data["ctl00$scriptManager1"] = `ctl00$PageContent$UpdatePanel1|ctl00$PageContent$TLegalDocumentoPagination$_NextPage`;
    data["ctl00$pageLeftCoordinate"] = ``;
    data["ctl00$pageTopCoordinate"] = ``;
    data["isd_geo_location"] = `<location>
    <latitude>40,4636670</latitude>
    <longitude>-3,7492200</longitude>
    <unit>meters</unit>
    <error>LOCATION_ERROR_DISABLED</error>
    </location>
    `;
    data["ctl00$PageContent$_clientSideIsPostBack"] = `Y`;
    data["ctl00$PageContent$IdEmitidoFilter"] = `--ANY--`;
    data["ctl00$PageContent$IdTipoDocumentoFilter"] = `--ANY--`;
    data["ctl00$PageContent$AnioFilter"] = `${year}`;
    data["ctl00$PageContent$TLegalDocumentoSearch1"] = ``;
    data["ctl00$PageContent$TLegalDocumentoSearch2"] = ``;
    data["ctl00$PageContent$TLegalDocumentoPagination$_CurrentPage"] = `${page - 1}`;
    data["ctl00$PageContent$TLegalDocumentoPagination$_PageSize"] = `20`;
    data["__EVENTTARGET"] = ``;
    data["__EVENTARGUMENT"] = ``;
    data["__LASTFOCUS"] = `ctl00_PageContent_TLegalDocumentoPagination__NextPage`;
    data["__VIEWSTATE"] = getSharedVariable('view-state');
    data["__VIEWSTATEGENERATOR"] = getSharedVariable('view-state-generator');
    data["hiddenInputToUpdateATBuffer_CommonToolkitScripts"] = `1`;
    data["__ASYNCPOST"] = `true`;
    //data["ctl00$PageContent$TLegalDocumentoPagination$_NextPage.x"] = `14`;
    //data["ctl00$PageContent$TLegalDocumentoPagination$_NextPage.y"] = `12`;
  	data["ctl00$PageContent$TLegalDocumentoPagination$_NextPage.x"] = `8`;
    data["ctl00$PageContent$TLegalDocumentoPagination$_NextPage.y"] = `12`;
    let body = querystring.stringify(data);
    let method = "POST";
    let requestOptions = {method, body, headers: _headers};
    let requestURL = 'https://www.bbv.com.bo/docslegalsg/tLegalDocumento/ShowTLegalDocumentoTableWeb.aspx';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  	let html = await responsePage.response.text();
    const $ = cheerio.load(html);
  	responsePage.response.headers.set('content-type', 'text/html');
  	responsePage.response = new fetch.Response($('#ctl00_PageContent_TLegalDocumentoTableControlCollapsibleRegion').html(), responsePage.response);
    return responsePage;
};

const test = async function ({year, page, canonicalURL, headers}) {
  	if (page > 1) {
    	let yearLastSearched = getSharedVariable('last-search');
  		if(yearLastSearched!==year){
        	await searchByYear({year, canonicalURL, headers});
        }
    }
    let customHeaders = {
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "DNT": "1",
        "Origin": "https://www.bbv.com.bo",
        "Referer": "https://www.bbv.com.bo/docslegalsg/tLegalDocumento/ShowTLegalDocumentoTableWeb.aspx",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "X-MicrosoftAjax": "Delta=true",
        "X-Requested-With": "XMLHttpRequest",
        "sec-ch-ua": "\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    data["ctl00$scriptManager1"] = `ctl00$PageContent$UpdatePanel1|ctl00$PageContent$TLegalDocumentoPagination$_NextPage`;
    data["ctl00$pageLeftCoordinate"] = ``;
    data["ctl00$pageTopCoordinate"] = ``;
    data["isd_geo_location"] = `<location>
    <latitude>40,4636670</latitude>
    <longitude>-3,7492200</longitude>
    <unit>meters</unit>
    <error>LOCATION_ERROR_DISABLED</error>
    </location>
    `;
    data["ctl00$PageContent$_clientSideIsPostBack"] = `Y`;
    data["ctl00$PageContent$IdEmitidoFilter"] = `--ANY--`;
    data["ctl00$PageContent$IdTipoDocumentoFilter"] = `--ANY--`;
    data["ctl00$PageContent$AnioFilter"] = `2020`;
    data["ctl00$PageContent$TLegalDocumentoSearch1"] = ``;
    data["ctl00$PageContent$TLegalDocumentoSearch2"] = ``;
    data["ctl00$PageContent$TLegalDocumentoPagination$_CurrentPage"] = `2`;
    data["ctl00$PageContent$TLegalDocumentoPagination$_PageSize"] = `20`;
    data["__EVENTTARGET"] = ``;
    data["__EVENTARGUMENT"] = ``;
    data["__LASTFOCUS"] = `ctl00_PageContent_TLegalDocumentoPagination__NextPage`;
    data["__VIEWSTATE"] = getSharedVariable('view-state');
    data["__VIEWSTATEGENERATOR"] = getSharedVariable('view-state-generator');
    data["hiddenInputToUpdateATBuffer_CommonToolkitScripts"] = `1`;
    data["__ASYNCPOST"] = `true`;
    data["ctl00$PageContent$TLegalDocumentoPagination$_NextPage.x"] = `6`;
    data["ctl00$PageContent$TLegalDocumentoPagination$_NextPage.y"] = `17`;
    let body = querystring.stringify(data);
    let method = "POST";
    let requestOptions = {method, body, headers: _headers};
    let requestURL = 'https://www.bbv.com.bo/docslegalsg/tLegalDocumento/ShowTLegalDocumentoTableWeb.aspx';
  	let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    let html = await responsePage.response.text();
    const $ = cheerio.load(html);
  	responsePage.response.headers.set('content-type', 'text/html');
  	responsePage.response = new fetch.Response($('#ctl00_PageContent_TLegalDocumentoTableControlCollapsibleRegion').html(), responsePage.response);
    return responsePage;
};

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const isSearch = canonicalURL.match(/\?year=(\d+)&page=1$/i);
  	const isPagination = canonicalURL.match(/\?year=(\d+)&page=(\d+)$/i);
    if (isSearch) {
        let year = parseInt(isSearch[1]);
        return [await searchByYear({year, canonicalURL, headers})]
      
    } else if (isPagination) {
    	let year = parseInt(isPagination[1]);
        let page = isPagination[2] ? parseInt(isPagination[2]) : 1;
        return [await test({year, page, canonicalURL, headers})]
      
    } else {
      	return [await fetchPage({canonicalURL, headers})]
        //return defaultFetchURL({canonicalURL, headers});
    }
}