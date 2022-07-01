function parsePage({URL, responseBody, referer}) {
  	let $ = cheerio.load(responseBody.content)
  	const results = []
    
    $('.view-content .line-credit-row').each(function() {
      	let doc = { URI:[] }
        let href = $(this).find('a[href]').attr('href')
        href = href ? url.resolve(URL, href) : null;
      	href && doc.URI.push(href)
      	doc['URL'] = URL
      	
      	//let match = /vigente=(true|false)/.exec(URL)
        //doc['vigente'] = match && match[1]
      
      	results.push(doc)
    })
  
  	return results
}

const formatDate = (date) => {
  let d = date && moment(date.replace(/\sdel?/g, ''), ['DD MMMM YYYY', 'DD/MM/YYYY', 'DD-MM-YYYY'], 'es');
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