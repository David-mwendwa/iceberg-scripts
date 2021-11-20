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
      	const isPage = /\?gestion=(\d+)&page=(\d+)/.exec(canonicalURL)        
        if (isPage) {
          	let year = parseInt(isPage[1])
        	let page = parseInt(isPage[1])
          	let current_page = +json.data.current_page
            let last_page = +json.data.last_page           
            if (page === 1) {
            	for(let i = current_page; i <= last_page; i++) {
                    let link = `https://jurisprudencia.tsj.bo/resoluciones_avanzado?gestion=${year}&page=${i}`
                    links.push(link)
                    console.log(`------------------------------\n${link}`)
                }
            }
            json.data && 
            json.data.data && 
            json.data.data.length && 
            json.data.data.forEach(obj => {
                let id = obj.id
                let pdfURL = `https://jurisprudencia.tsj.bo/resoluciones/${id}/pdf`
                links.push(pdfURL)
                console.log(`------------------------------\n${pdfURL}`)
            })
        }   	
    }
    return links;
}