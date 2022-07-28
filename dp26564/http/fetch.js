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

async function puppeteerFetch({canonicalURL, headers}) {
  	let match = /year=(.+?)&tematica=(.+?)&page=(.+)/.exec(canonicalURL)
    let year = match && match[1]
    let tematica = match && match[2]
    let pageNo = match && parseInt(match[3])
    let yearstring = encodeURI(`;#${year};#`).replace(/;#/g, "%3B%23")
    let docgroupstring = encodeURI(`;#${year};#${tematica};#`).replace(/;#/g, "%3B%23").replace(/,/g, '%2C').replace(/%252C/g, "%2C")
  	//throw(JSON.stringify({year, pageNo, canonicalURL, yearstring, docgroupstring}, null, 4))
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
  	await page.waitForSelector(`tbody[groupstring*="${docgroupstring}"] a`);
  	await page.click(`tbody[groupstring*="${docgroupstring}"] a`);
    await page.waitForTimeout(5000);
  	if (pageNo > 1) {
        let numOfClicks = 1;
        while (pageNo > numOfClicks) {
            await page.waitForSelector(`td[id="pagingWPQ4next"] a`);
      		await page.click(`td[id="pagingWPQ4next"] a`);
            await page.waitForTimeout(5000);
            numOfClicks++;
        }
    }
  	let html = await page.evaluate(() => document.documentElement.outerHTML);
	const $ = cheerio.load(html, {decodeEntities: false});
    $('base, script, iframe').remove();	
  	$('td[id="pagingWPQ4next"]').append(`<a style='margin: 5px;' class='next-page' href='${canonicalURL.replace(/page=\d+/, `page=${pageNo+1}`)}'>NextPage: ${pageNo+1}</a>`);
  	html = $("#MSOZoneCell_WebPartWPQ4").html();
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
  	html = $("#MSOZoneCell_WebPartWPQ4").html();
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
  	const isHome = canonicalURL.match(/Norm_Conceptos\.aspx$/i)
  	const isListing = canonicalURL.match(/Norm_Conceptos\.aspx\?year=(.+?)&tematica=(.+?)&page=(.+)/i)
    if (isHome) {
    	return [await _puppeteerFetchHome({canonicalURL, headers})]
    }
    if (isListing) {
        let year = isListing[1]
        return [await puppeteerFetch({canonicalURL, headers})]
      
    } else {
      	return [await fetchPage({canonicalURL, headers})]
        //return defaultFetchURL({canonicalURL, headers});
    }
}