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
  	let match = /year=(.+?)&page=(.+)/.exec(canonicalURL)
    let year = match && match[1]
    let pageNo = match && parseInt(match[2])
    let yearstring = encodeURI(`;#${year};#`).replace(/;#/g, "%3B%23")
  	//throw(JSON.stringify({year, pageNo, canonicalURL, yearstring}, null, 4))
  	let requestURL = canonicalURL.replace(/\?.*/g, '')
  	let userAgents = ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36","Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:97.0) Gecko/20100101 Firefox/97.0","Mozilla/5.0 (Macintosh; Intel Mac OS X 12_2_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.2 Safari/605.1.15","Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko","Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36 Edg/98.0.1108.62",undefined];
  	let counter = getSharedVariable('counter') || 0;
  	if(counter>=userAgents.length)counter = 0;
  	let userAgent = userAgents[counter++];
  	setSharedVariable('counter', counter); 
    const page = await puppeteerManager.newPage({userAgent, incognito: true});
    await page.goto(requestURL,{waitFor:"networkidle0", timeout:60000}).catch(e=>console.error(`Puppeteer still loading page ${canonicalURL}`));
  	await page.waitForSelector(`tbody[groupstring*="${yearstring}"] a`);
  	await page.click(`tbody[groupstring*="${yearstring}"] a`);
  	await page.waitForTimeout(5000);
  	if (pageNo > 1) {
        let numOfClicks = 1;
        while (pageNo > numOfClicks) {
            await page.waitForSelector(`td[id="pagingWPQ1next"] a`);
            await page.click(`td[id="pagingWPQ1next"] a`);
            await page.waitForTimeout(5000);
            numOfClicks++;
        }
    }
  	let html = await page.evaluate(() => document.documentElement.outerHTML);
	const $ = cheerio.load(html, {decodeEntities: false});
    $('base, script, iframe').remove();	
  	html = $("#internal").html();
    return simpleResponse({
            canonicalURL,
            mimeType: "text/html",
            responseBody: html,
        });
}


async function _puppeteerFetchHome({canonicalURL, headers}) {
    const page = await puppeteerManager.newPage();
    await page.goto(canonicalURL, {
        waitFor: "networkidle0",
        timeout: 30000
    }).catch(e => console.error(`Puppeteer still loading page ${canonicalURL}`));
    let html = await page.evaluate(() => document.documentElement.outerHTML);
    const $ = cheerio.load(html, {decodeEntities: false});
    $('base, script, iframe').remove();
  	html = $("#internal").html();
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
  	const isHome = canonicalURL.match(/OrdenanzasCas\.aspx$/)
  	const isOrdenanzas = canonicalURL.match(/OrdenanzasCas\.aspx\?year=(.+?)&page=(.+)/)
    if (isHome) {
    	return [await _puppeteerFetchHome({canonicalURL, headers})]
    }
    if (isOrdenanzas) {
        let year = isOrdenanzas[1]
        return [await puppeteerFetch({canonicalURL, headers})]
      
    } else {
        return defaultFetchURL({canonicalURL, headers});
    }
}