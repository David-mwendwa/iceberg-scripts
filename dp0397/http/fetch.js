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
		    "authority": "www.gob.pe",
		    "cache-control": "max-age=0",
		    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"99\", \"Google Chrome\";v=\"99\"",
		    "sec-ch-ua-mobile": "?0",
		    "sec-ch-ua-platform": "\"Windows\"",
		    "dnt": "1",
		    "upgrade-insecure-requests": "1",
		    "sec-fetch-site": "same-origin",
		    "sec-fetch-mode": "navigate",
		    "sec-fetch-user": "?1",
		    "sec-fetch-dest": "document",
		    "referer": "https://www.google.com/",
		    "if-none-match": "W/\"76420038426c9ede0d15c0d346c592bb\"",
		    "Accept-Encoding": "gzip, deflate, br"
		};
        let _headers = Object.assign(customHeaders, headers);
        
        let method = "GET";
        let requestOptions = {method, headers: _headers};
        let requestURL = 'https://www.gob.pe/institucion/osce/colecciones/716-resoluciones-del-tribunal-de-contrataciones-del-estado';
        let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
        return responsePage;
    };

const searchByMonthAndYear = async function ({argument, canonicalURL, headers}) {
    let customHeaders = {
        "authority": "www.gob.pe",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"99\", \"Google Chrome\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "upgrade-insecure-requests": "1",
        "dnt": "1",
        "sec-fetch-site": "same-origin",
        "sec-fetch-mode": "navigate",
        "sec-fetch-user": "?1",
        "sec-fetch-dest": "document",
        "referer": "https://www.gob.pe/institucion/osce/colecciones/716-resoluciones-del-tribunal-de-contrataciones-del-estado",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = 'https://www.gob.pe/institucion/osce/colecciones/716-resoluciones-del-tribunal-de-contrataciones-del-estado?year=2019&month=1&terms=';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return responsePage;
};

const pagination = async function ({month, year, page, canonicalURL, headers}) {
  	//throw(`month:${month},year:${year},page:${page}`)
    let customHeaders = {
        "authority": "www.gob.pe",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"99\", \"Google Chrome\";v=\"99\"",
        "dnt": "1",
        "x-csrf-token": "xBEuNxkHI09MlHLvAtYda9VMqJKwrCzXnl5Ev5a1fRrOBIrkmSag8K5nUZcPhLVm7jsLznf34otCVONhinV78Q==",
        "sec-ch-ua-mobile": "?0",
        "x-requested-with": "XMLHttpRequest",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-site": "same-origin",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty",
        "referer": "https://www.gob.pe/institucion/osce/colecciones/716-resoluciones-del-tribunal-de-contrataciones-del-estado?year=2019&month=1&terms=",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);   
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = `https://www.gob.pe/institucion/osce/colecciones/716-resoluciones-del-tribunal-de-contrataciones-del-estado?month=${month}&sheet=${page}&terms=&year=${year}`; // page 2
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return responsePage;
};

const getDoc = async function ({argument, canonicalURL, headers}) {
    let customHeaders = {
        "authority": "www.gob.pe",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"99\", \"Google Chrome\";v=\"99\"",
        "turbolinks-referrer": "https://www.gob.pe/institucion/osce/colecciones/716-resoluciones-del-tribunal-de-contrataciones-del-estado?year=2019&month=1&terms=",
        "dnt": "1",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-site": "same-origin",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty",
        "referer": "https://www.gob.pe/institucion/osce/colecciones/716-resoluciones-del-tribunal-de-contrataciones-del-estado?year=2019&month=1&terms=",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = 'https://www.gob.pe/institucion/osce/normas-legales/610386-0108-2019-tce-s4';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return responsePage;
};

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const isPage = canonicalURL.match(/\?month=(\d+)&sheet=(\d+)&terms=&year=(\d{4})$/i);
    if (isPage) {
        let month = isPage[1]
        let year = isPage[3]
        let page = isPage[2] ? parseInt(isPage[2]) : 1;
        return [await pagination({month, year, page, canonicalURL, headers})]
    } else {
        return defaultFetchURL({canonicalURL, headers});
    }
}