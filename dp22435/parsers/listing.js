function parsePage({URL, responseBody, referer}) {
  	let $ = cheerio.load(responseBody.content)
  	const results = []
    $("table>tbody>tr").each(function () {
        let doc = {URI:[]}
        let row = $(this)
        let onClickPayload = row.find('>td:has(>button)').find('>button').attr('onclick');
        let match = /mostrarDetalleArbitrajeVentana\(([0-9]+),/.exec(onClickPayload)
        const id = match && match[1];
        let _content = id && `https://prodapp1.osce.gob.pe/sda/rest/public/documentos/findDetalleByCodDocumento?codDoc=${id}`;
        let content = row.find('>td a:contains("details")').attr('href')
        doc.URI.push(content)
        let fecha = row.find('>td').eq(0).text().trim()
        let title = row.find('>td').eq(2).text().trim() || null
        doc['URL'] = URL
        doc['Fecha de Emisión del Laudo'] = formatDate(fecha)
        doc['Tipo de Arbitraje'] = row.find('>td').eq(1).text().trim() || null
        doc['Entidad'] = row.find('>td').eq(2).text().trim() || null
        doc['Contratista'] = row.find('>td').eq(3).text().trim() || null
      	doc['Título'] = sentenceCase(title)
        doc['Parte Demandante'] = row.find('>td').eq(4).text().trim() || null
        doc['Proceso Selección'] = row.find('>td').eq(5).text().trim() || null
        doc['plazo'] = row.find('>td').eq(6).text().trim() || null
        doc['Condena Cuantificable en contra de la Entidad'] = row.find('>td').eq(7).text().trim()  || null
        doc['Condena Cuantificable en contra del Contratista'] = row.find('>td').eq(8).text().trim() || null     	
        
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