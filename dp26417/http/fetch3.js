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

async function puppeteerFetch({canonicalURL, headers}) {
    const page = await puppeteerManager.newPage({userAgent:"Mozilla/5.0 (Macintosh; Intel Mac OS X 12_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15", incognito:true});
    await page.goto(canonicalURL, {
        waitFor: "networkidle0",
        timeout: 30000
    }).catch(e => console.error(`Puppeteer still loading page ${canonicalURL}`));
  	const elementHandle = await page.$('iframe#replay_iframe',); 	
    const frame = await elementHandle.contentFrame();
    await frame.waitForSelector("#outercontainer",  {
        visible: true,
        timeout: 600000
    }).catch(e => console.error("frame contente not found", e));
    await page.waitForTimeout(2000);
    let ihtml = await frame.evaluate(() => document.documentElement.outerHTML);
    let $ = cheerio.load(ihtml, {decodeEntities: false});
  	let html = $.html();
    return simpleResponse({
        canonicalURL,
        mimeType: "text/html",
        responseBody: html,
    });
}

const getContent = async function ({argument, canonicalURL, headers}) {
    let customHeaders = {"authority": "webarchive.nationalarchives.gov.uk","dnt": "1","sec-ch-ua": "\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"","sec-ch-ua-mobile": "?0","sec-ch-ua-platform": "\"Windows\"","sec-fetch-dest": "document","sec-fetch-mode": "navigate","sec-fetch-site": "none","sec-fetch-user": "?1","upgrade-insecure-requests": "1","Accept-Encoding": "gzip, deflate, br"};
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = canonicalURL;
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  	let location = responsePage.response.headers.get('location')
    responsePage = await fetchPage({canonicalURL, requestURL: location || canonicalURL, requestOptions});
    //throw(JSON.stringify({headers: Object.values(responsePage.response.headers), location}, null, 4))
    return responsePage;
};

async function fetchURL({canonicalURL, headers}) {
  	if (/\.[dp][od][cf]/i.test(canonicalURL)) {
      	let requestURL = encodeURI(decodeURI(canonicalURL));
        return [await getContent({canonicalURL, headers})];
      	
    } else if (/https?:.*https?:/i.test(canonicalURL)) {
        return [await puppeteerFetch({canonicalURL, headers})]
    }
  	const isHome = /track-access\/decisions\/appeals$/i.test(canonicalURL)
    if (isHome) {
        return [await fetchPage({canonicalURL, headers})]
      
    } else {
    	return [await fetchPage({canonicalURL, headers})]
    }
}