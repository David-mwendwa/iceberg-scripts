async function fetchPage({canonicalURL, requestURL, requestOptions, headers}) {
    if (!requestOptions) requestOptions = {method: "GET", headers};
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL.replace(/http:/, 'https:');
  	if (requestURL.match(/^https/i)) {
        requestOptions.agent = new https.Agent({rejectUnauthorized: false, keepAlive: true});
    }
  	return await fetchWithCookies(requestURL, requestOptions, "no-proxy")
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
        "Upgrade-Insecure-Requests": "1",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);  
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = canonicalURL;
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  	let html = await responsePage.response.text();
    const $ = cheerio.load(html);
  	let table = $('#tabla_normativa')
    table.find("a[href*='.pdf'], a[href*='.doc']").each(function () {
        let a = $(this)
        let href = a.attr('href')
        href = `https://www.sence.cl/601/${href}`
        a.attr('href', href)
    })
  	responsePage.response = new fetch.Response($.html(), responsePage.response) 
    return responsePage;
};

const getPDF = async function ({relativeURL, canonicalURL, headers}) {
    let customHeaders = {
        "DNT": "1",
        "Referer": "http://www.sence.cl/",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"102\", \"Google Chrome\";v=\"102\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers); 
    let method = "GET";
    let requestOptions = {method, headers: _headers};
  	let requestURL = canonicalURL.replace(/http:/, 'https:')
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return responsePage;
};

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const match = canonicalURL.match(/Normativa\/(Resoluciones|Circulares)/i);
    if (match) {
        return [await home({canonicalURL, headers})]
    }
  	if (/\.(pdf|docx?)\b/i.test(canonicalURL)) {
      	let relativeURL = canonicalURL.split('/').pop()
        //return [await getPDF({relativeURL, canonicalURL, headers})]
      	return [await fetchPage({canonicalURL, headers})];
    }
  	else {
        return [await fetchPage({canonicalURL, headers})];
    }
}