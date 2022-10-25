
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

const getListing = async function ({page, canonicalURL, headers}) {
  	let pageSize = 50
    let rowStart = (page - 1) * pageSize
    let customHeaders = {
        "authority": "wb2server.congreso.gob.pe",
        "content-type": "application/json",
        "dnt": "1",
        "origin": "https://wb2server.congreso.gob.pe",
        "referer": "https://wb2server.congreso.gob.pe/spley-portal/",
        "sec-ch-ua": "\"Chromium\";v=\"106\", \"Google Chrome\";v=\"106\", \"Not;A=Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    let data = {
        "perParId": 2021,
        "perLegId": null,
        "comisionId": null,
        "estadoId": null,
        "congresistaId": null,
        "grupoParlamentarioId": null,
        "proponenteId": null,
        "legislaturaId": null,
        "fecPresentacion": null,
        "pleyNum": null,
        "palabras": null,
        "tipoFirmanteId": null,
        "pageSize": pageSize,
        "rowStart": rowStart
    };
  	//throw(JSON.stringify({pageSize, rowStart}, null, 4))
    let body = JSON.stringify(data);
    let method = "POST";
    let requestOptions = {method, body, headers: _headers};
    let requestURL = 'https://wb2server.congreso.gob.pe/spley-portal-service/proyecto-ley/lista-con-filtro';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return responsePage;
};

const getDoc = async function ({id, canonicalURL, headers}) {
    let customHeaders = {
        "authority": "wb2server.congreso.gob.pe",
        "dnt": "1",
        "referer": "https://wb2server.congreso.gob.pe/spley-portal/",
        "sec-ch-ua": "\"Chromium\";v=\"106\", \"Google Chrome\";v=\"106\", \"Not;A=Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = id ? `https://wb2server.congreso.gob.pe/spley-portal-service/expediente/${id}` : canonicalURL;
  	//throw(JSON.stringify({id, requestURL}, null, 4))
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return responsePage;
};

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const isListing = canonicalURL.match(/search\?page=(\d+)/i);
  	const isDoc = canonicalURL.match(/expediente\/([\d\/]+)/i);
    if (isListing) {
        let page = isListing[1] ? parseInt(isListing[1]) : 1;
        return [await getListing({page, canonicalURL, headers})]
      
    } else if (isDoc) {
        let id = isDoc[1]
        return [await getDoc({id, canonicalURL, headers})]
      
    } else {
        return defaultFetchURL({canonicalURL, headers});
    }
}