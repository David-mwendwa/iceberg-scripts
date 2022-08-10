async function fetchPage({canonicalURL, requestURL, requestOptions, headers}) {
    if (!requestOptions) requestOptions = {method: "GET", headers};
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
  	if (requestURL.match(/^https/i)) {
        requestOptions.agent = new https.Agent({rejectUnauthorized: false, keepAlive: true});
    }
  	return await fetchWithCookies(requestURL, requestOptions, "zone-g1-country-br")
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({URL: requestURL}, requestOptions),
                response
            };
        });
}

const home = async function ({argument, canonicalURL, headers}) {
    let customHeaders = {"Cache-Control":"max-age=0","DNT":"1","Referer":"https://juliapesquisa.trf5.jus.br/julia-pesquisa/","Sec-Fetch-Dest":"document","Sec-Fetch-Mode":"navigate","Sec-Fetch-Site":"same-origin","Sec-Fetch-User":"?1","Upgrade-Insecure-Requests":"1","sec-ch-ua":"\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"","sec-ch-ua-mobile":"?0","sec-ch-ua-platform":"\"Windows\"","Accept-Encoding":"gzip, deflate, br"};
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = 'https://juliapesquisa.trf5.jus.br/julia-pesquisa/';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return responsePage;
};

const searchByDates = async function ({from, to, page = 1, canonicalURL, headers}) {
  	const timestamp = new Date().getTime()
  	setSharedVariable('last-search', from+"-"+to);
    let customHeaders = {"DNT":"1","Referer":"https://juliapesquisa.trf5.jus.br/julia-pesquisa/","Sec-Fetch-Dest":"empty","Sec-Fetch-Mode":"cors","Sec-Fetch-Site":"same-origin","X-Requested-With":"XMLHttpRequest","sec-ch-ua":"\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"","sec-ch-ua-mobile":"?0","sec-ch-ua-platform":"\"Windows\"","Accept-Encoding":"gzip, deflate, br"};
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = {method, headers: _headers};
  	let requestURL = encodeURI(`https://juliapesquisa.trf5.jus.br/julia-pesquisa/api/documentos:dt?draw=${page}&columns[0][data]=codigoDocumento&columns[0][name]=&columns[0][searchable]=true&columns[0][orderable]=false&columns[0][search][value]=&columns[0][search][regex]=false&start=0&length=10&search[value]=&search[regex]=false&pesquisaLivre=&numeroProcesso=&orgaoJulgador=&relator=&dataIni=${from.format('DD/MM/YYYY')}&dataFim=${to.format('DD/MM/YYYY')}&_=${timestamp}`)
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  	//throw(JSON.stringify({from, to, page, requestURL, timestamp}, null, 4))
    return responsePage;
};

const pagination = async function ({from, to, page, canonicalURL, headers}) {
  	const timestamp = new Date().getTime()
  	if(page === 1){
    	let lastDatesSearched = getSharedVariable('last-search');
      	let currentDateRange = from+"-"+to;
  		if(lastDatesSearched !== currentDateRange){
        	await searchByDates({from, to, page: 1, canonicalURL, headers});
        }
    }
    let customHeaders = {"DNT":"1","Referer":"https://juliapesquisa.trf5.jus.br/julia-pesquisa/","Sec-Fetch-Dest":"empty","Sec-Fetch-Mode":"cors","Sec-Fetch-Site":"same-origin","X-Requested-With":"XMLHttpRequest","sec-ch-ua":"\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"","sec-ch-ua-mobile":"?0","sec-ch-ua-platform":"\"Windows\"","Accept-Encoding":"gzip, deflate, br"};
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = {method, headers: _headers};
  	let requestURL = encodeURI(`https://juliapesquisa.trf5.jus.br/julia-pesquisa/api/documentos:dt?draw=${page}&columns[0][data]=codigoDocumento&columns[0][name]=&columns[0][searchable]=true&columns[0][orderable]=false&columns[0][search][value]=&columns[0][search][regex]=false&start=0&length=10&search[value]=&search[regex]=false&pesquisaLivre=&numeroProcesso=&orgaoJulgador=&relator=&dataIni=${from.format('DD/MM/YYYY')}&dataFim=${to.format('DD/MM/YYYY')}&_=${timestamp}`)
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return responsePage;
};

const getCaptchaResult = async function ({headers}) {
    let customHeaders = {"Cache-Control":"max-age=0","DNT":"1","Referer":"https://juliapesquisa.trf5.jus.br/","Sec-Fetch-Dest":"document","Sec-Fetch-Mode":"navigate","Sec-Fetch-Site":"same-site","Sec-Fetch-User":"?1","Upgrade-Insecure-Requests":"1","sec-ch-ua":"\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"","sec-ch-ua-mobile":"?0","sec-ch-ua-platform":"\"Windows\"","Accept-Encoding":"gzip, deflate, br"};
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = 'https://pje.trf5.jus.br/pje/ConsultaPublica/listView.seam';
    let responsePage = await fetchPage({canonicalURL: requestURL, requestURL, requestOptions});
  	await parseViewState({ responsePage });
  	let html = await responsePage.response.text();
    const $ = cheerio.load(html);
  	let src = $('img[id*="captchaImg"]').attr('src')
    let captchaURL = src ? url.resolve(requestURL, src) : null;
  	let captchaPage = await fetchPage({canonicalURL: captchaURL, requestOptions: {method: "GET"}});
  	let captchaResult = await resolveCaptcha(await captchaPage.response.buffer());
  	return captchaResult
};

const transformXMLtoHTML = async function ({canonicalURL, responsePage, headers }) {
    let html = await responsePage.response.text();
    html = html.replace(/<!\[CDATA\[|\]\]>|<\?xml[^>]*>/g, "");
  	let match = /signedIdProcessoTrf=(\w+)['"]/.exec(html)
    let signedIdProcessoTrf = match && match[1]
    let $ = cheerio.load(html);
  	let judicialProcessURL = `https://pje.trf5.jus.br/pjeconsulta/ConsultaPublica/DetalheProcessoConsultaPublica/listView.seam?signedIdProcessoTrf=${signedIdProcessoTrf}&page=1`
    if (/processo/i.test(canonicalURL)){
    	$('table[id^="consultaPublicaList"] tbody tr td:has(img)').append(`<br><a id="jp_url" href="${judicialProcessURL}">judicialProcessURL</a>`)
    }
    let content = $("#pageBody, #processoEventoPanel").html();
    let transformed = `<html><body><div id="pageBody">${content}</div></body></html>`;
  	responsePage.response = new fetch.Response(transformed, responsePage.response);
    responsePage.response.headers.set('content-type', 'text/html');
  	responsePage
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

const getMetadata = async function ({processo, canonicalURL, headers}) {
  	let captchaResult = await getCaptchaResult({headers})
  	let viewState = getSharedVariable('view-state')
    let match = /^(\d{7})(\d{2})(\d{4})(\d{1})(\d{2})(\d{4})$/.exec(processo)
    let formattedProcesso = match && `${match[1]}-${match[2]}.${match[3]}.${match[4]}.${match[5]}.${match[6]}`
  	//throw(JSON.stringify({processo, formattedProcesso, captchaResult}, null, 4))
    let customHeaders = {"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8","DNT":"1","Origin":"https://pje.trf5.jus.br","Referer":"https://pje.trf5.jus.br/pje/ConsultaPublica/listView.seam","Sec-Fetch-Dest":"empty","Sec-Fetch-Mode":"cors","Sec-Fetch-Site":"same-origin","sec-ch-ua":"\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"","sec-ch-ua-mobile":"?0","sec-ch-ua-platform":"\"Windows\"","x-dtpc":"1$85045444_495h6vCUANMKQKGOFAINMHUSUSVTICDHNKBEKA-0e0","Accept-Encoding":"gzip, deflate, br"};
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    data["AJAXREQUEST"] = `_viewRoot`;
    data["consultaPublicaForm:Processo:jurisdicaoSecaoDecoration:jurisdicaoSecao"] = `org.jboss.seam.ui.NoSelectionConverter.noSelectionValue`;
    data["consultaPublicaForm:Processo:ProcessoDecoration:Processo"] = formattedProcesso //`0808693-78.2018.4.05.8100`;
    data["consultaPublicaForm:Processo:j_id119:numeroProcessoPesqsuisaOriginario"] = ``;
    data["consultaPublicaForm:nomeParte:nomeParteDecoration:nomeParte"] = ``;
    data["consultaPublicaForm:nomeParteAdvogado:nomeParteAdvogadoDecoration:nomeParteAdvogadoDecoration:nomeParteAdvogado"] = ``;
    data["consultaPublicaForm:classeJudicial:idDecorateclasseJudicial:classeJudicial"] = ``;
    data["consultaPublicaForm:classeJudicial:idDecorateclasseJudicial:j_id207_selection"] = ``;
    data["consultaPublicaForm:numeroCPFCNPJ:numeroCPFCNPJRadioCPFCNPJ:numeroCPFCNPJCNPJ"] = ``;
    data["consultaPublicaForm:numeroOABParte:numeroOABParteDecoration:numeroOABParteEstadoCombo"] = `org.jboss.seam.ui.NoSelectionConverter.noSelectionValue`;
    data["consultaPublicaForm:numeroOABParte:numeroOABParteDecoration:numeroOABParte"] = ``;
    data["consultaPublicaForm:numeroOABParte:numeroOABParteDecoration:j_id258"] = ``;
    data["consultaPublicaForm:captcha:j_id268:verifyCaptcha"] = captchaResult;
    data["consultaPublicaForm"] = `consultaPublicaForm`;
    data["autoScroll"] = ``;
    data["javax.faces.ViewState"] = getSharedVariable('view-state');
    data["consultaPublicaForm:pesq"] = `consultaPublicaForm:pesq`;
    data["AJAX:EVENTS_COUNT"] = `1`;
    let body = querystring.stringify(data);
    let method = "POST";
    let requestOptions = {method, body, headers: _headers};
    let requestURL = 'https://pje.trf5.jus.br/pjeconsulta/ConsultaPublica/listView.seam;jsessionid=ODopYpvYrnfPyIeMaoDcl7Xv.node08';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  	await transformXMLtoHTML({canonicalURL, responsePage})
  	let html = await responsePage.response.text();
    let $ = cheerio.load(html);
  	let href = $('#jp_url').attr('href')
  	let responses = await getJudicialProcessListing_pageOne({processo, canonicalURL:href, headers})
  	return [responsePage, ...responses]

};

const updateHrefs = async function ({responsePage}) {
    let html = await responsePage.response.text();
    const $ = cheerio.load(html);
  	$('a[onclick]').each(function(){
        let onClickData = $(this).attr('onclick')
        let match = /PopUpDocumentoBin',(?:\s+)?'(http.+?idProcessoDocumento=\w+)'/i.exec(onClickData)
        let href = match && match[1]
        $(this).attr('href', href)
    })
  	$('a:contains("Inteiro Teor"), a:contains("nteiro")').attr('class', 'inteiro_url')
  	responsePage.response = new fetch.Response($.html(), responsePage.response);
    responsePage.response.headers.set('content-type', 'text/html');
  	responsePage
};

const getJudicialProcessListing_pageOne = async function ({processo, canonicalURL, headers}) {
    let customHeaders = {"DNT":"1","Sec-Fetch-Dest":"document","Sec-Fetch-Mode":"navigate","Sec-Fetch-Site":"none","Sec-Fetch-User":"?1","Upgrade-Insecure-Requests":"1","sec-ch-ua":"\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"","sec-ch-ua-mobile":"?0","sec-ch-ua-platform":"\"Windows\"","Accept-Encoding":"gzip, deflate, br"};
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = `${canonicalURL.replace(/&page=\d+/g, '')}`;
  	let responses = []
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  	await parseViewState({ responsePage });
  	await updateHrefs({ responsePage })
  	let iresponses = await getInteiroTeorContentResponses({ responsePage })
  	responses.push(responsePage)
  	iresponses.forEach(iresponse => responses.push(iresponse))
  	const html = await responsePage.response.text();
    const $ = cheerio.load(html);
  	let pages = +$('.rich-inslider-right-num').text().trim();
    let paginator = $(`#processoEvento + span:contains('resultados')`).text();
    let match = /:\D+(\d+)/.exec(paginator)
    let numOfDocuments = match && parseInt(match[1]) || null
    let page = +canonicalURL.split('page=').pop()
    let totalPages = Math.ceil(numOfDocuments / 15) || pages
    for (let i = 2; i <= totalPages; i++) {
      canonicalURL = canonicalURL.replace(/&page=[0-9]{1,3}/, `&page=${i}`);
      let responsePage = await getJudicialProcessListing_pagination({page: i, canonicalURL, headers})
      await parseViewState({ responsePage });
      await updateHrefs({ responsePage })
      responses.push(responsePage)
      let iresponses = await getInteiroTeorContentResponses({ responsePage })
      iresponses.forEach(iresponse => responses.push(iresponse))
    }
    return responses;
}

const getJudicialProcessListing_pagination = async function ({page, canonicalURL, headers}) {
  	let viewState = getSharedVariable('view-state')
    let customHeaders = {"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8","DNT":"1","Origin":"https://pje.trf5.jus.br","Referer":`${canonicalURL.replace(/&page=\d+/g, '')}`,"Sec-Fetch-Dest":"empty","Sec-Fetch-Mode":"cors","Sec-Fetch-Site":"same-origin","sec-ch-ua":"\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"","sec-ch-ua-mobile":"?0","sec-ch-ua-platform":"\"Windows\"","x-dtpc":"1$426007308_124h6vKCRSWFLRHQCJPNPDAHHFRUAKDIPOPKCI-0e0","Accept-Encoding":"gzip, deflate, br"};
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    data["AJAXREQUEST"] = `j_id340`;
    data["j_id423:j_id424"] = page;
    data["j_id423"] = `j_id423`;
    data["autoScroll"] = ``;
    data["javax.faces.ViewState"] = viewState;
    data["j_id423:j_id425"] = `j_id423:j_id425`;
    data["AJAX:EVENTS_COUNT"] = `1`;
    let body = querystring.stringify(data);
    let method = "POST";
    let requestOptions = {method, body, headers: _headers};
    let requestURL = 'https://pje.trf5.jus.br/pjeconsulta/ConsultaPublica/DetalheProcessoConsultaPublica/listView.seam';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  	await transformXMLtoHTML({responsePage})
    return responsePage;
}

const getInteiroTeorContentResponses = async function ({responsePage}) {
    let html = await responsePage.response.text();
    const $ = cheerio.load(html);
  	let urls = []
  	$('a.inteiro_url').each(function(){
        urls.push($(this).attr('href'))
    })
  	responsePage.response = new fetch.Response($.html(), responsePage.response);
  	let responses = []
  	for (url of urls) {
      let responsePage = await getInteiroTeor({canonicalURL: url})
      responses.push(responsePage)
    }
  	return responses
};

const getInteiroTeor = async function ({id, canonicalURL, headers}) {
    let customHeaders = {"DNT":"1","Sec-Fetch-Dest":"document","Sec-Fetch-Mode":"navigate","Sec-Fetch-Site":"none","Sec-Fetch-User":"?1","Upgrade-Insecure-Requests":"1","sec-ch-ua":"\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"","sec-ch-ua-mobile":"?0","sec-ch-ua-platform":"\"Windows\"","Accept-Encoding":"gzip, deflate, br"};
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = id ? `https://pje.trf5.jus.br/pjeconsulta/ConsultaPublica/DetalheProcessoConsultaPublica/documentoSemLoginHTML.seam?idProcessoDocumento=${id}` : canonicalURL;
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return responsePage;
};

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const isSearch = canonicalURL.match(/\?from=(.+)&to=(.+)&page=1$/i);
  	const isPagination = canonicalURL.match(/\?from=(.+)&to=(.+)&page=(\d+)$/i);
  	const isMetadataURL = canonicalURL.match(/\?processo=(\d+)$/i);const isInteiroTeorURL = canonicalURL.match(/\?idProcessoDocumento=(\w+)$/i) //https://pje.trf5.jus.br/pjeconsulta/ConsultaPublica/DetalheProcessoConsultaPublica/documentoSemLoginHTML.seam?idProcessoDocumento=0ab6bac15ed4f8a5bf539c63004285bd
    if (isSearch) {
      	let from = moment(isSearch[1])
        let to = moment(isSearch[2])
        return [await searchByDates({from, to, canonicalURL, headers})]
      
    } else if (isPagination) {
    	let from = moment(isPagination[1])
        let to = moment(isPagination[2])
        let page = isPagination[3] ? parseInt(isPagination[3]) : 1;
        return [await pagination({from, to, page, canonicalURL, headers})]
      
    } else if (isMetadataURL) {
    	let processo = isMetadataURL[1];
        return await getMetadata({processo, canonicalURL, headers})
      
    } else if (isInteiroTeorURL) {
      	let id = isInteiroTeorURL[1];
      	return [await getInteiroTeor({id, canonicalURL, headers})]  
      
    } else {
      	return [await fetchPage({canonicalURL, headers})]
    }
}