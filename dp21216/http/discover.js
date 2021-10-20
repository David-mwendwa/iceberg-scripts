function discoverLinks({content, contentType, canonicalURL, requestURL}) {
    let links = [];
  	if (/html/i.test(contentType)) {
        const $ = cheerio.load(content);
      	if (/resoluciones-internas\/$/i.test(canonicalURL)) {
            $('table > tbody > tr > td:nth-child(3) > a').each(function () {
              	let href = $(this).attr('href')
              	href = href ? url.resolve(requestURL, href) : null;
                if (href)
                    links.push(href)
            });
          
          	$('a[href*="pdf"]').each(function(){
                let pdfhref = $(this).attr('href') 
                links.push(pdfhref)  
                console.log(`pdfffffffffffff\n---------------${pdfhref}`)
            })
          
        } 
      	$('a[href*="pdf"]').each(function(){
            let pdfhref = $(this).attr('href') 
            links.push(pdfhref)  
        })

    }
    
    return links;
}