const cheerio = require('cheerio')

const changePagination = async function ({canonicalURL, responsePage}) {
	let html = await responsePage.response.text();
    const $ = cheerio.load(html)
    const paginator = `.pagination`;
  	$(`${paginator} a`).each(function (i) {
        let a = $(this)
        let label = a.attr('title')
        let text = a.text().trim()
        let match = /página\D+(\d+)/.exec(label)
        let page = match ? parseInt(match[1]) : /^\d+$/.test(text) ? text : null
        if (page) {
          let pagination = canonicalURL.replace(/page=(\d+)/, `page=${page}`)
          a.attr('href', pagination)
        }
    })
  	//$('base').remove()
    responsePage.response = new fetch.Response($.html(), responsePage.response);
}

// return changePagination() on the listing/home function
// return await changePagination({ responsePage, canonicalURL });

// const changePagination = async function ({ responsePage, canonicalURL }) {
// 	  let html = await responsePage.response.text();
//     let $ = cheerio.load(html)
//   	$(".item-list > ul.pager > li > a").each(function (i) {
//         let a = $(this)
//         let pagination = a.attr('href')
//         let page = +pagination.split('page=').pop() + 1
//         let newPagination = canonicalURL.replace(/page=(\d+)/, `page=${page}`);
//         a.attr('href', newPagination)
//     })
//     responsePage.response = new fetch.Response($.html(), responsePage.response);
//     return responsePage;
// }

