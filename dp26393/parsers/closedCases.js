function parsePage({URL, responseBody, referer}) {
  	if (/(\?a=\d+|pageNum=\d+|initial-submissions|provisional-conclusions)/.test(URL)) return []
  	let $ = cheerio.load(responseBody.content)
  	const results = [] 
    const isWebArchive = /webarchive\.nationalarchives\.gov\.uk/i.test(URL)
    const isMotherChildStruc = $('.columns .accordion-wrapper').length
    const hasOneMother = $('.columns hr + p').length
    if (isWebArchive) {
    	const title = $('.content-intro-panel h1').text()
      let headerSection = $('section .body > p:first-child').html().split('<br>').map(item => item.trim().replace(/(<|>|\t|\/|strong)/ig, ''))
      const motherURI = `${URL}?isMother=true`
      let mother = headerSection.reduce((acc, curr) => {
        let key = curr.split(':')[0] && curr.split(':')[0].trim()
        let value = curr.split(':')[1] && curr.split(':')[1].trim();
        acc.push({ [key]: value })
        return acc
      }, []).reduce((acc, obj) => {
        let returnObj = createMetadata(Object.keys(obj).toString(), Object.values(obj).toString())
        return Object.assign(acc, returnObj)
      }, {})
      results.push(Object.assign({URI:[motherURI], URL, isMother: true, title},mother))

      // Expression
      const worlExpressionURI = `${URL}?isWorkExpression=true`
      let event = {URI: [worlExpressionURI], parentURI: motherURI, URL, title}
      let content = $('#main .columns:has(h1), .clean-border>section')
      $('[role="navigation"], button, .header-container, hr').remove()
      $("a").each(function() { $(this).replaceWith($(this).text()) })
      let htmlContent = {content: content.html(), fileFormat:"text/html", locale:"en", dataType: "MEDIA"}
      event.htmlContent = htmlContent
      results.push(event)
    }
    else if (isMotherChildStruc) {
      const motherURI = `${URL}?isMother=true`
      const mother = { URI: [motherURI], URL, isMother: true };
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

      $('.columns .accordion-wrapper, #main .body>ul>li').each(function () {
        let doc = {URI:[], parentURI: motherURI, URL}
        let row = $(this);
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
        let panel = row.find('.accordion-panel, .clean-border, h3');
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
    } else if (hasOneMother) { // handle documents with only one mother
      const title = $('.page-title, .content-intro-panel h1').text()
      let headerSection = $('.columns hr + p').html().split('<br>').map(item => item.trim().replace(/(<|>|\t|\/|strong)/ig, ''))
      const motherURI = `${URL}?isMother=true`
      let mother = headerSection.reduce((acc, curr) => {
        let key = curr.split(':')[0] && curr.split(':')[0].trim()
        let value = curr.split(':')[1] && curr.split(':')[1].trim();
        acc.push({ [key]: value })
        return acc
      }, []).reduce((acc, obj) => {
        let returnObj = createMetadata(Object.keys(obj), Object.values(obj).toString())
        return Object.assign(acc, returnObj)
      }, {})
      results.push(Object.assign({URI:[motherURI], URL, isMother: true, title},mother))

      // Expression
      const worlExpressionURI = `${URL}?isWorkExpression=true`
      let event = {URI: [worlExpressionURI], parentURI: motherURI, URL, title}
      let content = $('#main .columns:has(h1), .clean-border>section')
      $('[role="navigation"], button, .header-container, hr').remove()
      $("a").each(function() { $(this).replaceWith($(this).text()) })
      let htmlContent = {content: content.html(), fileFormat:"text/html", locale:"en", dataType: "MEDIA"}
      event.htmlContent = htmlContent
      results.push(event)
    }
  	return results
}

function createMetadata(key, value){
  value = value.replace(/&#x201C;/g, '“').replace(/&#x201D;/g, '”').replace(/&#x2018;/g, '‘').replace(/&#x2019;/g, '’')
  let obj = {}
  if (/between/i.exec(key)) {
    let match = /(^.+?)\s+and\s+(.+)/.exec(value)
    obj.complainant = match && match[1]
    obj.complainantAgainst = match && match[2]
  } else if (/Complainant$/i.test(key)) {
    obj.complainant = value;
  } else if (/against$/i.test(key)) {
    obj.complainantAgainst = value;
  } else if (/opened$/i.test(key)) {
    value = formatDate(value)
    obj.caseOpenedDate = value;
  } else if (/closed$/i.test(key)) {
    value = formatDate(value)
    obj.caseClosedDate = value;
  } else if (/issue$/i.test(key)) {
    obj.issue = value;
  } else if (/Relevant/i.test(key)) {
    obj.relevantInstrument = value;
  } else return
  return obj
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