function parsePage({URL, responseBody, referer}) {
  	let $ = cheerio.load(responseBody.content)
  	const results = []
    $('#ctl00_PageContent_pnlTabla>table>tbody>tr').each(function () {
        let doc = { URI: [], URL };
        let row = $(this);
        let entidad = row.find('td.ttc').eq(0).text().replace(/\s+/g, ' ');
        doc['Entidad emisora'] = entidad
        let tipo = row.find('td.ttc').eq(1).text().replace(/\s+/g, ' ');
        doc['Tipo documento'] = tipo
        let numero = row.find('td.ttc').eq(2).text().replace(/\s+/g, ' ');
        doc['Número de documento'] = numero
        let title = row.find('td.ttc').eq(3).text().replace(/\s+/g, ' ');
        doc.title = title
        let fecha = row.find('td.ttc').eq(4).text().replace(/\s+/g, ' ');
        doc['Fecha de Emisión'] = formatDate(fecha)
        let href = row.find('td a[href*=".pdf"], a[href*=".PDF"], a[href*=".doc"], a[href*=".DOC"]').attr('href')
        href = href ? url.resolve(URL, href) : null;
        doc.URI.push(href)
      
      	let unrequiredTypes = /Decretos\s+Supremos/i.test(tipo) || /Leyes/i.test(tipo) || /Reglamento\s+Interno\s+de\s+Registro/i.test(tipo)

        href && !unrequiredTypes && results.push(doc);
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