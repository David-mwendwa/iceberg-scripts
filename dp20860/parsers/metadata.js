async function parsePage({URL, responseBody, referer}) {
  	let $ = cheerio.load(responseBody.content)
  	const results = []
  
    let doc = {URI: []}
    let container = $('div.container')
    let pdf = container.find('a:contains("Descargar"), a:contains("PDF")').first().attr('href');
    pdf = pdf ? url.resolve(URL, pdf) : null;
    doc.URI.push(pdf)
    let title = container.find('>h2').first().text().trim().replace(/(\n|\s+)/g, ' ')
    doc.title = title
    let concepto_number = /Concepto\D+(\d+)\b/i.exec(title);
    doc.concepto_number = concepto_number && concepto_number[1]
    let year = /Concepto.+?de\D+(\d{4})/i.exec(title);
    doc.year = year && year[1]
    let radicado_str = container.find('p:contains("Radicado No")').text();
    doc.radicado = radicado_str.split(':').pop().trim();
    let date_str = container.find('p:contains("Fecha:")').text();
    let date_match = /Fecha:\s+(\d{2}.+?\d{4})/i.exec(date_str);
    doc.date = date_match && formatDate(date_match[1])
    let e_date_str = container.find('p:contains("Fecha de Expedición")').text();
    let e_date_spanish = e_date_str.split(':').pop().trim();
    doc.expedition_date = formatDate(e_date_spanish);
    let coming_into_force_date_str = container.find('p:contains("Fecha de Entrada en Vigencia")').text();
    let coming_into_force_date = coming_into_force_date_str.split(':').pop().trim() || null
    doc.coming_into_force_date = formatDate(coming_into_force_date) || null;
    let ref_str = container.find('p:contains("REF"), p:contains("Ref"), p:contains("RER"), p:contains("Rer")').text().trim().replace(/(\n|\s+)/g, ' ')
    let ref_match = /REF?.*?[.:]\W(.+)/i.exec(ref_str);
    doc.REF = ref_match && ref_match[1] 
    let temas = container.find('#accordion>div.card-accordion').eq(1)
    doc.subject_matter = temas.find('.card-body>h5').first().text()
    doc.subject_matter2 = temas.find('.card-body>h6').first().text().split(':').pop().trim() || null
    let summary = temas.find('.card-body>p').first().text().trim()
    doc.summary = summary.replace(/(\n|\s+)/g, ' ');
  	
  	results.push(doc)
    
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