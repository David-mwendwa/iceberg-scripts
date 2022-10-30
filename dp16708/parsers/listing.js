function parsePage({responseBody, URL}) {
    let json = JSON.parse(responseBody.content);
    const results = [];
  
  	json.data.proyectos.forEach((obj) => {
      let doc = { URI: [] };
      let { proyectoLey, titulo, perParId, pleyNum } = obj;
      doc.titulo = `${proyectoLey}, ${titulo}`;
      let href = `https://wb2server.congreso.gob.pe/spley-portal-service/expediente/${perParId}/${pleyNum}`;
      doc.URI.push(href);
      results.push(doc);
    });
  
    return results;
}

function formatDate(date) {
  let d = date && moment(date.replace(/\sdel?/g, ''), ['DD MMMM YYYY', 'DD/MM/YYYY', 'DD-MM-YYYY'], 'es');
  return d && d.isValid ? d.format('YYYY-MM-DD') : null;
}
const sentenceCase = (input) => {
  input = input === undefined ? null : input;
  return (
    input && input.toString().toLowerCase().replace(/(^|[.?!] *)([a-z])/g,
        (match, separator, char) => separator + char.toUpperCase()
      )
  );
};