async function parsePage({URL, responseBody, referer}) {
  	let $ = cheerio.load(responseBody.content)
  	const results = []
	    
    $(".vc_tta-panels-container #proyectos-files .proyectos-file").each(function () {
        let doc = {URI:[], URL}
        let li = $(this)
        /*li.find('a[href*=".pdf"], a[href*=".docx"], a[href*=".doc"]').each(function(){
        	let href = $(this).attr('href')
            doc.URI.push(href ? url.resolve(URL, href) : null)
        })*/
      	if (li.find('a.content-url').length) {
        	let href = li.find('a.content-url').attr('href')
            doc.URI.push(href ? url.resolve(URL, href) : null)
        } else {
        	let href = li.find('a[href*=".pdf"], a[href*=".docx"], a[href*=".doc"]').first().attr('href')
            doc.URI.push(href ? url.resolve(URL, href) : null)
        }
      	
      	doc.title = li.find('.call_left').text().trim()
      	
      	li.find('.call_right .desc').each(function () {
            let data = $(this).text().replace(/\s+/g, ' ').trim();
            let match = /(Fecha .+?): (\d{2} \w+ \d{4})/.exec(data);
            if (match) doc[match[1]] = formatDate(match[2])
          	doc.year = moment(formatDate(match[2])).year()
            match = /(Plazo .+?): (\d{2} \w+ \d{4})/.exec(data);
            if (match) doc[match[1]] = formatDate(match[2]);
            match = /(Estado): (\w+)/.exec(data);
            if (match) doc[match[1]] = match[2];
            results.push(doc)
        });  
    })
  	// filter out the records without a pdf
  	const final = []
  	for (const record of results) {
    	const pdf = record.URI[0]
        let pdfExists = await parseRemoteUrl(pdf);
      	if (pdfExists) {
        	final.push(record)
        }
    }
  	return final
  	//return results
}

const formatDate = (date) => {
  let d = date && moment(date.replace(/\sdel?/g, ''), ['DD MMMM YYYY', 'DD MMM YYYY', 'DD/MM/YYYY', 'DD-MM-YYYY'], 'es');
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

const parseRemoteUrl = async (urlToParse, parserId = "A06rc6d47bbtgso") => {
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