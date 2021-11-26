async function parsePage({responseBody, URL, html, referer}) {
    const results = [];
    let {
      info: {Titulo, Numero, FechaPromulgacion, Gaceta, FechaPublicacion, Presidente, Consultor, Observacion}
    } = JSON.parse(responseBody.content);
    let documentNumber = Numero
    let enactmentDateOriginal = FechaPromulgacion
    let d = moment(enactmentDateOriginal.replace(/\sde/gi, ''), 'DD MMMM YYYY')
    let enactmentDate = d.isValid() ? d.format('YYYY-MM-DD') : null
    let publishDateOriginal = FechaPublicacion
    d = moment(publishDateOriginal.replace(/\sde/gi, ''), 'DD MMMM YYYY')
    let publishDate = d.isValid() ? d.format('YYYY-MM-DD') : null
  	let title = Titulo;
    let officialGazetteNumber = Gaceta    
    let presidente = Presidente
    let consultorJuridico = Consultor
    let notes = Observacion
    
    results.push({
      URI: [URL],
      documentNumber, 
      enactmentDateOriginal, 
      enactmentDate,
      title, 
      officialGazetteNumber, 
      publishDateOriginal, 
      publishDate,
      presidente, 
      consultorJuridico, 
      notes
    })

  	return results
};




