function discoverLinks({content, contentType, canonicalURL, requestURL}) {
    let links = [];
  	if (/html/i.test(contentType)) {
        let $ = cheerio.load(content);
      	let isPageOne = canonicalURL.match(/\?year=(\d+)&page=1$/i)
      	let isPage = canonicalURL.match(/\?year=(\d+)&page=(\d+)$/i)
        if (isPageOne) {
        	let paginator = $('td.prbg:contains("de")').text().replace(/\s+/g, ' ')
            let match = /de\D+(\d+)/.exec(paginator)
            let total_pages = match && parseInt(match[1]) || 1
            if (total_pages > 1) {
              for (let i = 2; i <= total_pages; i++) {
                let pagination = canonicalURL.replace(/&page=[0-9]{1,3}/, `&page=${i}`);
                console.log(`Pagination: ${pagination}`)
                links.push(pagination);
              }
            }
        }
        if (isPage) {
            $("a[href]").each(function () {
                let href = $(this).attr('href');
                href = href ? url.resolve(requestURL, href) : null;
                if (href)
                  links.push(href)
            })
        }

    } 
    return links;
}