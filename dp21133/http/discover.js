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
      	let limit = parseInt(json.limit)
        let isHome = /\?year=(\d+)$/i.test(canonicalURL)
        let isPagination = /\?ctrlAction=C&year=(\d+)&numero=(\d+)&pagina=(\d+)$/i.exec(canonicalURL)
        if (isHome) {
            json.pageOnes.forEach(link => {
            	links.push(link)
            })
        }
      	if (isPagination) {
          	let year = parseInt(isPagination[1])
          	let numero = parseInt(isPagination[2])
            let page = parseInt(isPagination[3])
        	let docs = json.boletines[year][numero].documentos
            docs.forEach(item => {
            	let pdfURL = item.linkDescarga
                links.push(pdfURL)
            })
          	if(docs.length === limit) {
                let page = /pagina=(\d+)$/.exec(canonicalURL)
                page = page && parseInt(page[1])
              	let nextPage = canonicalURL.replace(/pagina=(\d+)$/, `pagina=${page + 1}`)
                console.log(`--------------------------------\ncurrentPage: ${canonicalURL}`)
                console.log(`--------------------------------\nnextPage: ${nextPage}`)
                links.push(nextPage)
            }                        
        }        
    }
    return links;
}