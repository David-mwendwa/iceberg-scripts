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

const handleContent = async function ({argument, canonicalURL, headers}) {
    let customHeaders = {"authority":"www.superfinanciera.gov.co","dnt":"1","sec-ch-ua":"\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"","sec-ch-ua-mobile":"?0","sec-ch-ua-platform":"\"Windows\"","sec-fetch-dest":"document","sec-fetch-mode":"navigate","sec-fetch-site":"none","sec-fetch-user":"?1","upgrade-insecure-requests":"1","Accept-Encoding":"gzip, deflate, br"};
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = canonicalURL;
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
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
    }
    return responsePage;
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
            } else if (/\.xlsx/i.test(responsePage.canonicalURL)) {
                responsePage.response.headers.set('content-type', "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
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
    const isContent = canonicalURL.match(/\.[dp][od][cf]x?/i);
  	const isZip = canonicalURL.match(/\.zip/i);
    if (isContent) {
        return [await handleContent({canonicalURL, headers})]
    } else if (isZip) {
        return await handleZip({canonicalURL, headers})
    } else {
        return defaultFetchURL({canonicalURL, headers});
    }
}