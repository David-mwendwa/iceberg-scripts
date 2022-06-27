function parsePage({responseBody, URL}) {
    let json = JSON.parse(responseBody.content);
    const results = [];
    
  	let pdf = json.data[0].cDesUrl;
  	pdf = pdf ? url.resolve(URL, pdf) : null
    let objs = [{URI: [URL, pdf]}];
    json.data.forEach(obj => {
    	objs.push({ [obj.cDesEtiqueta]: obj.cdesValor });
    });

    let root_obj = objs.reduce(function (acc, val) {
    	return Object.assign(acc, val)
    }, {})
    
    let formatted_dates = {
      ['Fecha de Emisión del Laudo']: formatDate(root_obj['Fecha de Emisión del Laudo']),
      ['Fecha de Instalación/ Demanda']: formatDate(root_obj['Fecha de Instalación/ Demanda']),
      ['Observación']: sentenceCase(root_obj['Observación'])
    }
    
    results.push(Object.assign(root_obj, formatted_dates))
  
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

