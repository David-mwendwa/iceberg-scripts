function parsePage({responseBody, URL, requestURL, html}) {
    let $ = cheerio.load(responseBody.content);
    const results = [];
    let title = $('.content .titulo-nodox').text();
    let summary = $('.field-name-field-instrumentos-descripcion div:contains(".gov.co")').first().text().trim();
    //let summary = $('.field-name-field-instrumentos-descripcion div:contains("")').prev().text();
    let participationDateOriginal = /hasta.+?(\d{1,2}\s+de\s+(?:Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre)(?:\s+de\s+\d{4})?)/i.exec(summary)
    participationDateOriginal = participationDateOriginal && participationDateOriginal[1]
    let d = participationDateOriginal.replace(/del?/gi, '').trim()
    d = moment(d, ['DD MMMM YYYY'], ['en','es']);
    let participationDate = d.isValid() ? d.format('YYYY-MM-DD') : null;
    let year = moment(participationDate, 'YYYY-MM-DD').year();
    let documentType = 'Proyecto de resolución';
    let mother = {
        isMother: true,
        URI: URL,
        title,
        summary,
        participationDateOriginal,
        participationDate,
        year,
        documentType,
    };
    //results.push(mother);
  
  	let events = []
    $('.field-name-field-instrumentos-adjunto .field-items').find('a[href*="pdf"], a[href*="doc"], a[href*="docx"]').each(function() {
        let event = $(this).parent().html()
        events.push(event)
    })
    let total = events.length
    for (let i = 0; i < events.length; i++) {
        let inversed = events[total - (i+1)]
        $ = cheerio.load(inversed)
        let href = $('a').attr('href')
        href = href ? url.resolve(URL, href) : null;
        let title = $.text().replace(/\.(docx?|pdf)/gi, '').trim()
        let Class;
        let sortValue = i + 1
        let inverseSortValue = total - i
        if (inverseSortValue === 1) {Class = 'initial bill'} else {Class = null} 

        results.push({URI: href, parentURL: URL, title, sortValue, inverseSortValue, Class})
    }
  	events.length && results.push(mother);
    return results
}
