function parsePage({responseBody, URL}) {
    const $ = cheerio.load(responseBody.content, {decodeEntities: false});
  	let results = []

    let tab1 = $('ul.et_pb_tabs_controls + div.et_pb_all_tabs > div:nth-child(1)');
    let tab2 = $('ul.et_pb_tabs_controls + div.et_pb_all_tabs > div:nth-child(2)');
    let tab3 = $('ul.et_pb_tabs_controls + div.et_pb_all_tabs > div:nth-child(3)');
    let tab4 = $('ul.et_pb_tabs_controls + div.et_pb_all_tabs > div:nth-child(4)');
    [tab1, tab2, tab3, tab4].forEach(tab => {
        let tabContent = getTabContent(tab)
        tabContent.forEach(obj => results.push(obj))
    })

    function getTabContent(tab) {
        let tabContent = []
        tab.find("table>tbody>tr").each(function(){
            let tr = $(this)
            let col1 = tr.find("td").eq(0)
            let col2 = tr.find('td').eq(1)
            let opinion_number = col1.text().replace(/\n/g, ' ').trim()
            let title = opinion_number
            let tipo_de_causa;
            if (/^R/.test(opinion_number)) {
              	tipo_de_causa = 'Reclamaciones';
            } else if (/^D/.test(opinion_number)) {
              	tipo_de_causa = 'Demandas por daño ambiental';
            } else if (/^C/.test(opinion_number)) {
              	tipo_de_causa = 'Consultas de la SMA';
            } else if (/^S/.test(opinion_number)) {
              	tipo_de_causa = 'Solicitud de la SMA';
            }            
            let link = col2.find("a:contains(ver)").attr("href")
            let splitText = col2.text().split('\n');
            let abstract = splitText[0];
            const value = (key) => key && key.split(':')[1].trim()
            let relacionado_con = value(splitText.filter(text =>  /Relacionado/i.test(text)).toString())
            let región = value(splitText.filter(text =>  /Región/i.test(text)).toString())
            let resuelve = value(splitText.filter((text) => /Resuelve/i.test(text)).toString());
            let fecha_fallo_original = value(splitText.filter((text) => /Fecha/i.test(text)).toString());
            let d = moment(fecha_fallo_original, 'DD-MM-YYYY');
            let fecha_fallo = d.isValid() ? d.format('YYYY-MM-DD') : null;
            let document_type = "Sentencia"
            tabContent.push({
              URI:[link], 
              opinion_number, 
              tipo_de_causa, 
              abstract, 
              relacionado_con, 
              región, 
              fecha_fallo_original, 
              fecha_fallo, 
              resuelve, 
              document_type, 
              title
            })
        })
      	return tabContent
    }  
    return results;
}