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

const getResoluciones = async function ({tipo, canonicalURL, headers}) {
    let typeResolution = /resol_dir_adm/i.test(tipo) ? 1 : /lam/i.test(tipo) ? 3 : null
    let customHeaders = {
        "authority": "www.dicapi.mil.pe",
        "content-type": "application/json",
        "dnt": "1",
        "origin": "https://www.dicapi.mil.pe",
        "referer": canonicalURL,
        "sec-ch-ua": "\"Chromium\";v=\"106\", \"Google Chrome\";v=\"106\", \"Not;A=Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    let data = {"year": "", "number": "", "affair": "", "description": "", "promoter_captaincy": null, "typeResolution": typeResolution};
  	//throw(JSON.stringify({canonicalURL, tipo, typeResolution}, null, 4))
    let body = JSON.stringify(data);
    let method = "POST";
    let requestOptions = {method, body, headers: _headers};
    let requestURL = 'https://www.dicapi.mil.pe/api/v1/web/get-resolutions';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return responsePage;
};

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const isListing = canonicalURL.match(/\?tipo=(.+)/i);
    if (isListing) {
        let tipo = isListing[1]
        return [await getResoluciones({tipo, canonicalURL, headers})]
    } else {
        return defaultFetchURL({canonicalURL, headers});
    }
}