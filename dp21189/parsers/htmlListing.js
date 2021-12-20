async function parsePage({ URL, responseBody, referer }) {
  const results = [];

  const $ = cheerio.load(responseBody.content);
  $('table:not(:has(table)) > tbody > tr').each(function () {
    let href = $(this).find('a').first().attr('href');
    href = href ? url.resolve(URL, href) : null;
    let listItem = $(this).text().trim().replace(/\s+/g, ' ');
    let Vigencia = /Vigencia:\s(.+?)Fecha/i.exec(listItem);
    Vigencia = Vigencia && Vigencia[1];

    href && results.push({ URI: [href], Vigencia });
  });

  return results;
}
