async function parsePage({URL, responseBody, referer}) {
  	let $ = cheerio.load(responseBody.content)
    const results = [];
  
  	let doc = {URI:[URL], ModifiedURI:[], RepealedURI:[]}
    
    let container = $('div.field-group-div');
    container.find('.field').each(function () {
        const label = $(this).find('h2.field-label').text().trim().replace(/:$/, '')
        const values = [];
        $(this).find('ul>li').each(function () {
        	values.push($(this).text())
        })
        doc[label] = values.length ? values.join(', ') : null
    })
    let table = $('table tbody'); 
    let contentFile = table.find('tr td:has(span.file) a[href*=pdf]').eq(0)
    let text = contentFile.text().replace(/\s+/, ' ')
    doc['title'] = text
    let pdf = contentFile.attr('href')
    doc.URI.push(pdf)
    let match = /^\D+(\d{2,4})/.exec(text)
    doc['circular number'] = match && match[1] || null
    let dmatch = /(\d{2} (?:de )?\w{3,} (?:de )?\d{4})/.exec(text);
    if (!dmatch) { 
      	dmatch = /(\w+ \d{2} de \d{4})/.exec(text)
    }
  	const spanisDate = (text) => {
        let dmatch = /(\d{2} (?:de )?\w{3,} ?(?:de )?\d{4})/.exec(text);
        if (!dmatch) { 
          dmatch = /(\w+ \d{2} de \d{4})/.exec(text)
        }
        return dmatch && dmatch[1]
    }
    let spanish_date = spanisDate(text)
    doc['spanish_date'] = spanish_date
    doc['date'] = formatDate(spanish_date)
  	doc['year'] = moment(formatDate(spanish_date)).year()
  	let isVigente = $('tr td:has(span.file) a:contains("Modificada con"), td:has(span.file) a:contains("Terminada con")').length
  	doc['vigente'] = isVigente ? false : true
  
  	// ModifiedURI, RepealedURI metadata
  	table.find('tr').each(function () {
        let file = $(this).first().find('td:has(span.file) a:contains("Modificada con"), td:has(span.file) a:contains("Terminada con")')
        let href = file.attr('href');
        let text = file.text()
        let parts = text.split(/\n/).map(p => p.trim())
      	if (/Modificada/i.test(parts[0])) {
          	doc.ModifiedURI.push(href)
        } else if (/Terminada/i.test(parts[0])) {
        	doc.RepealedURI.push(href)
        }
    })
  	doc.ModifiedURI = doc.ModifiedURI.length ? doc.ModifiedURI : null
  	doc.RepealedURI = doc.RepealedURI.length ? doc.RepealedURI : null
  
  	pdf && results.push(doc)
  
  	// No vigentes
    table.find('tr').each(function () {
        let d = {URI: []}
        let file = $(this).first().find('td:has(span.file) a:contains("Modificada con"), td:has(span.file) a:contains("Terminada con")')
        let href = file.attr('href');
        d.URI.push(href)
        let text = file.text()
        let parts = text.split(/\n/).map(p => p.trim())
        let title = parts.join(' ').replace(/^.*?: /, '')
        d['title'] = parts.join(' ').replace(/^.*?: /, '');
        if (!/Modificada/i.exec(parts[0])) {
            let spanish_date = spanisDate(text)
            let date = spanish_date
            d['End of validity date'] = formatDate(date)
        }
      	href && results.push(d)
    })
    return results
}

function formatDate(date) {
  let d = date && moment(date.replace(/\sdel?/g, ''), ['DD MMMM YYYY', 'DD/MM/YYYY', 'DD-MM-YYYY', 'MMMM DD YYYY'], 'es');
  return d && d.isValid ? d.format('YYYY-MM-DD') : null;
}
const sentenceCase = (input) => {
  input = input === undefined ? null : input.trim().replace(/(^["']+|["']+$)/g, '')
  return (
    input && input.toString().toLowerCase().replace(/(^|[.?!] *)([a-z])/g,
        (match, separator, char) => separator + char.toUpperCase()
      )
  );
};
