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

const getListing = async function ({argument, canonicalURL, headers}) {
    let customHeaders = {"Cache-Control":"max-age=0","DNT":"1","Sec-Fetch-Dest":"document","Sec-Fetch-Mode":"navigate","Sec-Fetch-Site":"cross-site","Sec-Fetch-User":"?1","Upgrade-Insecure-Requests":"1","sec-ch-ua":"\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"","sec-ch-ua-mobile":"?0","sec-ch-ua-platform":"\"Windows\"","Accept-Encoding":"gzip, deflate, br"};
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = 'https://www.bvc.com.co/pps/tibco/portalbvc/Home/Mercados/boletines?action=dummy';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return responsePage;
};

async function puppeteerFetch({canonicalURL}) {
    let match = /boletin=(.+?)&page=(.+)/.exec(canonicalURL);
    let boletin = match && match[1] //.replace(/_/, ' ')
    let pageNo = match && parseInt(match[2]);
    let requestURL = `${canonicalURL.replace(/\?.*/g, '')}?action=dummy`;
    const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 12_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15"
    const page = await puppeteerManager.newPage({userAgent, incognito: true});
    await page.goto(requestURL, { waitFor: "networkidle0", timeout: 60000 }).catch(e => console.error(`Puppeteer still loading page ${canonicalURL}`));
    const idMap = {
        Informativos_BVC: 'seg_acc_-68719874_17967f80005_-39bdc0a84ca9',
        Informativos_DERIVADOS: 'seg_acc_795b2b1d_140e8a10ff7_55430a0a600b',
        Informativos_MEC: 'seg_acc_-68719874_1798586e04e_15a3c0a84ca9',
        Normativos_BVC: 'seg_acc_795b2b1d_140e9d30e70_-6d920a0a600b',
        Normativos_DERIVADOS: 'seg_acc_795b2b1d_140e9d30e70_-518a0a0a600b',
        Normativos_MEC: 'seg_acc_-36fd85d1_1475dba7d5d_113f0a0a600b',
    };
    let selector = `#${idMap[boletin]} > .boletin_fila_historico > a`;
    await page.waitForSelector(selector);
    await page.click(selector);
    await page.waitForTimeout(5000);
    if (pageNo > 1) {
        await page.waitForSelector(`select[name="pagination_menu"]`);
        await page.select(`select[name="pagination_menu"]`, `${pageNo - 1}`);
        await page.waitForTimeout(5000);
    }
    let html = await page.evaluate(() => document.documentElement.outerHTML);
    const $ = cheerio.load(html, {decodeEntities: false});
    html = $('#contenedor_columnas_central_expandido').html()
    return simpleResponse({canonicalURL,mimeType: "text/html",responseBody: html}); 
}

const handleContent = async function ({canonicalURL, headers}) {
    let customHeaders = {"Cache-Control":"max-age=0","DNT":"1","Sec-Fetch-Dest":"document","Sec-Fetch-Mode":"navigate","Sec-Fetch-Site":"none","Sec-Fetch-User":"?1","Upgrade-Insecure-Requests":"1","sec-ch-ua":"\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"","sec-ch-ua-mobile":"?0","sec-ch-ua-platform":"\"Windows\"","Accept-Encoding":"gzip, deflate, br"};
    let _headers = Object.assign(customHeaders, headers); 
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = canonicalURL
  	let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  	let type = responsePage.response.headers.get('content-type');
  	let contentDisposition = responsePage.response.headers.get('Content-Disposition')
  	if (/zip/.test(contentDisposition)) {
    	return await handleZip({canonicalURL, headers});
    } else {
        return [responsePage]
    }
};

const handleZip = async function ({canonicalURL, headers}) {
    let responsePage = await fetchPage({canonicalURL, headers});
    let out = [];
    if (responsePage && responsePage.response.ok) {
        out = await unzip({request: responsePage.request, response: responsePage.response});
        let accepted = [];
        let $ = cheerio.load("<html lang='en'><body><h2>Contents</h2><ol id='zip-content-links'></ol></body></html>");
        let ul = $("ol#zip-content-links");
        for (let i = 0; i < out.length; i++) {
            let responsePage = out[i];
            responsePage.canonicalURL = encodeURI(decodeURI(responsePage.canonicalURL));
            ul.append(`<li><a href="${responsePage.canonicalURL}">${responsePage.canonicalURL}</a></li>\n`);
            let contentType = responsePage.response.headers.get("content-type");
            if (/empty|spreadsheet|excel/i.test(contentType)) {
                continue;
            }
            if (/\.pdf$/i.test(responsePage.canonicalURL)) {
                responsePage.response.headers.set('content-type', "application/pdf");
            } else if (/\.doc$/i.test(responsePage.canonicalURL)) {
                responsePage.response.headers.set('content-type', "application/msword");
            } else if (/\.docx$/i.test(responsePage.canonicalURL)) {
                responsePage.response.headers.set('content-type', "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            } else if (/\.html?$/i.test(responsePage.canonicalURL)) {
                responsePage.response.headers.set('content-type', "text/html");
            } else if (/\.txt$/i.test(responsePage.canonicalURL)) {
                responsePage.response.headers.set('content-type', "text/plain");
            } else if (/\.xml$/i.test(responsePage.canonicalURL)) {
                responsePage.response.headers.set('content-type', "text/xml");
            } else if (/\.json$/i.test(responsePage.canonicalURL)) {
                responsePage.response.headers.set('content-type', "application/json");
            } else {
                continue;
            }
            accepted.push(responsePage);
        }
        out = accepted;
        out.push(simpleResponse({canonicalURL, mimeType: "text/html", responseBody: $.html()}))
    }
    return out;
};

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const isListing = canonicalURL.match(/boletin=(.+?)&page=(.+)/i);
  	const isContent = canonicalURL.match(/www\.bvc\.com\.co\/pps\/tibco\/portalbvc\/Home\//)
    if (isListing) {
      	return [await puppeteerFetch({canonicalURL})]
      
    } else if (isContent) {
        return await handleContent({canonicalURL, headers})
      
    } else {
        return [await handleContent({canonicalURL, headers})]
      	//return [await fetchPage({canonicalURL, headers})]
    }
}