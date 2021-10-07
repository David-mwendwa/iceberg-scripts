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

    //push to return array, 'results'
    results.push({URI: href, parentURL: URL, title, sortValue, inverseSortValue, Class})
}