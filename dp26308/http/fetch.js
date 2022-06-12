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

const home = async function ({argument, canonicalURL, headers}) {
    let customHeaders = {
        "authority": "cvs.gov.co",
        "cache-control": "max-age=0",
        "dnt": "1",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"101\", \"Google Chrome\";v=\"101\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = 'https://cvs.gov.co/resoluciones/';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  	await parseForm({ responsePage });
    return responsePage;
};

const parseForm = async function ({ responsePage }) {
    let html = await responsePage.response.buffer();
    responsePage.response = new fetch.Response(html, responsePage.response);
    const $ = cheerio.load(html, { decodeEntities: false });
  	const search_ids = {};
  	$(".wpfd-categories a").each(function(){
    	let a = $(this);
        let year = a.attr('title') || a.text();
        if (!/[0-9]+/.test(year)) return;
        search_ids[year] = search_ids[year] || a.attr('data-idcat');   
    })
  	setSharedVariable('search_ids', search_ids)
};

const searchByYear = async function ({year, canonicalURL, headers}) {
  	await home({headers})
  	const search_ids = getSharedVariable('search_ids')
    let customHeaders = {
        "authority": "cvs.gov.co",
        "dnt": "1",
        "referer": "https://cvs.gov.co/resoluciones/",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"101\", \"Google Chrome\";v=\"101\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = `https://cvs.gov.co/wp-admin/admin-ajax.php?juwpfisadmin=false&action=wpfd&task=categories.display&view=categories&id=${search_ids[year]}&top=694`;
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return responsePage;
};

const getDocumentsByYearSearch = async function ({year, page, canonicalURL, headers}) {
  	if (+page === 1) {
    	await searchByYear({year, headers})
    } else {
    	await home({headers})
    }
  	const search_ids = getSharedVariable('search_ids')
    const hasPagination = parseInt(page) > 1
    //throw(JSON.stringify(search_ids[year], null, 4))
    let customHeaders = {
        "authority": "cvs.gov.co",
        "dnt": "1",
        "referer": "https://cvs.gov.co/resoluciones/",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"101\", \"Google Chrome\";v=\"101\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers); 
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = `https://cvs.gov.co/wp-admin/admin-ajax.php?juwpfisadmin=false&action=wpfd&task=files.display&view=files&id=${search_ids[year]}&rootcat=694&page=${hasPagination ? page : ''}&orderCol=title&orderDir=desc`;
  	let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  	responsePage.response.headers.set('content-type', 'application/json');
    return responsePage;
};

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const isSearch = canonicalURL.match(/\?year=(\d+)&page=(\d+)$/i);
    if (isSearch) {
        let year = parseInt(isSearch[1]);
      	let page = isSearch[2] ? parseInt(isSearch[2]) : 1;
        return [await getDocumentsByYearSearch({year, page, canonicalURL, headers})]
      
    } else {
      	return [await fetchPage({canonicalURL, headers})]
        //return defaultFetchURL({canonicalURL, headers});
    }
}