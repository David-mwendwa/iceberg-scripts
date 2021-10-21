function parsePage({responseBody, URL, html, referer}) {
    const $ = cheerio.load(responseBody.content);
    const results = [];
  	if (/resoluciones-internas\/$/i.test(URL)) {
    	$('table > tbody > tr').each(function () {
          	let adminAct = $(this).find('> td:nth-child(1)');
      		let resolutionNumber = /\d+(?=\sdel?)/i.exec(adminAct);
            resolutionNumber = resolutionNumber && resolutionNumber[0];
            if (!resolutionNumber) {
              resolutionNumber = /Resolución(?:\s)?(?:No\.\s+)?(\d+)/i.exec(adminAct);
              resolutionNumber = resolutionNumber && resolutionNumber[1];
            }
            let dateOriginal = /\d{1,2}(?:\sdel?)?\s\w+(?:\sdel?)?\s\d{4}/.exec(adminAct.text());
            dateOriginal = dateOriginal && dateOriginal[0];
            let d = dateOriginal && dateOriginal.replace(/\sdel?/gi, '');
            d = moment(d, 'DD MMMM YYYY', 'es');
            let date = d && d.isValid() ? d.format('YYYY-MM-DD') : null;
            let título = $(this).find('> td:nth-child(2)').text().toLowerCase()
            let href = $(this).find('> td:nth-child(3) > a').attr('href');

            href && results.push({URI: [href], resolutionNumber, dateOriginal, date, título})
        });
    }
  	   
    return results;
}