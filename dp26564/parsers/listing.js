function parsePage({responseBody, URL}) {
  	const results = [];
    let $ = cheerio.load(responseBody.content)
    let container = $('#scriptWPQ4');
    container.find('tbody[isLoaded="true"] > tr').each(function () {
        let doc = {URI: [], URL}
        let tr = $(this);
        let a = tr.find('td:has(a[href]) a');
        let href = a.attr('href')
        href = href ? url.resolve(URL, href) : null;
        doc.URI.push(href)
        let title = a.text().replace(/\s+/, ' ').trim();
        doc.title = title
        doc.summary = tr.find('td').eq(3).text() || null
      	doc.documentType = 'concepto'
        let match = /Concepto\D+(\d+)/i.exec(title)
        let conceptoNumber = match && match[1];
      	doc.conceptoNumber = conceptoNumber
        let year = tr.find('td').eq(1).text();
        doc.year = year
        let fecha = tr.find('td').eq(5).text()
        fecha = !/\d{4}/.test(fecha) ? `${fecha} ${year}` : fecha
      	doc.publishedDateOriginal = fecha
        doc.publishedDate= formatDate(fecha)
        if (/\.[pd][do][fc]x?/i.exec(href)) {
          results.push(doc)
        }
    });
    return results
    //return results.filter(obj => moment(obj.fecha) >= moment('2022-04-05'));
}

function formatDate(date) {
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