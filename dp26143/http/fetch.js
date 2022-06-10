async function fetchPage({canonicalURL, requestURL, requestOptions, headers}) {
    if (!requestOptions) requestOptions = {method: "GET", headers};
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
  	if (requestURL.match(/^https/i)) {
        requestOptions.agent = new https.Agent({rejectUnauthorized: false, keepAlive: true});
    }
  	return await fetchWithCookies(requestURL, requestOptions, "zone-g1-country-co")
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({URL: requestURL}, requestOptions),
                response
            };
        });
}

async function puppeteerFetch({pageNo, canonicalURL, requestURL, headers}) {
  	if (!requestURL) requestURL = canonicalURL;
  	let userAgents = ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36","Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:97.0) Gecko/20100101 Firefox/97.0","Mozilla/5.0 (Macintosh; Intel Mac OS X 12_2_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.2 Safari/605.1.15","Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko","Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36 Edg/98.0.1108.62",undefined];
  	let counter = getSharedVariable('counter') || 0;
  	if(counter>=userAgents.length)counter = 0;
  	let userAgent = userAgents[counter++];
  	setSharedVariable('counter', counter); 
    const page = await puppeteerManager.newPage({userAgent, incognito: true});
    await page.goto(requestURL,{waitFor:"networkidle0", timeout:30000}).catch(e=>console.error(`Puppeteer still loading page ${canonicalURL}`));
  	let selector = "h1";
    await page.waitForSelector(selector, {timeout: 5000}).catch(e=>{});
  	if (pageNo && parseInt(pageNo) > 1) {
        await page.waitForSelector(`td>a[title*="Página ${pageNo}"]`);
        await page.click(`td>a[title*="Página ${pageNo}"]`);
        await page.waitForTimeout(5000);
    }
  	let html = await page.evaluate(() => document.documentElement.outerHTML);
	const $ = cheerio.load(html, {decodeEntities: false});
  	$("tbody tr[role='row'] a.linkMinisterio").each(function () {
      	let href = $(this).attr('href')
    	$(this).attr('href', href.replace(/:443/g, ''));
    })
    $('base, script, iframe').remove();
    return simpleResponse({canonicalURL, mimeType: "text/html", responseBody: $.html() });
}

const getPDF = async function ({argument, canonicalURL, headers}) {
    let customHeaders = {"DNT":"1","Sec-Fetch-Dest":"document","Sec-Fetch-Mode":"navigate","Sec-Fetch-Site":"none","Sec-Fetch-User":"?1","Upgrade-Insecure-Requests":"1","sec-ch-ua":"\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"102\", \"Google Chrome\";v=\"102\"","sec-ch-ua-mobile":"?0","sec-ch-ua-platform":"\"Windows\"","Accept-Encoding":"gzip, deflate, br"};
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = canonicalURL;
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  	//let responsePage = await puppeteerFetch({canonicalURL, headers})
    return responsePage;
};

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const isListing = canonicalURL.match(/proyectosdedecreto[0-9]{4}[a-z]?(?:\?page=(\d+))?/i);
  	const isPDFRequestURL = canonicalURL.match(/nodeId=/i);
    if (isListing) {
        const pageNo = canonicalURL.split('page=').pop() || null
    	return [await puppeteerFetch({pageNo, canonicalURL, requestURL:canonicalURL, headers})] 
    } 
  	else if (isPDFRequestURL) {
    	return [await getPDF({canonicalURL, headers})]      
    }
  	else {
      	return [await puppeteerFetch({canonicalURL, headers})]
    }
}