async function fetchPage({canonicalURL, requestURL, requestOptions, headers}) {
    if (!requestOptions) requestOptions = {method: "GET", headers};
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
  	if (requestURL.match(/^https/i)) {
        requestOptions.agent = new https.Agent({rejectUnauthorized: false, keepAlive: true});
    }
    return await fetchWithCookies(requestURL, requestOptions)
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({URL: requestURL}, requestOptions),
                response
            };
        });
}

// PUPPETEER THROWING AN ERROR!!!
async function puppeteerFetch({canonicalURL, headers}) {
  	let match = /page=(.+)/.exec(canonicalURL)
    let pageNo = match && parseInt(match[1])
  	let requestURL = canonicalURL.replace(/\?.*/g, '')
  	let userAgents = ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36","Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:97.0) Gecko/20100101 Firefox/97.0","Mozilla/5.0 (Macintosh; Intel Mac OS X 12_2_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.2 Safari/605.1.15","Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko","Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36 Edg/98.0.1108.62",undefined];
  	let counter = getSharedVariable('counter') || 0;
  	if(counter>=userAgents.length)counter = 0;
  	let userAgent = userAgents[counter++];
  	setSharedVariable('counter', counter); 
    const page = await puppeteerManager.newPage({userAgent, incognito: true});
    await page.goto(requestURL,{waitFor:"networkidle0", timeout:60000}).catch(e=>console.error(`Puppeteer still loading page ${canonicalURL}`));
  	if (pageNo > 1) {
        let numOfClicks = 1;
        while (pageNo > numOfClicks) {
            await page.waitForSelector(`td[id="pagingWPQ2next"] a`);
            await page.click(`td[id="pagingWPQ2next"] a`);
            await page.waitForTimeout(6000);
            numOfClicks++;
        }
    }
  	let html = await page.evaluate(() => document.documentElement.outerHTML);
	const $ = cheerio.load(html, {decodeEntities: false});
    $('base, script, iframe').remove();	
   	$('td[id="pagingWPQ2next"]').append(`<a style='margin: 5px;' class='next-page' href='${canonicalURL.replace(/page=\d+/, `page=${pageNo+1}`)}'>NextPage: ${pageNo+1}</a>`);
  	html = $('#ctl00_PlaceHolderMain_WikiField').html();
    return simpleResponse({
            canonicalURL,
            mimeType: "text/html",
            responseBody: html,
        });
}

const getContent = async function ({argument, canonicalURL, headers}) {
    let customHeaders = {
        "DNT": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = canonicalURL;
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return responsePage;
};

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
  	const isListing = canonicalURL.match(/page=(.+)/)
    if (isListing) {
        let page = parseInt(isListing[1])
        return [await puppeteerFetch({canonicalURL, headers})]
      
    } else if (/[dp][od][cf]x?/i.test(canonicalURL)) {
      	return [await getContent({canonicalURL, headers})]
      
    } else {
        return [await fetchPage({canonicalURL, headers})];
    }
}

//https://cofemersimir.gob.mx/portales/resumen/53966

function getSeeds() {
    let seeds = []
    let start = moment();
    let stop = moment().subtract(1, 'months');

    //let start = moment("2022-03-01");
    //let stop = moment("2022-04-27");

    if (start.isAfter(stop)) [start, stop] = [stop, start];
    
    let yearFrom = moment(start).year()
    let yearTo = moment(stop).year()
    let range = (yearTo - yearFrom) % 2 === 0 ? 2 : 1
    for (let i = yearFrom; i < yearTo; i+=range) { 
        let startYear = i
        let stopYear = i + range

        start = moment(start.toString().replace(/(19|20)\d{2}/, startYear));
        stop = moment(stop.toString().replace(/(19|20)\d{2}/, stopYear));

        let seed = `http://www.cofemersimir.gob.mx/portales/?from=${start.format("YYYY-MM-DD")}&to=${stop.format("YYYY-MM-DD")}&page=1`
        console.log(`seed: ${seed}`)
        seeds.push(seed)
    }
    
    return seeds
}