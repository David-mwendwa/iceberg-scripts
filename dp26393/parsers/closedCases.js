function parsePage({URL, responseBody, referer}) {
  	let $ = cheerio.load(responseBody.content)
  	const results = [] 
    const isMotherChildStruc = $('.columns .accordion-wrapper').length
    if (isMotherChildStruc) {
        const mother = { URI: [URL], isMother: true };
      	const title = $('.page-title').text()
        let investigationIntro = $('th:contains("intro") +  td').text().trim() || null;
        let caseOpenedDate = $('th:contains("opened") +  td').text().trim() || null;
        let caseClosedDate = $('th:contains("closed") +  td').text().trim() || null;
        let summary = $('th:contains("Summary") +  td').text().trim() || null;
        let relevantLegalProvision = $('th:contains("legal provision") +  td').text().trim() || null;
        mother.section = $(`.breadcrumb a[href]`).last().text().trim() || null;
      	mother.title = title
        mother.URI.investigationIntro = investigationIntro;
        mother.caseOpenedDate = formatDate(caseOpenedDate);
        mother.caseClosedDate = formatDate(caseClosedDate);
        mother.summary = summary
        mother.relevantInstrument = relevantLegalProvision;
        mother.year = moment(mother.caseClosedDate).year() || null;
        results.push(mother)

        $('.columns .accordion-wrapper').each(function () {
          let doc = {URI:[], parentURI: URL}
          let row = $(this);
          let accordionId = row.find('button[id]').attr('id')
          let title = row.find('.accordion-header .accordion-title').text().trim();
          let slug = title.toLowerCase().replace(/\s+/g, '_').replace(/[\(\)]/g, '')
          let eventURL = slug ? `${URL}?title=${slug}` : null
          doc.URI.push(eventURL)
          let match = /(\d{1,2}\s+\w+\s+\d{4})/.exec(title);
          let dateOriginal = match && match[1]
          let date = formatDate(dateOriginal)
          doc.title = title
          doc.dateOriginal = dateOriginal
          doc.date = date
          let panel = row.find('.accordion-panel');
          let htmlContent = null
          if (panel.find('a[href*="pdf"]').length) {
              panel.find('a[href*="pdf"]').each(function () {
                let href = $(this).attr('href')
                doc.URI.push(href)
              })
              $("a").each(function() { $(this).replaceWith($(this).text()) })
              htmlContent = {content: panel.html(), fileFormat:"text/html", locale:"en", dataType: "MEDIA"}
          } else {
              $("a").each(function() { $(this).replaceWith($(this).text()) })
              htmlContent = {content: panel.html(), fileFormat:"text/html", locale:"en", dataType: "MEDIA"}
          }
          doc.htmlContent = htmlContent;
          results.push(doc)
        });  
    } else {
      	const title = $('.page-title').text()
    	const headerSection = $('.columns hr + p').html().split('<br>').map(item => item.trim().replace(/(<|>|\t|\/|strong)/ig, ''))
        let mother = headerSection.reduce((acc, curr) => {
          let key = curr.split(':')[0] && curr.split(':')[0].trim()
          let value = curr.split(':')[1] && curr.split(':')[1].trim();
          acc.push({ [key]: value })
          return acc
        }, []).reduce((acc, obj) => {
          let doc = {URI:[]}
          let returnObj = getPropName(Object.keys(obj), Object.values(obj).toString())
          let ob = Object.assign(acc, returnObj)
          return ob
        }, {})
        results.push(Object.assign({URI:[URL], isMother: true, title},mother))

        function getPropName(key, value){
          let returnKey = {}
          if (/Complainant$/i.test(key)) {
            returnKey = 'complainant';
          } else if (/against$/i.test(key)) {
            returnKey = 'complainantAgainst';
          } else if (/opened$/i.test(key)) {
            returnKey = 'caseOpenedDate';
            value = formatDate(value)
          } else if (/closed$/i.test(key)) {
            returnKey = 'caseClosedDate';
            value = formatDate(value)
          } else if (/issue$/i.test(key)) {
            returnKey = 'issue';
          } else if (/Relevant/i.test(key)) {
            returnKey = 'relevantInstrument';
          }
          return {[returnKey]: value}
        }
    }
  	return results
}

const formatDate = (date) => {
  let d = date && moment(date.replace(/\sdel?/g, ''), ['DD MMMM YYYY', 'DD/MM/YYYY', 'DD-MM-YYYY']);
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