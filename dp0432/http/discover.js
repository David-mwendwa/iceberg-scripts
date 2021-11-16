function discoverLinks({content, contentType, canonicalURL, requestURL}) {
    let links = [];
    if (/html/i.test(contentType)) {
        const $ = cheerio.load(content);
        $("a[href]").each(function () {
            let href = $(this).attr('href');
            href = href ? url.resolve(requestURL, href) : null;
            if (href) {
                links.push(href)
            }
        })

    } else if (/json/i.test(contentType)) {
        let json = JSON.parse(content);
      	const isSearch = /\?year=(\d+)$/.exec(canonicalURL)
        if (isSearch) {
          	let listing = json.listing
            if (listing.length) {
              	for(let i=0; i<=listing.length; i++) {
            		links.push(listing[i])
            	}
            }
          	
        }
      	if (/\?year=(\d+)&proceedings=(.+)/i.test(canonicalURL)) { 
          	let results = json.results
            results.length && results.forEach(obj => {
            	let year = obj.year;
                let caseRecordId = obj.caseRecordId;
                let proceedingType = obj.proceedingType;
                let docURL = `https://www.csol.ie/ccms/api/high-court-search/case-details?year=${year}&caseRecordId=${caseRecordId}&proceedingType=${proceedingType}`
                links.push(docURL)
            })
        }        
    }
    return links;
}