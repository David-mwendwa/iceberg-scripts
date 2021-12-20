async function parsePage({ URL, responseBody, referer }) {
  const results = [];

  let $ = cheerio.load(responseBody.content);
  let title = $(`h2:has(span[id *='outTitulo'])`).text();
  let detailText = $(`span[id *='outDetalle']`).text();
  detailText = detailText.replace(/\s+/g, ' ').replace(/(\.|,|:|;)/g, '');
  let Tipo_de_documento =
    /propuesto\s+(Proyecto\sde\s(?:decreto|resolución|otros|minuta))/i.exec(
      detailText
    );
  Tipo_de_documento = Tipo_de_documento && Tipo_de_documento[1];
  const sector = $(`td:has(span[id *='outSector'])`).text();

  const Fecha_de_inicio_spanish = $(`td:has(span[id *='outFecha'])`)
    .first()
    .text();
  let d =
    Fecha_de_inicio_spanish && Fecha_de_inicio_spanish.replace(/\sdel?/gi, '');
  d = moment(d, 'DD MMMM YYYY', 'es');
  let Fecha_de_inicio = d && d.isValid() ? d.format('YYYY-MM-DD') : null;

  const Fecha_Fin_spanish = $(`td:has(span[id *='outFechaFin'])`)
    .first()
    .text();
  d = Fecha_Fin_spanish && Fecha_Fin_spanish.replace(/\sdel?/gi, '');
  d = moment(d, 'DD MMMM YYYY', 'es');
  let Fecha_Fin = d && d.isValid() ? d.format('YYYY-MM-DD') : null;

  let summario = $(
    `span[id *='outDetalle'] > p:contains("Documento propuesto")`
  )
    .next()
    .next()
    .text()
    .trim();
  if (!summario) {
    summario = $(`span[id *='outDetalle'] > p:last-child`).text().trim();
  }
  if (summario.length < 30) {
    summario = $(`span[id *='outDetalle'] > p:contains("Documento propuesto")`)
      .next()
      .text()
      .trim();
  }
  let mother = {
    isMother: true,
    URI: [URL],
    title,
    sector,
    Fecha_de_inicio_spanish,
    Fecha_de_inicio,
    Fecha_Fin_spanish,
    Fecha_Fin,
    summario,
  };
  results.push(mother);

  const container = $('#centerHistorico');
  // Documento propuesto
  let propuestoEvents = [];
  let propuesto = container.find('p:contains("Documento propuesto")').next();
  let href = propuesto
    .find('a[href*="docx"], a[href*="pdf"], a[href*="doc"]')
    .attr('href');
  href = href ? url.resolve(URL, href) : null;
  title = propuesto
    .find('a[href*="docx"], a[href*="pdf"], a[href*="doc"]')
    .text();
  if (!href) {
    propuesto = $(
      'p:contains("Documento propuesto: "), span:contains("Documento propuesto")'
    );
    href = propuesto
      .find('a[href*="docx"], a[href*="pdf"], a[href*="doc"]')
      .attr('href');
    href = href ? url.resolve(URL, href) : null;
    title = propuesto
      .find('a[href*="docx"], a[href*="pdf"], a[href*="doc"]')
      .text();
  }
  if (!href) {
    propuesto = $('span[id*="outDetalle"] p:contains("Documento propuesto: ")');
    href = propuesto
      .find('a[href*="docx"], a[href*="pdf"], a[href*="doc"]')
      .attr('href');
    title = propuesto
      .find('a[href*="docx"], a[href*="pdf"], a[href*="doc"]')
      .text();
  }
  title = title.replace(/[”"]/g, '').trim();
  let Class = null;
  let sortValue = 1;
  let inverseSortValue = 1;
  if (inverseSortValue === 1) {
    Class = 'initial bill';
  } else {
    Class = null;
  }
  href &&
    results.push({
      URI: href,
      parentURL: URL,
      title,
      documentType: 'Documento propuesto',
      sortValue,
      inverseSortValue,
      Class,
    });

  // Otros documentos
  let otrosEvents = [];
  let otros = container.find('p:contains("Otros Documentos")').next();
  otros
    .find('a[href*="docx"], a[href*="pdf"], a[href*="doc"]')
    .each(function () {
      otrosEvents.push($(this).parent().html());
    });
  if (!otrosEvents.length) {
    otros = container.find('p:contains("Memoria Justificativa")');
    otros
      .find('a[href*="docx"], a[href*="pdf"], a[href*="doc"]')
      .each(function () {
        otrosEvents.push($(this).parent().html());
      });
  }
  let ototal = otrosEvents.length;
  for (let i = 0; i < otrosEvents.length; i++) {
    let oinversed = otrosEvents[ototal - (i + 1)];
    $ = cheerio.load(oinversed);
    href = $('a').attr('href');
    href = href ? url.resolve(URL, href) : null;
    title = $.text()
      .replace(/\.(pdf|docx?|”|")/gi, '')
      .trim();

    let Class = null;
    let sortValue = i + 1;
    let inverseSortValue = ototal - i;
    //if (inverseSortValue === 1) {Class = 'initial bill'} else {Class = null}
    href &&
      results.push({
        URI: href,
        parentURL: URL,
        title,
        documentType: 'Otros documentos',
        sortValue,
        inverseSortValue,
        Class,
      });
  }

  // Conclusiones
  let concEvents = [];
  let conc = container.find('[id $="conclusiones"]');
  conc
    .find('a[href*="docx"], a[href*="pdf"], a[href*="doc"]')
    .each(function () {
      concEvents.push($(this).parent().html());
    });
  let ctotal = concEvents.length;
  for (let i = 0; i < concEvents.length; i++) {
    let cinversed = concEvents[ctotal - (i + 1)];
    $ = cheerio.load(cinversed);
    href = $('a').attr('href');
    href = href ? url.resolve(URL, href) : null;
    title = $.text()
      .replace(/\.(pdf|docx?)/gi, '')
      .trim();

    let Class = null;
    let sortValue = i + 1;
    let inverseSortValue = ctotal - i;
    //if (inverseSortValue === 1) {Class = 'initial bill'} else {Class = null}
    results.push({
      URI: href,
      parentURL: URL,
      title,
      documentType: 'conclusiones',
      sortValue,
      inverseSortValue,
      Class,
    });
  }

  return results;
}
