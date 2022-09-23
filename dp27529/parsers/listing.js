async function parsePage({URL, responseBody, referer}) {
  	let $ = cheerio.load(responseBody.content)
  	const results = []
    let mainTitle = $('ul.modRuta li').last().text().trim()
    let match = /^([\s\w]+)([12][0-9]{3})/i.exec(mainTitle)
    let year = match && match[2];
  	let t = match && match[1].trim()
    let documentType = null
  	if (/externa/i.test(t)) {
    	documentType = 'Circular externa'  
    } else if (/circular/i.test(t)) {
    	documentType = 'Carta circular'  
    } else if (/Res/i.test(t)) {
    	documentType = 'Resolución'  
    }
    $("table.tabla_nuevoGris>tbody>tr").each(function () {
        let doc = {URI:[], URL, year, documentType}
        let tr = $(this)   	
        let href = tr.find('td').eq(0).find('a').attr('href')
        href = href ? url.resolve(URL, href) : null;
        doc.URI.push(href)
        let numero = tr.find('td').eq(0).text()
        doc.numero = numero
        let date = tr.find('td').eq(1).text()
        let fechaOriginal = `${date} ${year}`
        doc.fechaOriginal = fechaOriginal
      	doc.fecha = formatDate(fechaOriginal)
      	let title = `fecha ${fechaOriginal} numero ${numero}`
        doc.title = title
        let description = tr.find('td').eq(2).text()
        doc.description = description
      	let anexoURL = tr.find('td').eq(2).find('a').attr('href')
        anexoURL = anexoURL ? url.resolve(URL, anexoURL) : null;
      	anexoURL && doc.URI.push(anexoURL)
        doc.anexoURL = anexoURL || null
        let boletin = tr.find('td').eq(3).text()
        doc.boletin = boletin

      	href && /\.[dp][od][cf]x?/i.test(href) && results.push(doc)
    });	    
  
  	let final = []
    for (const obj of results) {
     	let anexoURL = obj.anexoURL
        if (/\.zip/i.test(anexoURL)) {
            let output = await parseRemoteUrl(anexoURL);
            let pmatch = output.filter(obj => obj.URL === anexoURL)
            let zipFiles = pmatch.reduce((acc, obj) => {
              	acc.push(obj.URI[0])
            	return acc
            }, [])
            final.push(Object.assign(obj, {zipFiles}))
        } else {
        	final.push(obj)
        }
    }
  	return final.filter(record => {
    	let docType = record.documentType
        if (/circular/i.test(docType)) {
        	return moment(record.fecha) > moment('2022-07-08') && record
        } else if (/Resolu/i.test(docType)) {
        	return moment(record.fecha) > moment('2022-07-05') && record
        }
    })
  	//return results
}

const mergePdfsToPdf = async function ({pdf_urls, locale}) {
    let res = null;
    try {
        res = await joinPDFsToMediaObject(pdf_urls);
    } catch (e) {
        console.error("Merging PDFs failed for " + JSON.stringify(pdf_urls), e);
    }
    return res && {
        mediaObjectId: res.id,
        fileFormat: "application/pdf",
        locale, dataType: "MEDIA"
    } || null;
};

const formatDate = (date) => {
  let d = date && moment(date.replace(/\sdel?/g, ''), ['MMMM DD YYYY', 'DD MMMM YYYY', 'DD/MM/YYYY', 'DD-MM-YYYY'], 'es');
  return d && d.isValid ? d.format('YYYY-MM-DD') : null;
}

const sentenceCase = (input) => {
  input = input === undefined ? null : input;
  return (
    input && input.toString().toLowerCase().replace(/(^|[.?!] *)([a-z])/g,
        (match, separator, char) => separator + char.toUpperCase()
      )
  );
};

const parseRemoteUrl = async (urlToParse, parserId = "A06rfnz43c9cuiz") => {
    const urlToParseId = "H" + new Buffer(urlToParse).toString("base64");
    const urlToParseId2 = "H" + sha256(urlToParse) + ".N";
    const resp = await graphql(`
          query {
            nodes(ids: ["${urlToParseId}", "${urlToParseId2}"]) {
              id
              ... on CrawledURL {
                lastSuccessfulRequest {
                  id
                }
              }
            }
          }`);

    let parserRes;
    let node = resp.nodes && resp.nodes.filter(n => n)[0];
    if (node && node.lastSuccessfulRequest) {
        // Parse acordao listing page
        parserRes = await graphql(`
            query {
              node(id:"${parserId}") {
                ... on CrawledPageParser {
                  jsonOutputFor(requestId:"${node.lastSuccessfulRequest.id}")
                }
              }
            }`);
    }

    return parserRes && parserRes.node && parserRes.node.jsonOutputFor;//returns array, filter as necessary
};