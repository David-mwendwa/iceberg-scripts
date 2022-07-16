function parsePage({URL, responseBody, referer}) {
  	let $ = cheerio.load(responseBody.content)
  	const results = []
    $("table#onetidDoclibViewTbl0 > tbody > tr").each(function () {
        let doc = {URI:[], URL}
        let tr = $(this);
        let a = tr.find('td a[href]')
        let title = a.text().trim().replace(/\s+/g, ' ').trim()
        doc.title = title;
        let href = a.attr('href')
        href = href ? url.resolve(URL, href) : null;
        doc.URI.push(href)
        let summary = tr.find('td .ms-rtestate-field').text();
        doc.summary = sentenceCase(summary) || null
        let fecha = tr.find('td').last().text()
        doc.dateOriginal = fecha
        doc.date = formatDate(fecha) || null
        doc.year = moment(doc.date).year() || null
        let match = /^\D+(\d+\s?[-–]\s?\d+)/i.exec(title) || /(\d+\s?[-–]\s?\d+)/i.exec(title);
        if (/oficio/i.test(title)) { 
            doc.documentType = 'Oficio' 
            doc.oficioNumber = (match && match[1]) || null;
        } else if (/circular/i.test(title)) {
            doc.documentType = 'Circular'
            doc.circularNumber = (match && match[1]) || null;
        } else {
            doc.documentType = 'Oficio'
            doc.oficioNumber = (match && match[1]) || null
        }
      	results.push(doc)
    });	 
  	return results
  	//return results.filter(record => parseInt(record.year) >= 2022)
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