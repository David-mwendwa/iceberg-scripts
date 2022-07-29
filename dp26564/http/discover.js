function discoverLinks({content, contentType, canonicalURL, requestURL}) {
    let links = [];
  	if (/html/i.test(contentType)) {
        const $ = cheerio.load(content);
      	const isHome = canonicalURL.match(/Norm_Conceptos\.aspx$/i)
  		const isListing = canonicalURL.match(/Norm_Conceptos\.aspx\?year=(.+?)&tematica=(.+?)&page=(.+)/i)
        if(isHome) {
          $('#scriptWPQ4 tbody tr td:has(a:contains("Año"))').each(function () {
            let yearstring = $(this).text();
            let match = /\b([12][0-9]{3})\b/.exec(yearstring);
            let year = match && match[1]
            $(`tbody[groupstring*="${year}"] tr td:has(a:contains("Temática"))`).each(function () {
              let tstring = $(this).text();
              let match = /:\s+(.+)\((\d+)\)/.exec(tstring);
              let tematica = match && match[1].trim()
              let numOfDocuments = match && parseInt(match[2].trim());
              let totalPages = Math.ceil(numOfDocuments / 30);
              for (let i = 1; i <= totalPages; i++) {
                let listing = `https://www.minsalud.gov.co/Paginas/Norm_Conceptos.aspx?year=${year}&tematica=${tematica}&page=${i}`;
                console.log(`listing: ${listing}`);
                links.push(listing);
              }
            });
          });
        }
        
      	if (isListing) {
          $("a[href*='.pdf'], a[href*='.doc'], a[href*='.PDF'], a[href*='.DOC']").each(function () {
            let href = $(this).attr('href');
            href = href ? url.resolve(requestURL, href) : null;
            if (href)
              links.push(href)
          })
        }
    }
    return links;
}