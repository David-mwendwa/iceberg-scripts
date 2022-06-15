function parsePage({URL, responseBody, referer}) {
  	let $ = cheerio.load(responseBody.content)
  	const results = []
    $("tbody tr[role='row']").each(function () {
        let mother = { URI: [], isMother: true }
        let child = { URI: [] };
      
        let tr = $(this);
        let a = tr.find('a.linkMinisterio');
      	let href = a.attr('href');
        let title = a.text()
        let summary = tr.find('.ParagrafMinisterio').last().text().replace(/\s+/g, ' ')
        let ctitleMatch = /["“](Por.+?)["”]/.exec(summary)
        let ctitle = ctitleMatch && ctitleMatch[1].toLowerCase()
        let parentURI = `https://www.urf.gov.co/webcenter/ShowProperty?t=${ctitle}`
        let match = /\b(?:hasta|al)\b.+?(\d{1,2} del? \w+(?: del? \d{4})?)/.exec(summary);
        let date = match && match[1];
      	if (!/(\d{4})/.test(date)) { 
            let ymatch = /(\d{4})/.exec(summary);
            date = `${match && match[1]} de ${ymatch && ymatch[1]}`;
        }
      	if (!/(\d{1,2} del? \w+ del? \d{4})/.exec(date)) date = null

      	// relationships
      	if (/Proyecto de/i.test(title)) {
          	mother.URI.push(parentURI);
        	mother.title = title
          	mother.s = summary
          	mother.commentEndDateSpanish = date;
        	mother.commentEndDate = formatDate(date);
        	mother.year = moment(formatDate(date)).year();
          	results.push(mother);
          
          	child.URI.push(href);
            child.parentURI = parentURI
            child.title = title
            child.s = summary
          	child.class = 'Initial Bill'
          	results.push(child);
        } else {
        	child.URI.push(href);
            child.parentURI = parentURI
            child.title = title
            child.s = summary
          	child.class = null
          	results.push(child);
        }
		
    });	    
  	return results.map(record => {
      	if (/=null/.test(record.parentURI)) {
          	let match = /electrónicos:\s+(.+)$/i.exec(record.s)
            let emails = match && match[1]
            let mother = results.filter(record => record.isMother && record.s.includes(emails))
            let parentURI = mother && mother[0] && mother[0].URI && mother[0].URI[0]
            return Object.assign(record, {parentURI})
        } else {
        	return record
        }
    })
  	//return results
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