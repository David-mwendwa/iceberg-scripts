async function fetchPage({canonicalURL, requestURL, requestOptions, headers}) {
    if (!requestOptions) requestOptions = {method: "GET", headers};
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
  	return await fetchWithCookies(requestURL, requestOptions, "zone-g1-country-br")
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({URL: requestURL}, requestOptions),
                response
            };
        });
}

const changePagination = async function ({canonicalURL, responsePage}) {
	let html = await responsePage.response.text();
    let $ = cheerio.load(html)
  	$(".pagination > li.page-item > a").each(function (i) {
        let a = $(this)
        let text = a.text().trim()
        let href = a.attr('href')
        let match = /diario\/(\d+)/.exec(href)
        let page = match && parseInt(match[1]) || /^\d+$/.test(text) && text
        let pagination = canonicalURL.replace(/page=(\d+)/, `page=${page}`)
        if (page)
        	a.attr('href', pagination)
    })
    responsePage.response = new fetch.Response($('#main').html(), responsePage.response);
    return responsePage;
}

const getListing = async function ({from, to, page, canonicalURL, headers}) {
  	from = from.format('DD/MM/YYYY')
  	to = to.format('DD/MM/YYYY')
    let customHeaders = {
        "DNT": "1",
        "Referer": `http://www.tjma.jus.br/portal/diario${page === 1 ? '' : `/${page}`}?data_inicial=${from}&data_final=${to}`,
        "Upgrade-Insecure-Requests": "1",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = {method, headers: _headers};
  	let requestURL = `http://www.tjma.jus.br/portal/diario${page === 1 ? '' : `/${page}`}?data_inicial=${from}&data_final=${to}`;
  	//throw(JSON.stringify({from, to, page, canonicalURL, requestURL}, null, 4))
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  	await changePagination({canonicalURL, responsePage})
    return responsePage;
};

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const match = canonicalURL.match(/\?from=(.+)&to=(.+)&page=(\d+)$/i);
    if (match) {
        let from = moment(match[1]);
        let to = moment(match[2]);
        let page = match[3] ? parseInt(match[3]) : 1;
        return [await getListing({from, to, page, canonicalURL, headers})]
    } else {
        return [await fetchPage({canonicalURL, headers})]
        //return defaultFetchURL({canonicalURL, headers});
    }
}