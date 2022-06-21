const SHOW_PARSER_OUTPUT = false;//settting to true will break the html transcoded content, but enable you to view parser output in browser

async function parsePage({URL, responseBody, html}) {
    if (!/pdf/i.test(responseBody.fileFormat)) {
        console.error("Error: File is NOT valid PDF " + URL);
        return [];
    }
  	const results = []

    if (html) {
        const $ = cheerio.load(html);
      	// change the incorrect page numbering
        $('#pdf-container > div[data-page-no]').each(function (index) {
          const correctPageNumber = index + 1;
          $(this).attr('data-page-no', correctPageNumber);
        });

      	// Extract the metadata
        let arr = []
        let hasNoDiv = $('div[data-page-no="1"], div[data-page-no="2"]').find('div:not(:has(div)), p:not(:has(p))');
        hasNoDiv.each(function (i) {
          	arr.push($(this).text())
        });
        const text = arr.join(', ').replace(/\s+/g, ' ')
        let spanish_date = spanishDate(text);
        let published_date = spanish_date       
        let match = /Número\D+(\d+)/.exec(text);
        let gazette_number = match && match[1]      
        match = /Depósito\s+Legal\s+([\s\w-]+)/i.exec(text);
        let deposito_legal = match && match[1]

      	// split the pdf 
        const sections = []
        let title = '';
        let section = ''
        hasNoDiv.each(function (i) {
            let d = {}
            let line = $(this).text();
            title = title + line
            if (/([A-Z]+):/.exec(line)) {
                section = line.trim().replace(/:$/, '')
            }
            let match = /[.\s]{2,}(\d+)/.exec(line);
            if (match) {
                d['section'] = section
                d['title'] = title
                let page = match[1];
                d['page'] = page;
                title = '' 
                sections.push(d);
            }
        });
      	let locale = "es";
      	for (let i = 0; i < sections.length; i++) {
            const obj = {URI: [], URL}
            let { section, title, page } = sections[i];
            let startPage = sections[i].page
            let endPage = i < sections.length - 1 ? sections[i + 1].page : 'end'
            obj['section'] = section
            obj['title'] = title.replace(/^.*?—/g, '').replace(/[.\s]{4,}.*/g, '').trim()
          	obj['publishedDate'] = formatDate(published_date)
          	obj['gazetteNumber'] = gazette_number
          	obj['depositoLegal'] = deposito_legal
          	obj['startPage'] = startPage
          	obj['endPage'] = endPage
          	obj['pdfContent'] = await splitPDF({pdfURL: URL, startPage, endPage, locale})
          	obj["htmlContent"] = obj.pdfContent && obj.pdfContent.mediaObjectId && await transcodeMediaObject({mediaObjectId: obj.pdfContent.mediaObjectId, filter:"pdf2htmlEx", locale});
          	obj["text"] = obj.pdfContent && obj.pdfContent.mediaObjectId && await transcodeMediaObject({mediaObjectId: obj.pdfContent.mediaObjectId, filter:"pdftotext_raw", locale});
          	obj.URI.push(URL + (URL.search(/\?/) > 0 ? "&" : "?") + `split=${startPage}-${endPage}` + `&title=${obj.title && obj.title.replace(/\s+/g, '_').replace(/:/g, '').toLowerCase()}`)
            results.push(obj)        
        }
    } 
    return results.filter(record => moment(record.publishedDate) >=  moment('2022-01-01'))
}

const spanishDate = (text) => {
    if (!text) return
    text = text.replace(/\s+/g, ' ')
    let dmatch = /lunes\D+(\d{1,2} (?:de )?\w{3,} ?(?:de )?\d{4})/i.exec(text);
    if (!dmatch) {
    	dmatch = /.+?(\d{1,2} (?:de )?\w{3,} ?(?:de )?\d{4})/i.exec(text);
    }
    if (!dmatch) {
    	dmatch = /(\w+ \d{2} de \d{4})/.exec(text);
    }
    return dmatch && dmatch[1];
};
function formatDate(date) {
    let d = date && moment(date.replace(/\sdel?/g, ''), ['DD MMMM YYYY', 'DD/MM/YYYY', 'DD-MM-YYYY'], 'es');
    return d && d.isValid ? d.format('YYYY-MM-DD') : null;
}

async function splitPDF({pdfURL, startPage = 1, endPage = 'end', locale}) {
    const URLId = "H" + new Buffer(pdfURL).toString("base64");
    const URLIdN = "H" + sha256(pdfURL) + ".N";
  	//throw `${URLId}\n${URLIdN}`;
    const resp = await graphql(`
            query {
              nodes(ids: ["${URLId}", "${URLIdN}"]) {
                id
                ... on CrawledURL {
                  lastSuccessfulRequest {
                    outputForFilter(filter: "getPDFRange", arguments: {FROM: "${startPage}", TO: "${endPage}"})
                  }
                }
              }
            }`);
    const res = resp.nodes && (resp.nodes[0] || resp.nodes[1]);
    const transcodedMediaObject = res && res.lastSuccessfulRequest &&
        res.lastSuccessfulRequest.outputForFilter &&
        res.lastSuccessfulRequest.outputForFilter.length &&
        res.lastSuccessfulRequest.outputForFilter[0].filterOutput &&
        res.lastSuccessfulRequest.outputForFilter[0].filterOutput.transcodedMediaObject;
    //throw(JSON.stringify({resp},null, 3))
    if (transcodedMediaObject) {
        let doc = {
            URI: pdfURL + (pdfURL.search(/\?/) > 0 ? "&" : "?") + `split=${startPage}-${endPage}`,
            parent_url: pdfURL
        };
        doc.content = {
            mediaObjectId: transcodedMediaObject.id,
            fileFormat: "application/pdf",
            locale
        };
        return doc.content
    }
    return null;
}

async function transcodeMediaObject({mediaObjectId, filter, locale}) {
  const resp = await graphql(`
 	 mutation {
		transcodeMediaObject (input: {
        	clientMutationId: "0",
        	filter: "${filter}",
        	mediaObjectId: "${mediaObjectId}"
      	}) {
        	mediaObject {
          		id, content
        	}
      	}
   	}`);
  if(resp && resp.transcodeMediaObject && resp.transcodeMediaObject.mediaObject && resp.transcodeMediaObject.mediaObject){
  	return {
    	mediaObjectId: resp.transcodeMediaObject.mediaObject.id,
      	content: SHOW_PARSER_OUTPUT?resp.transcodeMediaObject.mediaObject.content: undefined,
      	locale,
      	fileFormat: /html/i.test(filter)?"text/html":"text/plain",
    }
  }
  return null;
}