
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

const getListing = async function ({argument, canonicalURL, headers}) {
    let customHeaders = {"authority":"www.orr.gov.uk","cache-control":"max-age=0","dnt":"1","if-modified-since":"Mon, 01 Aug 2022 07:49:04 GMT","if-none-match":"\"1659340144-gzip\"","referer":"https://www.orr.gov.uk/search-publications?f%5B0%5D=aggregated_category_child%3A120","sec-ch-ua":"\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"","sec-ch-ua-mobile":"?0","sec-ch-ua-platform":"\"Windows\"","sec-fetch-dest":"document","sec-fetch-mode":"navigate","sec-fetch-site":"same-origin","sec-fetch-user":"?1","upgrade-insecure-requests":"1","Accept-Encoding":"gzip, deflate, br"};
    let _headers = Object.assign(customHeaders, headers); 
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = canonicalURL;
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return responsePage;
};

async function puppeteerFetch({canonicalURL, headers}) {
    const page = await puppeteerManager.newPage({userAgent:"Mozilla/5.0 (Macintosh; Intel Mac OS X 12_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15", incognito:true});
    await page.goto(canonicalURL, {
        waitFor: "networkidle0",
        timeout: 30000
    }).catch(e => console.error(`Puppeteer still loading page ${canonicalURL}`));
    let html = await page.evaluate(() => document.documentElement.outerHTML);
    let $ = cheerio.load(html, {decodeEntities: false});
    $('base, script, iframe').remove();
    html = $('.layout-content').html() || $.html();
    return simpleResponse({
        canonicalURL,
        mimeType: "text/html",
        responseBody: html,
    });
}

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const isListing = canonicalURL.match(/www\.orr\.gov\.uk\/(guidance|monitoring|fixed)/i);
    if (isListing) {
        return [await puppeteerFetch({canonicalURL, headers})]
      
    } else if (/\.pdf/i.test(canonicalURL)) {
      	return [await fetchPage({canonicalURL, headers})]
      
    } else {
    	return defaultFetchURL({canonicalURL, headers});
    }
}