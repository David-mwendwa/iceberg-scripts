function parsePage({responseBody, URL, requestURL, html}) {
    html = iconv.decode(responseBody.buffer, 'win-1251');
    const $ = cheerio.load(responseBody.content);
    const results = [];
   	
  	$('div[class="cbq-layout-main"] > ul > li ').each(function(){
        let docURL = $(this).find('> div > a').attr('href');
        let title = $(this).find('> div > a').text();
        let summary = $(this).find('div.description').text();
        let year = /proyectos-decreto-(\d+)/.exec(URL);
        year = year && year[1]
      	let comment_end_date_original = /\bel\b.*?(\d{1,2}\s+de\s+(?:Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre)(?:\s+del?)?\s+\d{4})/i.exec(summary)
       	comment_end_date_original = comment_end_date_original && comment_end_date_original[1].trim()
        let d = comment_end_date_original && comment_end_date_original.replace(/\sdel?/g, '')
        d = d && moment(d, 'DD MMMM YYYY', 'es');
        let comment_end_date = d && d.isValid() ? d.format('YYYY-MM-DD') : null;
  		let match = /\b(disponible del?|desde|a partir) \D{0,6}(\d{1,2})[ del]* ((Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre))?[ del]*((\d{4}))?\b/i.exec(summary && summary.replace(/​/g, "")||"");
      	let firstDate = match && match[2];
      	let firstMonth = match && match[4];
      	let firstYear = match && match[6];
      	
      
      	let firstParticipationDate = null, firstParticipationDateSpanish = null, lastParticipationDate = null, lastParticipationDateSpanish = null;
      	match = /\b(fi​?naliza|al|hasta) \D{0,6}(\d{1,2})[ del]* ([a-z]+) [ del]*(\d{4})\b/i.exec(summary && summary.replace(/​/g, "")||"");
      	if(firstDate){
        	firstMonth = firstMonth || match[3];
        	firstYear = firstYear || match[4];
        	if(firstMonth && firstYear){
            	firstParticipationDateSpanish = `${firstDate} de ${firstMonth} de ${firstYear}`;
              	let d = moment(`${firstDate} ${firstMonth} ${firstYear}`, 'D MMMM YYYY', 'es');
              	firstParticipationDate = d.isValid()?d.format('YYYY-MM-DD'):null;
            }
        }
      	if(match){
        	lastParticipationDateSpanish = `${match[2]} de ${match[3]} de ${match[4]}`;
          	let d = moment(`${match[2]} ${match[3]} ${match[4]}`, 'D MMMM YYYY', 'es');
          	lastParticipationDate = d.isValid()?d.format('YYYY-MM-DD'):null;
        }
      	
      	results.push({URI: [docURL], title, summary, year, firstParticipationDate, firstParticipationDateSpanish, lastParticipationDate, lastParticipationDateSpanish})
    })
  
    return results
}
