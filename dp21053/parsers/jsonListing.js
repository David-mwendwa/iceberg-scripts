async function parsePage({URL, responseBody, referer}) {
  	const results = []
  
    let $ = cheerio.load(responseBody.content)
    const normativeTitle = $('p:contains("Normative projects"), p:contains("Proyectos normativos")');
    const historyTitle = $('p:contains("History of participation"), p:contains("Histórico de participación")');

    normativeTitle.nextUntil(historyTitle).each(function(){
        let pdfURL = $(this).find('a[href*="pdf"], a[href*="docx"], a[href$="doc"], a[href$="zip"]').first().attr('href')
        const text = $(this).text().trim().replace(/\n/g, ' ')
        let dateOriginal = /\d{1,2}[.\/]\d{1,2}[.\/]\d{4}/.exec(text);
        dateOriginal = dateOriginal && dateOriginal[0]
      	let d = dateOriginal && moment(dateOriginal, ['DD.MM.YYYY', 'MM.DD.YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY']);
    	let date = d && d.isValid() ? d.format('YYYY-MM-DD') : null;
        let title = $(this).find('em').text()
        if (!title) {
          title = /["“]?(Por.+?)(?:["”]|por|\.Las)/g.exec(text);
          title = title && title[1]
        }
        let documentType = 'Decreto Provisional'
        let no = 'N°'
        let docNumber = /Decreto.+?(\d{6,})/.exec(text);
        docNumber = docNumber && docNumber[1]
        let year = moment(date, 'YYYY-MM-DD').year();
      	let summary = /.\s?(Las\s.+?)(?:$)/i.exec(text)
        summary = summary && summary[1];
		
		pdfURL && date && results.push({URI:[pdfURL], dateOriginal, date, title, documentType, [no]:docNumber, year, summary, comments_start_date: null, comments_end_date: date})
    })
  
  	let historyContent = historyTitle.next().html()
    let historyArr = historyContent && historyContent.split(")") || [];
    historyArr.forEach(function(item) {
        $ = cheerio.load(item)
    	let pdfURL = $('a[href *="pdf"]').last().attr('href')
        pdfURL = pdfURL ? url.resolve(URL, pdfURL) : null;
        let text = $.text()
        let dateOriginal = /\d{1,2}[.\/]\d{1,2}[.\/]\d{4}/.exec(text);
        dateOriginal = dateOriginal && dateOriginal[0]
      	let d = dateOriginal && moment(dateOriginal, ['DD.MM.YYYY', 'MM.DD.YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY']);
    	let date = d && d.isValid() ? d.format('YYYY-MM-DD') : null;
        let title = /["“]?((?:Por|Mediante).+?)(?:["”]|por|\.|\(|$)/g.exec(text);
        title = title && title[1]
        let documentType = 'Decreto Provisional'
        let no = 'N°'
        let docNumber = /(?:Decreto|provisional).+?(\d{4,})/i.exec(text);
        docNumber = docNumber && docNumber[1]
        let year = moment(date, 'YYYY-MM-DD').year();
      	let summary = /.\s?(Las\s.+?)(?:$)/i.exec(text)
        summary = summary && summary[1];
      	
      	// Comment start and end date
      	let comments_start_date = /(\d{1,2}\.\d{1,2}\.\d{4})\s+\bal?\b/.exec(text)
        comments_start_date = comments_start_date && comments_start_date[1]
      	d = comments_start_date && moment(comments_start_date, ['DD.MM.YYYY', 'MM.DD.YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY']);
    	comments_start_date = d && d.isValid() ? d.format('YYYY-MM-DD') : null;
      
      	let comments_end_date = /\bal?\b\s+(\d{1,2}\.\d{1,2}\.\d{4})/.exec(text)
        comments_end_date = comments_end_date && comments_end_date[1]
      	d = comments_end_date && moment(comments_end_date, ['DD.MM.YYYY', 'MM.DD.YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY']);
    	comments_end_date = d && d.isValid() ? d.format('YYYY-MM-DD') : null;
          
      	date && docNumber && pdfURL && results.push({
          URI:[pdfURL], 
          dateOriginal, 
          date, 
          title, 
          documentType, 
          [no]:docNumber, 
          year, 
          summary,
          comments_start_date,
          comments_end_date
        })

    })

  
  	return results
}