function parsePage({URL, responseBody, referer}) {
  	let $ = cheerio.load(responseBody.content)
  	const results = []
   	function toTitleCase(string){
    	if(!string || !string.trim())return string;
      	let parts = string.split(/[\s\n]+/g);
      	for(let i=0; i<parts.length; i++){
        	parts[i] = parts[i].toLowerCase().trim();
          	if(parts[i].length>1 && !/^(del|al|sobre|l[oa]s?|el)$/i.test(parts[i])){
            	parts[i] = parts[i][0].toUpperCase()+parts[i].substring(1);
            }
        }
      	return parts.join(" ");
    }
    let pageHeader = $('#valor_completo_i__SP_pa_tituloPortadilla_1 .page-header, .tab-content .ntg-titulo-caja').first().text().trim()
    if (/circular/i.test(pageHeader)) {
    	let documentType = 'Circular'
      	let section = toTitleCase(pageHeader.replace(/^circular\S+\s+/i,""))||'Normativa Seguro de Cesantía'
        $("#documento1 tbody>tr").each(function () {
            let doc = {URI:[], URL, documentType, section}
            let tr = $(this)  
            let a = tr.find('td a').eq(0)
            doc.circularNumber = a.text()
          	doc.title = a.attr('title')
            let href = a.attr('href')
            href = href ? url.resolve(URL, href) : null;
            doc.URI.push(href)
            let title = a.text()
            let fecha = tr.find('td').eq(1).text().trim()
            doc.dateOriginal = fecha
            doc.date = formatDate(fecha)
            let materia = tr.find('td').eq(2).text().trim()
            doc.subjectMatter = materia
            href && moment(doc.date) >= moment('2022-05-01') && results.push(doc)
        });
    } else if (/resoluci/i.test(pageHeader)) {
    	let documentType = 'Resolución'
      	let section = toTitleCase(pageHeader.replace(/^(resoluci|Normativa)\S+\s+del?\s+/i,""))||'Normativa del Sistema de Pensiones'
        $('#recuadrosxAno .recuadro').each(function(){
        	let doc = {URI:[], URL, documentType, section}
            let card = $(this)
            let href = card.find('.format-pdf a').attr('href')
            href = href ? url.resolve(URL, href) : null;
          	doc.URI.push(href)
          	let title = card.find('.titulo a').text().trim()
            doc.title = title
          	doc.summary = card.find('.abstract').text().trim()
          	let match = /^\D+(\d+).*del?\D+(\d{1,2}\b[\w\s]+?\d{4})/.exec(title)
            let documentNumber = match && match[1]
            doc.documentNumber = documentNumber
          	let date = match && match[2]
            doc.dateOriginal = date
          	doc.date = formatDate(date)
          	doc.year = moment(doc.date).year()
            href && parseInt(doc.year) >= 2018 && results.push(doc)
        })
    }
    	    
  	return results.filter(record => {
    	if (/Resol/i.test(record.documentType)) {
        	return moment(record.date) >= moment('2022-06')
        } else if (/Circular/i.test(record.documentType)) {
        	return moment(record.date) >= moment('2022-06')
        } else {
        	return record
        }
    })
}

const formatDate = (date) => {
  let d = date && moment(date.replace(/\sdel?/g, ''), ['YYYY-MM-DD', 'DD MMMM YYYY', 'DD/MM/YYYY', 'DD-MM-YYYY'], 'es');
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