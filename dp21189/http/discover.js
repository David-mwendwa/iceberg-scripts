function discoverLinks({content, contentType, canonicalURL, requestURL}) {
    let links = [];
  	if (/html/i.test(contentType)) {
      	const $ = cheerio.load(content);
      	let match = /page=(\d+)$/i.exec(canonicalURL)
      	if (match) {
          	let page = parseInt(match[1]);
          	if (page === 1) {
              	$('a.pagination-link').each(function() {
                	let pagination = $(this).attr('href')
                    pagination = pagination ? url.resolve(requestURL, pagination) : null;
                    if (pagination) {
                      	links.push(pagination)
                    }
                  	console.log(`pagination--- ${pagination}`)
                })                
            }
          
          	$('table:not(:has(table)) > tbody > tr').each(function() {
                let href = $(this).find('a').first().attr('href')
                href = href ? url.resolve(requestURL, href) : null;
                if (href) {
                  links.push(href)
                }
            });
            
        } else {
        	$('a[href *="pdf"], a[href *="docx"], a[href *="doc"]').each(function () {
              let href = $(this).attr('href');
              href = href ? url.resolve(requestURL, href) : null;
              if (href) {
                    links.push(href)
              }
            })
        }

    }
    
    return links;
}