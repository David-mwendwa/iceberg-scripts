const cheerio = require('cheerio')

const changePagination = async function ({ responsePage }) {
	  let html = await responsePage.response.text();
    let $ = cheerio.load(html)
  	$(".item-list > ul.pager > li > a").each(function (i) {
        let a = $(this)
        let pagination = a.attr('href')
        let page = +pagination.split('page=').pop() + 1
        let newPagination = pagination.replace(/page=(\d+)/, `page=${page}`)
        a.attr('href', newPagination)
    })
    responsePage.response = new fetch.Response($.html(), responsePage.response);
    return responsePage;
}

// return changePagination() on the listing/home function
// return await changePagination({ responsePage });
