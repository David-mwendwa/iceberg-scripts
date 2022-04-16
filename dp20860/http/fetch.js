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
        "authority": "www.funcionpublica.gov.co",
        "cache-control": "max-age=0",
        "dnt": "1",
        "referer": "https://www.google.com/",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"100\", \"Google Chrome\";v=\"100\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "cross-site",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);       
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = 'https://www.funcionpublica.gov.co/eva/gestornormativo/conceptosfp.php';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return responsePage;
};

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const isHome = canonicalURL.match(/eva\/gestornormativo\/conceptosfp\.php$/i);
    if (isHome) {
        return [await home({canonicalURL, headers})]
    } else {
        return defaultFetchURL({canonicalURL, headers});
    }
}