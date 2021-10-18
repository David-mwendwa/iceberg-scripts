
async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const match = canonicalURL.match(/\?(start|from)=(\d{4}-\d{2}-\d{2}).(end|to)=(\d{4}-\d{2}-\d{2})(&page=(\d+))?$/i);
    if (match) {
        let from = moment(match[2]);
        let to = moment(match[4]);
        let page = match[6] ? parseInt(match[6]) : 1;
        return [await fetchURL({canonicalURL, headers})]
    } else {
        const response = await defaultFetchURL({canonicalURL, headers});

        let out = [];

        if (response && response.length && response[0].response.ok && /\.zip\b/i.test(canonicalURL)) {
            out = await unzip({request: response[0].request, response: response[0].response});
            let accepted = [];
            let $ = cheerio.load("<html lang='en'><body><h2>Contents</h2><ul id='list'></ul></body></html>");
            let ul = $("ul#list");
            for (let i = 0; i < out.length; i++) {
                let responsePage = out[i];
                responsePage.canonicalURL = encodeURI(decodeURI(responsePage.canonicalURL));
                ul.append(`<li><a href="${responsePage.canonicalURL}">${responsePage.canonicalURL}</a></li>\n`);
                let contentType = responsePage.response.headers.get("content-type");
                if(/empty|spreadsheet|excel/i.test(contentType)){
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
            out.push(simpleResponse({canonicalURL, mimeType:"text/html", responseBody: $.html()}))
        } else {
            return response;
        }
        return out;
    }
}


// Parser for connecting the ZIP and its content
async function parsePage({ responseBody, URL, html, referer }) {
  const $ = cheerio.load(responseBody.content);
  const results = [];
  let URI = [URL];
  $('a[href*="doc"], a[href*="docx"], a[href*="pdf"]').each(function () {
    let docURL = $(this).attr('href');
    results.push({ URI: docURL, parentURL: URL });
  });
  return results;
}
