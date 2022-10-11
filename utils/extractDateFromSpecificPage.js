// takes html and page(from where the date should be extracted) as params - returns date in spanish
const extractDate = async function({html, page}) {
	const $ = cheerio.load(html);
  // change the incorrect page numbering
  $('#pdf-container > div[data-page-no]').each(function (index) {
      const correctPageNumber = index + 1;
      $(this).attr('data-page-no', correctPageNumber);
  });
  let lines = []
  let hasNoDiv = $(`div[data-page-no="${page}"], div[data-page-no="${page}"]`).find('div:not(:has(div)), p:not(:has(p))');
  hasNoDiv.each(function (i) {
    let line = $(this).text().replace(/\s+/, ' ').trim()
    if (line) lines.push(line)
  });
  let textString = lines.join(' ').trim()  
  let match =
    /Metropolitano.+?(\(?\b\d{1,2}\b.+?\d{4})/i.exec(textString) ||
    /Quito.+?(\b\d{1,2}\b.+?\d{4})/i.exec(textString) ||
    /cúmplase.+?(\b\d{1,2}\b.+?\d{4})/i.exec(textString) ||
    /(\b\d{1,2}\b.+?\d{4})/i.exec(textString);
  let spanishDate = match && match[1] || null
  return spanishDate
}