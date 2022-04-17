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

const home = async function ({argument, canonicalURL, headers}) {
    let customHeaders = {
        "Cache-Control": "max-age=0",
        "DNT": "1",
        "Referer": "https://www.google.com/",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"100\", \"Google Chrome\";v=\"100\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = 'https://prodapp1.osce.gob.pe/sda-pub/documentos/public/busquedaArbitraje.xhtml';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  	await parseViewState({ responsePage });
    return responsePage;
};

const parseViewState = async function ({responsePage}) {
    let html = await responsePage.response.text();
  	responsePage.response = new fetch.Response(html, responsePage.response);
    const $ = cheerio.load(html, {xmlMode: true, decodeEntities: false});
    let viewState = $("input[name='javax.faces.ViewState']").val();
    viewState = viewState || $("update[id *='javax.faces.ViewState']").text().trim();
    if (viewState) setSharedVariable('view-state', viewState);
  	return viewState
};

const transformXMLtoHTML = async function ({ responsePage, headers }) {
    let html = await responsePage.response.text();
    html = html.replace(/<!\[CDATA\[|\]\]>|<\?xml[^>]*>/g, "");
    let $ = cheerio.load(html, { xmlMode: true, decodeEntities: false });
    let content = $("update[id$='tablaLaudos'],update[id$='projectDetail']").html();
    let transformed = `<html><body><table>${content}</table></body></html>`;
  	responsePage.response = new fetch.Response(transformed, responsePage.response);
    responsePage.response.headers.set('content-type', 'text/html');
  	await injectContentModalURLs({responsePage})
}

const injectContentModalURLs = async function({responsePage}) {
	let html = await responsePage.response.text();
  	let $ = cheerio.load(html);  	
  	$("table>tbody>tr").each(function () {
        let row = $(this)
        let rowToAppendTo = row.find('>td:has(>button)')
        let onClickPayload = row.find('>td:has(>button)').find('>button').attr('onclick');
        let match = /mostrarDetalleArbitrajeVentana\(([0-9]+),/.exec(onClickPayload)
        let id = match && match[1];
        let href = id && `https://prodapp1.osce.gob.pe/sda/rest/public/documentos/findDetalleByCodDocumento?codDoc=${id}`;
      	rowToAppendTo.append(`<a style='margin: 5px;' class='details-url' href='${href}'>details</a>`)
    })
  	responsePage.response = new fetch.Response($.html(), responsePage.response) 	
}

const searchByYear = async function ({year, canonicalURL, headers}) {
  	await home({ headers });
    setSharedVariable('last-search', year);
  	//throw(`${getSharedVariable('view-state')}\nyear: ${year}`)
    let customHeaders = {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "DNT": "1",
        "Faces-Request": "partial/ajax",
        "Origin": "https://prodapp1.osce.gob.pe",
        "Referer": "https://prodapp1.osce.gob.pe/sda-pub/documentos/public/busquedaArbitraje.xhtml",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "X-Requested-With": "XMLHttpRequest",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"100\", \"Google Chrome\";v=\"100\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "x-dtpc": "9$262995739_259h7vENTABMNNUKROLHGPUKTHOFUVAJUPGESA-0e0",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    data["javax.faces.partial.ajax"] = `true`;
    data["javax.faces.source"] = `formBusqueda:j_idt29:j_idt135`;
    data["javax.faces.partial.execute"] = `@all`;
    data["javax.faces.partial.render"] = `formBusqueda:j_idt29:tablaLaudos`;
    data["formBusqueda:j_idt29:j_idt135"] = `formBusqueda:j_idt29:j_idt135`;
    data["formBusqueda"] = `formBusqueda`;
    data["formBusqueda:j_idt29:demandanteLaudo_input"] = ``;
    data["formBusqueda:j_idt29:demandanteLaudo_focus"] = ``;
    data["formBusqueda:j_idt29:entidadLaudo"] = ``;
    data["formBusqueda:j_idt29:contratistaTest"] = ``;
    data["formBusqueda:j_idt29:tipoArbitrajeLaudo_input"] = ``;
    data["formBusqueda:j_idt29:tipoArbitrajeLaudo_focus"] = ``;
    data["formBusqueda:j_idt29:institucionArbitralLaudo"] = ``;
    data["formBusqueda:j_idt29:procesoSeleccionLaudo"] = ``;
    data["formBusqueda:j_idt29:arbitroUnicoLaudo"] = ``;
    data["formBusqueda:j_idt29:arbitroEntidadLaudo"] = ``;
    data["formBusqueda:j_idt29:arbitroContratistaLaudo"] = ``;
    data["formBusqueda:j_idt29:idAnioLaudo_input"] = `${year}`;
    data["formBusqueda:j_idt29:idAnioLaudo_focus"] = ``;
    data["formBusqueda:j_idt29:materiascontrovertidaslaudo"] = ``;
    data["formBusqueda:j_idt29:plazoMinimo"] = ``;
    data["formBusqueda:j_idt29:plazoMaximo"] = ``;
    data["formBusqueda:j_idt29:condenaEntidadMinimo"] = ``;
    data["formBusqueda:j_idt29:condenaEntidadMaximo"] = ``;
    data["formBusqueda:j_idt29:condenaContratistaMinimo"] = ``;
    data["formBusqueda:j_idt29:condenaContratistaMaximo"] = ``;
    data["formBusqueda:j_idt29_activeIndex"] = `0`;
    data["javax.faces.ViewState"] = getSharedVariable('view-state')
    let body = querystring.stringify(data);
    let method = "POST";
    let requestOptions = {method, body, headers: _headers};
    let requestURL = 'https://prodapp1.osce.gob.pe/sda-pub/documentos/public/busquedaArbitraje.xhtml';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  	await transformXMLtoHTML({responsePage})
    return responsePage;
};

const pagination = async function ({year, page, canonicalURL, headers}) {
  	if (+page > 1) {
    	let yearLastSearched = getSharedVariable('last-search');
  		if(yearLastSearched!==year){
        	await searchByYear({year, canonicalURL, headers});
        }
    }
  	//throw(`${getSharedVariable('view-state')}\nyear: ${year}\npage: ${page}`)
    let customHeaders = {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "DNT": "1",
        "Faces-Request": "partial/ajax",
        "Origin": "https://prodapp1.osce.gob.pe",
        "Referer": "https://prodapp1.osce.gob.pe/sda-pub/documentos/public/busquedaArbitraje.xhtml",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "X-Requested-With": "XMLHttpRequest",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"100\", \"Google Chrome\";v=\"100\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "x-dtpc": "9$262995739_259h9vENTABMNNUKROLHGPUKTHOFUVAJUPGESA-0e0",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    data["javax.faces.partial.ajax"] = `true`;
    data["javax.faces.source"] = `formBusqueda:j_idt29:tablaLaudos`;
    data["javax.faces.partial.execute"] = `formBusqueda:j_idt29:tablaLaudos`;
    data["javax.faces.partial.render"] = `formBusqueda:j_idt29:tablaLaudos`;
    data["formBusqueda:j_idt29:tablaLaudos"] = `formBusqueda:j_idt29:tablaLaudos`;
    data["formBusqueda:j_idt29:tablaLaudos_pagination"] = `true`;
    data["formBusqueda:j_idt29:tablaLaudos_first"] = `${(+page - 1) * 10}`;
    data["formBusqueda:j_idt29:tablaLaudos_rows"] = `10`;
    data["formBusqueda:j_idt29:tablaLaudos_encodeFeature"] = `true`;
    data["formBusqueda"] = `formBusqueda`;
    data["formBusqueda:j_idt29:demandanteLaudo_input"] = ``;
    data["formBusqueda:j_idt29:demandanteLaudo_focus"] = ``;
    data["formBusqueda:j_idt29:entidadLaudo"] = ``;
    data["formBusqueda:j_idt29:contratistaTest"] = ``;
    data["formBusqueda:j_idt29:tipoArbitrajeLaudo_input"] = ``;
    data["formBusqueda:j_idt29:tipoArbitrajeLaudo_focus"] = ``;
    data["formBusqueda:j_idt29:institucionArbitralLaudo"] = ``;
    data["formBusqueda:j_idt29:procesoSeleccionLaudo"] = ``;
    data["formBusqueda:j_idt29:arbitroUnicoLaudo"] = ``;
    data["formBusqueda:j_idt29:arbitroEntidadLaudo"] = ``;
    data["formBusqueda:j_idt29:arbitroContratistaLaudo"] = ``;
    data["formBusqueda:j_idt29:idAnioLaudo_input"] = `${year}`;
    data["formBusqueda:j_idt29:idAnioLaudo_focus"] = ``;
    data["formBusqueda:j_idt29:materiascontrovertidaslaudo"] = ``;
    data["formBusqueda:j_idt29:plazoMinimo"] = ``;
    data["formBusqueda:j_idt29:plazoMaximo"] = ``;
    data["formBusqueda:j_idt29:condenaEntidadMinimo"] = ``;
    data["formBusqueda:j_idt29:condenaEntidadMaximo"] = ``;
    data["formBusqueda:j_idt29:condenaContratistaMinimo"] = ``;
    data["formBusqueda:j_idt29:condenaContratistaMaximo"] = ``;
    data["formBusqueda:j_idt29_activeIndex"] = `0`;
    data["javax.faces.ViewState"] = getSharedVariable('view-state')
    let body = querystring.stringify(data);
    let method = "POST";
    let requestOptions = {method, body, headers: _headers};
    let requestURL = 'https://prodapp1.osce.gob.pe/sda-pub/documentos/public/busquedaArbitraje.xhtml';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  	await transformXMLtoHTML({responsePage})
    return responsePage;
};

const getContentModal = async function ({codDoc, canonicalURL, headers}) {
  	const timestamp = new Date().getTime()
    //throw(`timestamp:${timestamp}, ${codDoc}`)
    let customHeaders = {
        "DNT": "1",
        "Referer": "https://prodapp1.osce.gob.pe/sda-pub/documentos/public/busquedaArbitraje.xhtml",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "X-Requested-With": "XMLHttpRequest",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"100\", \"Google Chrome\";v=\"100\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "x-dtpc": "9$266513877_593h10vFKRPBLDHIBHVVHEGPMQLKSSWUUIARQQV-0e0",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);   
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = `https://prodapp1.osce.gob.pe/sda/rest/public/documentos/findDetalleByCodDocumento?_dc=${timestamp}&codDoc=${codDoc}`;
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return responsePage;
};

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const isSearch = canonicalURL.match(/\?year=(\d+)&page=1$/i);
  	const isPagination = canonicalURL.match(/\?year=(\d+)&page=(\d+)$/i);
  	const isContentModalURL = canonicalURL.match(/\&codDoc=(\d+)$/i);
    if (isSearch) {
        let year = parseInt(isSearch[1]);
        return [await searchByYear({year, canonicalURL, headers})]
      
    } else if (isPagination) {
    	let year = parseInt(isPagination[1]);
        let page = isPagination[2] ? parseInt(isPagination[2]) : 1;
        return [await pagination({year, page, canonicalURL, headers})]
      
    } else if (isContentModalURL) {
    	let codDoc = parseInt(isContentModalURL[1]);
        return [await getContentModal({codDoc, canonicalURL, headers})]
      
    } else {
      	return [await fetchPage({canonicalURL, headers})]
        //return defaultFetchURL({canonicalURL, headers});
    }
}