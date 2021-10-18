async function puppeteerFetch({canonicalURL, headers}) {
    const page = await puppeteerManager.newPage();
    await page.goto(canonicalURL, {
        waitFor: "networkidle0",
        timeout: 30000
    }).catch(e => console.error(`Puppeteer still loading page ${canonicalURL}`));
    let html = await page.evaluate(() => document.documentElement.outerHTML);
    const $ = cheerio.load(html, {decodeEntities: false});
    $('base, script, iframe').remove();
    html = $.html();
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
  	const isUpto2015 = canonicalURL.match(/&item=(\d+)$/i)
    if (isUpto2015) {
      	let item = isUpto2015[1]
        return [await puppeteerFetch({canonicalURL, headers})];
               
    } else {
        return defaultFetchURL({canonicalURL, headers});
    }
}
