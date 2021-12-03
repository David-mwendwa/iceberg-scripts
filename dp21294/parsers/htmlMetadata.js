async function parsePage({responseBody, URL, requestURL, html, referer}) {
    html = iconv.decode(responseBody.buffer, 'win-1251');
    let $ = cheerio.load(responseBody.content);
    const results = [];
  	const {firstFetched, lastFetched} = await getUrlTimes({URL}) || {};
    if (/proyectos-decreto-(\d+)/.test(referer)) {
        let mainTitle = $('.article > .titlePage').text().trim();
        let summary = $('.article > .pageLead').text().trim();
        if (!summary) {
            summary = $('.article ul').first().prev().text().trim()
        }
        let year = /proyectos-decreto-(\d+)/.exec(referer);
        year = year && year[1]
      	let ldate = /(?:hasta|fecha límite) .+?(\d{1,2} del? \w+ del? \d{4})/i.exec(summary.replace(/\s+/, ' '))
        let d = ldate && ldate[1].replace(/\sdel?/g, '') || null
        d = d && moment(d, 'DD MMMM YYYY', 'es')
        let commentEndDate = d && d.isValid() ? d.format("YYYY-MM-DD") : null;
      	let commentStartDate = null
        let mother = {isMother: true, URI: URL, title: mainTitle, summary, year,commentStartDate, commentEndDate, firstFetched, lastFetched};

        let events = []
        $('a[href *="pdf"], a[href $="doc"], a[href *="docx"], a[href *="zip"]').each(function() {
            let event = $(this).parent().html()
            events.push(event)
        })
        let total = events.length
        for (let i = 0; i < events.length; i++) {
            let inversed = events[total - (i+1)]
            $ = cheerio.load(inversed)
            let href = $('a').attr('href')
            href = href ? url.resolve(URL, href) : null;
            let title = $.text().replace(/\.(docx?|pdf|zip)/gi, '').trim()
            let Class;
          	let sortValue = i + 1
            let inverseSortValue = total - i
            if (inverseSortValue === 1) {Class = 'initial bill'} else {Class = null}
			let child = {URI: href, parentURL: URL, title, Class, sortValue, inverseSortValue};
  	
            href && events.length < 6 && results.push(child)
        }
      	//Object.assign(mother, times);
      	events.length && results.length && results.push(mother);
    }
    return results
}

const getUrlTimes = async function ({URL}) {
    //https://vlex.icbg.io/graphql-api?query=%7B%0A%20%20node(id%3A%20%22H2a602e2638082d0d6a050622618ab4f6206e4f03139e395c81f506cf5be31110.N%22)%20%7B%0A%20%20%20%20__typename%0A%20%20%20%20...%20on%20CrawledURL%20%7B%0A%20%20%20%20%20%20URL%0A%20%20%20%20%20%20firstSeen%0A%20%20%20%20%20%20lastSuccessfulRequest%20%7B%0A%20%20%20%20%20%20%20%20fetchedAt%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D
    let urlVersions = [URL, decodeURI(URL), encodeURI(URL), encodeURI(decodeURI(URL))].filter((c, i, a) => a.indexOf(c) === i);
    let ids = [];
    urlVersions.forEach(urlToParse => {
        const urlToParseId = "H" + new Buffer(URL).toString("base64");
        const urlToParseId2 = "H" + sha256(URL) + ".N";
        ids.push(urlToParseId, urlToParseId2);
    })
    const resp = await graphql(`
          query {
            nodes(ids: [${ids.filter((c, i, a) => a.indexOf(c) === i).map(x => `"${x}"`).join(", ")}]) {
                __typename
                ... on CrawledURL {
                  URL
                  firstSeen
                  lastSuccessfulRequest {
                    fetchedAt
                    
                  }
                }
            }
          }`);
    //throw(JSON.stringify(resp, null, 4))
    let node = resp.nodes && resp.nodes.filter(n => n)[0];
    return node && {
        firstFetched: node.firstSeen &&  node.firstSeen.replace(/t.*/i, ""),
        lastFetched: node.lastSuccessfulRequest && node.lastSuccessfulRequest.fetchedAt && node.lastSuccessfulRequest.fetchedAt.replace(/t.*/i, "")
    } || {};
};
async function parsePage({ responseBody, URL, requestURL, html, referer }) {
  html = iconv.decode(responseBody.buffer, 'win-1251');
  let $ = cheerio.load(responseBody.content);
  const results = [];
  const { firstFetched, lastFetched } = (await getUrlTimes({ URL })) || {};
  if (/proyectos-decreto-(\d+)/.test(referer)) {
    let mainTitle = $('.article > .titlePage').text().trim();
    let summary = $('.article > .pageLead').text().trim();
    if (!summary) {
      summary = $('.article ul').first().prev().text().trim();
    }
    let year = /proyectos-decreto-(\d+)/.exec(referer);
    year = year && year[1];
    let ldate = /(?:hasta|fecha límite) .+?(\d{1,2} del? \w+ del? \d{4})/i.exec(
      summary.replace(/\s+/, ' ')
    );
    let d = (ldate && ldate[1].replace(/\sdel?/g, '')) || null;
    d = d && moment(d, 'DD MMMM YYYY', 'es');
    let commentEndDate = d && d.isValid() ? d.format('YYYY-MM-DD') : null;
    let commentStartDate = null;
    let mother = {
      isMother: true,
      URI: URL,
      title: mainTitle,
      summary,
      year,
      commentStartDate,
      commentEndDate,
      firstFetched,
      lastFetched,
    };

    let events = [];
    $(
      'a[href *="pdf"], a[href $="doc"], a[href *="docx"], a[href *="zip"]'
    ).each(function () {
      let event = $(this).parent().html();
      events.push(event);
    });
    let total = events.length;
    for (let i = 0; i < events.length; i++) {
      let inversed = events[total - (i + 1)];
      $ = cheerio.load(inversed);
      let href = $('a').attr('href');
      href = href ? url.resolve(URL, href) : null;
      let title = $.text()
        .replace(/\.(docx?|pdf|zip)/gi, '')
        .trim();
      let Class;
      let sortValue = i + 1;
      let inverseSortValue = total - i;
      if (inverseSortValue === 1) {
        Class = 'initial bill';
      } else {
        Class = null;
      }
      let child = {
        URI: href,
        parentURL: URL,
        title,
        Class,
        sortValue,
        inverseSortValue,
      };

      href && events.length < 6 && results.push(child);
    }
    //Object.assign(mother, times);
    events.length && results.length && results.push(mother);
  }
  return results;
}

const getUrlTimes = async function ({ URL }) {
  //https://vlex.icbg.io/graphql-api?query=%7B%0A%20%20node(id%3A%20%22H2a602e2638082d0d6a050622618ab4f6206e4f03139e395c81f506cf5be31110.N%22)%20%7B%0A%20%20%20%20__typename%0A%20%20%20%20...%20on%20CrawledURL%20%7B%0A%20%20%20%20%20%20URL%0A%20%20%20%20%20%20firstSeen%0A%20%20%20%20%20%20lastSuccessfulRequest%20%7B%0A%20%20%20%20%20%20%20%20fetchedAt%0A%20%20%20%20%20%20%20%20%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D
  let urlVersions = [
    URL,
    decodeURI(URL),
    encodeURI(URL),
    encodeURI(decodeURI(URL)),
  ].filter((c, i, a) => a.indexOf(c) === i);
  let ids = [];
  urlVersions.forEach((urlToParse) => {
    const urlToParseId = 'H' + new Buffer(URL).toString('base64');
    const urlToParseId2 = 'H' + sha256(URL) + '.N';
    ids.push(urlToParseId, urlToParseId2);
  });
  const resp = await graphql(`
          query {
            nodes(ids: [${ids
              .filter((c, i, a) => a.indexOf(c) === i)
              .map((x) => `"${x}"`)
              .join(', ')}]) {
                __typename
                ... on CrawledURL {
                  URL
                  firstSeen
                  lastSuccessfulRequest {
                    fetchedAt
                    
                  }
                }
            }
          }`);
  //throw(JSON.stringify(resp, null, 4))
  let node = resp.nodes && resp.nodes.filter((n) => n)[0];
  return (
    (node && {
      firstFetched: node.firstSeen && node.firstSeen.replace(/t.*/i, ''),
      lastFetched:
        node.lastSuccessfulRequest &&
        node.lastSuccessfulRequest.fetchedAt &&
        node.lastSuccessfulRequest.fetchedAt.replace(/t.*/i, ''),
    }) ||
    {}
  );
};
