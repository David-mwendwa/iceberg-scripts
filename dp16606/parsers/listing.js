function parsePage({URL, responseBody, referer}) {
  	let $ = cheerio.load(responseBody.content)
  	const results = []
    $(".box.normativa-item .row").each(function () {
        let doc = {URI:[], URL}
        let row = $(this)
        let year = row.find('div').eq(0).text().trim()
      	let date = row.find('div').eq(1).text().trim()
        doc.dateOriginal = date
      	doc.date = formatDate(date)
      	doc.year = /^\d{4}/.test(year) ? year : moment(doc.date).year()
      	let title = row.find('div').eq(2).text().trim()
        doc.title = title
        let match = /\D+?([\d\.]+)/.exec(title)
        doc.number = match && match[1]
      	let summary = row.find('div').eq(3).text().trim()
        doc.summary = summary
      	let href = row.find('a').last().attr('href')
        doc.URI.push(href)
      	if (/Circu/i.test(URL)) {
        	doc.documentType = 'Circulares'
        } else if (/Dict/i.test(URL)) {
        	doc.documentType = 'Dictámenes'
        } else if (/Ofic/i.test(URL)) {
        	doc.documentType = 'Oficios'
        } else if (/Resolu/i.test(URL)) {
        	doc.documentType = 'Resoluciones'
        } else doc.documentType = null
      	   
      	results.push(doc)
    });	    
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