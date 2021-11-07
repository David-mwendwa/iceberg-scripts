function discoverLinks({content, contentType, canonicalURL, requestURL}) {
    let links = [];
  	if (/html/i.test(contentType)) {
        const $ = cheerio.load(content);
        $("a[href]").each(function () {
            let href = $(this).attr('href');
            href = href ? url.resolve(requestURL, href) : null;
            if (href)
                links.push(href)
        })
    } 
  	
  
    return links;
}