function discoverLinks({content, contentType, canonicalURL, requestURL}) {
    let links = [];
  	if (/html/i.test(contentType)) {
        let $ = cheerio.load(content);
      	let isPageOne = canonicalURL.match(/\?year=(\d+)&page=1$/i)
      	let isPage = canonicalURL.match(/\?year=(\d+)&page=(\d+)$/i)
        if (isPageOne) {
        	let paginator = $('span.ui-paginator-current').text();
            let total_count_match = /de\D+(\d+)/.exec(paginator);
            let total_count = total_count_match && +total_count_match[1];
            let total_pages = Math.ceil(total_count / 10);
          	console.log(`paginator:${paginator}\nmatch:${total_count_match}\ncount:${total_count}\npages:${total_pages}`)
            for (let i = 2; i <= total_pages; i++) {
              let pagination = canonicalURL.replace(/&page=[0-9]{1,3}/, `&page=${i}`);
              console.log(`Pagination: ${pagination}`)
              links.push(pagination);
            }
        }
        if (isPage) {
            $("table>tbody>tr").each(function () {
                let row = $(this)
                //let details_url = row.find('>td:has(>button)').find('a[href*="codDoc"]')
                let onClickPayload = row.find('>td:has(>button)').find('>button').attr('onclick');
                let match = /mostrarDetalleArbitrajeVentana\(([0-9]+),/.exec(onClickPayload)
                let id = match && match[1];
                let href = id && `https://prodapp1.osce.gob.pe/sda/rest/public/documentos/findDetalleByCodDocumento?codDoc=${id}`;
              	console.log(`tocontent_url: ${href}\n-----------`)
                if (href) {
                    links.push(href)
                }
            })
        }

    } else if (/json/i.test(contentType)) {
        let json = JSON.parse(content);
        let isContentModalURL = canonicalURL.match(/codDoc=[0-9]+$/i);
        if (isContentModalURL) {      
			json && json.data && json.data.length && json.data.forEach(obj => {
            	let href = obj.cDesUrl
                href = href ? url.resolve(canonicalURL, href) : null;
              	console.log(`pdf: ${href}\n-----------`)
              	if (href) { links.push(href) }
            })      		
        }      
    }
    return links;
}
