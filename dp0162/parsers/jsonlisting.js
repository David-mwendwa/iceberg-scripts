async function parsePage({responseBody, URL, html, referer}) {
    const results = [];
  	let json = JSON.parse(responseBody.content);
  	if (/\?gestion=(\d+)&page=(.+)$/i.test(URL)) { 
        let res = json.data.data
        res.length && res.forEach(obj => {
            let {id, nro_resolucion, fecha_emision, departamento, sala, resumen} = obj
            let title = nro_resolucion
            let sentence_number = nro_resolucion;
          	let date_original = fecha_emision;
          	let d = moment(date_original, 'DD-MM-YYYY')
          	let date = d.isValid ? d.format('YYYY-MM-DD') : null
          	let room = sala
            let summary = resumen
            let pdfURL = `https://jurisprudencia.tsj.bo/resoluciones/${id}/pdf`
            results.push({URI:[pdfURL], sentence_number, date_original, date, room, title, summary})
        })
    }      
  	return results
};