async function fetchPage({canonicalURL, requestURL, requestOptions, headers}) {
    if (!requestOptions) requestOptions = {method: "GET", headers};
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
  	if (requestURL.match(/^https/i)) {
        requestOptions.agent = new https.Agent({rejectUnauthorized: false, keepAlive: true});
    }
  	return await fetchWithCookies(requestURL, requestOptions, "zone-g1-country-cl")
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({URL: requestURL}, requestOptions),
                response
            };
        });
}

const getListing = async function ({id, canonicalURL, headers}) {
  	const idMap = {5949: 'spens', 5929: 'sces'}
    let customHeaders = {
        "authority": "www.spensiones.cl",
        "dnt": "1",
        "referer": `${canonicalURL}`,
        "sec-ch-ua": "\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "upgrade-insecure-requests": "1",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers); 
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = idMap[id] ? `https://www.spensiones.cl/apps/normativaSP/getNormativa.php?id=${idMap[id]}` : canonicalURL;
  	//throw(JSON.stringify({requestURL, id}))
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return responsePage;
};

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const match = canonicalURL.match(/w3-propertyvalue-(\d+)\.html$/i);
    if (match) {
      	const id = parseInt(match[1])
        return [await getListing({id, canonicalURL, headers})]
    } else {
        return [await fetchPage({canonicalURL, headers})];
    }
}