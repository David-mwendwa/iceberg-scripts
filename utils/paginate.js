const changePagination = async function ({responsePage}) {
	let html = await responsePage.response.text();
    let $ = cheerio.load(html)
  	$(".item-list > ul.pager > li > a").each(function (i) {
        let a = $(this)
        let pagination = a.attr('href')
        let year = /year.*?=(\d{4})/.exec(pagination)
        year = year && year[1]
      	let page = /page=(\d+)/.exec(pagination)
        page = page && +page[1] + 1 || /\d+/.test(a.text()) && a.text()
        let newPagination = `https:*****************year=${year}&page=${page}`
        //let newPagination = pagination.replace(/page=(\d+)/, `page=${page}`)
        a.attr('href', newPagination)
    })
    responsePage.response = new fetch.Response($.html(), responsePage.response);
    return responsePage;
}

// invoke the function with responseBody
await changePagination({ responsePage });

