function parsePage({URL, responseBody, referer}) {
  	let $ = cheerio.load(responseBody.content)
    
    let results = []
    $("a[href*='mailto']").each(function (i) {
        let a = $(this);
        let match = /mailto:(.+)/i.exec(a.attr('href'));
        if (match) { a.replaceWith(match[1]) }
    })
    $('table.ms-rteTable-5 > tbody > tr').each(function () {
      const td = $(this)
      $(this).find('th').remove();

      const events = handleEvents(td)
      events && results.push(...events)
    });	   
  	//throw(JSON.stringify({results}, null, 4))
  	return results
}

const handleEvents = function (td) {
  let results = []
  let tdHtml = td.html().replace(/[\s\n]+/gi, ' ').replace(/(&nbsp;|<span.*?>|<br>|<\/span>|<img.*?>|<div>|<\/div>)/g, '').replace(/<\/a><a/g, '</a>. <a').replace(/<a/g, '<br><a')
  let $ = cheerio.load("<div class='doc'></div>");
  tdHtml.split(/<br(?: \/)?>/).forEach((e) => $('.doc').append(`<div class='event'>${e}</div><br>`));
  if(!$('a[href]:contains("Proyecto "), a[href]:contains("proyecto ")').length) {
    return
  }
  let circulartitle = $('a[href]:contains("Circular"), a[href]:contains("circular")').first().text() || null
  let yearMatch = /\b(\d{4})\b/i.exec(circulartitle);
  let year = yearMatch && parseInt(yearMatch[1])
  let pt = $('a[href]:contains("Proyecto "), a[href]:contains("proyecto ")')
  let ptitle = pt.first().text() || null
  let parentURI = `https://www1.upme.gov.co/?title=${ptitle && ptitle.toLowerCase().replace(/\s+/g, '_')}`;
  if (pt.length > 1) {
  	results = handleTdWithMoreThanOneMother({$, parentURI, year})
  } else {
  	results = handleTdWithOneMother({$, parentURI, year})
  }
  return results.filter(record => record.year >= 2022)
}

const handleTdWithOneMother = function({$, parentURI, year}) {
    let results = []
    const events = []
    $ && $('.doc .event:has(a)').each(function (index) {
      let event = $(this)
      let title = event.find('a[href]').text();
      let href = event.find('a[href]').attr('href');
      let summary = event.contents().not('a').text().trim() //.replace(/([“"”:]|.$|^\.)/g, '').trim()
      !/.xlsx/.test(href) && events.push({href, title, summary, year: year || null, parentURI: parentURI || null, order: index })
    })
    events.map(event => {
      let mother = { URI: [], isMother: true };
      let child = { URI: [] }
      let { href, title, summary, year, parentURI, order } = event;
      summary = summary.replace(/([“"”:]|\.$|^\.)/g, '').trim()
      let totalEvents = events.length
      if (/Proyecto/i.test(title)) {//Circular
        mother.URI.push(parentURI)
        mother.title = title;
        mother.summary = summary.length ? summary : null
        mother.year = year
        results.push(mother);

        child.URI.push(href);
        child.parentURI = parentURI
        child.title = title;
        child.summary = summary.length ? summary : null;
        child.year = year
        child.class = "Initial bill"
        child.sort = order
        child.inverseSort = totalEvents - order
        results.push(child);

      } else {
        child.URI.push(href)
        child.parentURI = parentURI
        child.title = title;
        child.summary = summary.length ? summary : null
        child.year = year
        child.class = null
        child.sort = order
        child.inverseSort = totalEvents - order
        results.push(child);
      }
    })
    return results
}

const handleTdWithMoreThanOneMother = function({$, year}) {
  	let events = []
	$('.doc .event:has(a)').each(function (index) {
      let event = $(this)
      let title = event.find('a[href]').text();
      let href = event.find('a[href]').attr('href');
      let summary = event.contents().not('a').text().trim()// .replace(/([“"”:]|.$|^.)/g, '').trim()
      !/.xlsx/.test(href) && events.push({href, title, summary})
    })
  	let results = []
    let parentURI = null
    let cirlculars = []
    let commonEvent = {URI: []}
    let circularOrder = null
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      let { href, title, summary } = event   
      if (/Circular/i.test(title)) {
      	commonEvent.URI = href
        commonEvent.parentURI = null
        commonEvent.title = title
        commonEvent.docname = title
        commonEvent.summary = summary
        commonEvent.year = year
      }
      cirlculars.push(commonEvent)
      if (/^Proyecto/.test(title)) {
        circularOrder = 2
        let match = /[“"](.+)["”]/.exec(summary)
        let ptitle = match && match[1].trim()
        ptitle = ptitle || title
        parentURI = `https://www1.upme.gov.co/?title=${ptitle && ptitle.toLowerCase().replace(/\s+/g, '_')}`;
		summary = summary.replace(/([“"”:]|\.$|^\.)/g, '').trim()
        title = title.replace(/([“"”:]|\.$|^\.)/g, '').trim()
        results.push({ URI: parentURI, isMother: true, docname: title, title: summary || title, summary, year })
        results.push({ URI: href, parentURI, class: 'initial bill', docname: title, title, summary, year, sort: 1 })
        results.push({ URI: commonEvent.URI, parentURI, class: null, docname: commonEvent.docname, title: commonEvent.docname, summary: commonEvent.summary, year: commonEvent.year, sort: circularOrder })
        //results.push({...commonEvent, cirular: true, parentURI, order: circularOrder})
      } else {
        results.push({ URI: href, parentURI, class: null, docname: title, title, summary, year, sort: circularOrder + 1 });  
      }
    }

    results = results.filter(record => record.URI && (record.isMother || record.parentURI) && record)  
  	let mothers = results
        .filter((res) => res.isMother && Object.assign(res, { children: [] }))
        .reduce((acc, mother) => {
          let parentURI = mother.URI;
          let children = results.filter((r) => r.parentURI === parentURI);
          acc.push(Object.assign(mother, { children, numOfChildren: children.length }));
          return acc;
        }, []);

    let final = mothers.map(mother => {
        let { children, numOfChildren } = mother
        children = children.reduce((acc, child) => {
            acc.push(Object.assign(child, { inverseSort: (numOfChildren + 1) - child.sort }))
            return acc
        }, [])
        return Object.assign(mother, {children})
    })

    results = []
    final.forEach(mother => {
        let { children } = mother
        delete mother.numOfChildren;
        delete mother.children
        results.push(mother)
        children.forEach(child => {
          	results.push(child)
        })
    })
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