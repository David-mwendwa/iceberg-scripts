async function fetchPage({canonicalURL, requestURL, requestOptions, headers}) {
    if (!requestOptions) requestOptions = {method: "GET", headers};
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = encodeURI(canonicalURL)
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

const home = async function ({canonicalURL, headers}) {
    let customHeaders = {
        "Cache-Control": "max-age=0",
        "DNT": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"101\", \"Google Chrome\";v=\"101\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);  
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = 'https://www.amvcolombia.org.co/normativa-y-buenas-practicas/proyectos-vigentes/';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  	let html = await responsePage.response.text();
  	let $ = cheerio.load(html);
  	const pdfUrls = []
  	$(".vc_tta-panels-container #proyectos-files .proyectos-file").each(function () {
        let pdf = $(this).find('a[href*=".pdf"]').attr('href')
        pdfUrls.push(pdf)
    })
  	for (const pdf of pdfUrls) {
        let res = await runRemoteFilter({URL: pdf, id:'A06rc6d47bbtgso', filter:'pdf2htmlEx'})
        const _$ = cheerio.load(res);
        let contentUrl = _$('a[href*=".pdf"], a[href*=".docx"], a[href*=".doc"]').attr('href')
        contentUrl && setSharedVariable(pdf, contentUrl)
    }
  	$(".vc_tta-panels-container #proyectos-files .proyectos-file").each(function () {
        const divToAppendTo = $(this).find('.call_center')
        let pdf = $(this).find('a[href*=".pdf"]').attr('href')
        let contentUrl = getSharedVariable(pdf)
        contentUrl && divToAppendTo.append(`<br/><a style='margin: 5px;' class='content-url' href='${contentUrl}'>content url</a>`)
    })
    //throw(JSON.stringify({responses}, null, 4))
  	responsePage.response = new fetch.Response($.html(), responsePage.response) 
    return responsePage;
};

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const isHome = canonicalURL.match(/proyectos-vigentes/i);
    if (isHome) {
        return [await home({canonicalURL, headers})]
      
    } else {
        return [await fetchPage({canonicalURL, headers})]
        //return defaultFetchURL({canonicalURL, headers});
    }
}


const runRemoteFilter = async function ({URL, id, filter}) {
    let textContent = "";
    const URLId = URL && "H" + new Buffer(URL).toString("base64");
    const URLIdN = URL && "H" + sha256(URL) + ".N";
    let query = `
              query {` +
        `
                nodes(ids: ["${URL && `${URLId}", "${URLIdN}` || `${id}`}"]) {`
        + `               id
                ... on CrawledURL {
                  lastSuccessfulRequest {
                    outputForFilter(filter: "${filter}")
                  }
                }
              }
            }`;
    const resp = await graphql(query);

    let node = resp.nodes.filter(n => n)[0];

    if (node && node.lastSuccessfulRequest && node.lastSuccessfulRequest.outputForFilter[0].filterOutput && node.lastSuccessfulRequest.outputForFilter[0].filterOutput.content) {
        let _text = node.lastSuccessfulRequest.outputForFilter[0].filterOutput.content;
        textContent += _text;
    } else {
    }
    return textContent;
};