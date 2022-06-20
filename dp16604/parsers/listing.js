function parsePage({URL, responseBody, referer}) {
  	try {
        let $ = cheerio.load(responseBody.content)
        const results = []
        $("#tabla_normativa>tbody>tr").each(function () {
            let doc = { URI: [], URL };
            const tr = $(this);
            const fecha = tr.find('.fecha').last().text().trim() || null
            doc.dateOriginal = fecha;
            doc.date = formatDate(fecha);
            const title = tr.find('.titulo').text().trim() || null
            doc.title = title
            let match = /(?:Circular|Resolución)\D+([0-9.]+)/i.exec(title)
            if (/Circul/i.test(URL)) {
                doc.documentType = "Circular"
                doc.circularesNumber = match && match[1] || null
            } else if (/Resol/i.test(URL)) {
                doc.documentType = "Resolución"
                doc.resolutionNumber = match && match[1] || null
            }
            let href = tr.find('td a[href*=".pdf"], td a[href*=".doc"]').attr('href');
            href = href ? url.resolve(URL, href) : null;
            doc.URI.push(href);
            const program = tr.find('.programa').text().trim() || null
            doc.programOriginal = program;
          	doc.program = spaceCamelCased(program)
            match = /((?:19|20)[0-3][0-9]+)/.exec(title)
            let yearTr = tr.find('.periodo').text().trim()
            doc.year =  moment(formatDate(fecha)).year() || match && match[1] || /^(19|20)\d{2}$/.test(yearTr) && yearTr || null

            if(/(Circular|Resolución)/i.test(title)) {
                href && results.push(doc)
            }
        });	    
        return results
    } catch (error) {
    	console.log(error)
    }
}

function spaceCamelCased(str) { 
  str = str && str.replace(/([A-Z])/g, ' $1').replace(/(\s)\b[A-Z]\b/g, (x, y) => x.replace(y, '')) || null;
  str = str && str.replace(/\w+?([A-Z ]+)/g, (x, y) => x.replace(y, ` ${y}`)) || null;
  return str
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