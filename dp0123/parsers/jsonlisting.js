function parsePage({responseBody, URL}) {
    const $ = cheerio.load(responseBody.content);
    const results = [];
  	
  	$('table[id="ConsultTable"] tbody tr').each(function(){
        let infoURL = $(this).find('td:last-child a[id="documentInfo"]').attr('href') 
        let pdfURL = $(this).find('td:last-child a[id="downloadFile"]').attr('href') 
        pdfURL = pdfURL ? url.resolve(URL, pdfURL) : null;
        let type =  URL.split('documentType=')[1]        
    	  results.push({URI: [infoURL, pdfURL], ['document type']: type})
    })
  	    
    return results;
}