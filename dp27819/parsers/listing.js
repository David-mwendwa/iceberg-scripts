async function parsePage({ URL, responseBody, html }) {
  	console.log(`CURRENT_URL: ${URL}`)
  	try {
        let results = []
        let doc = {URI: [URL], URL}
        let json = JSON.parse(responseBody.content);
        let pdfURL = json && json.files && json.files[0] && json.files[0].filePath || null
        doc.URI.push(pdfURL)
        let publishDateOriginal = json.startingDate
        doc.publishDateOriginal = publishDateOriginal
        doc.publishDate = formatDate(publishDateOriginal)

        let dateOriginal = json.modifiedDate
        doc.dateOriginal = dateOriginal
        doc.date = formatDate(dateOriginal)
        doc.year = moment(doc.date).year() || null
        let title = sentenceCase(json.name)
        title = title.replace(/nº/, 'Nº').replace(/no\./, 'No.').replace(/\bno\b/, 'No')
        title = title
        doc.title = title.replace(/\w+\s+\d{1,2}\s+\d{4}\b\s+/i, '').replace(/\w+\s+\d{1,2}\s+(?:del?\s+)?\d{4}\b\s+/i, '').replace(/\bdel\D+\d{2}\D+\d{4}\b/i, '').replace(/\bdel?\D+\d{4}\s+/i, '').replace(/\bde\s+\d{4}/i, '').trim()
        doc.summary = sentenceCase(json.metaDescription)
        let tag = json.labels[0] && json.labels[0].name || null
        tag = tag && !/^\d{4}$/.test(tag.trim()) ? tag : json.labels[1] && json.labels[1].name || null
        doc.tag = tag
        let match = /www\.(\w+)/.exec(URL) 
        let key = match && match[1]
        doc.municipio = key ? getMunicipio(key) : null
        doc['municipio lowercase'] = titleCase(doc.municipio)

        let obj = getDocumentTypeAndNumber({tag, title})

        if (/\.[pd][do][fc][x]?/i.test(pdfURL)) {
            results.push(Object.assign(doc, obj));
        }
        return results;
    } catch (err) {
    	throw(`Error: ${err}`)
    }
}

function getMunicipio(key) {
  let map = {puertoberrio:"PUERTO BERRÍO",puertonare:"PUERTO NARE",yondo:"YONDÓ (Casabe)",saravena:"SARAVENA",cantagallo:"CANTAGALLO",sanpablo:"SAN PABLO",labranzagrande:"LABRANZAGRANDE",paez:"PÁEZ",pajarito:"PAJARITO",paya:"PAYA",pisba:"PISBA",sanluisdegaceno:"SAN LUIS DE GACENO",santamaria:"SANTA MARÍA",cartagenadelchaira:"CARTAGENA DEL CHAIRA",solano:"SOLANO",aguazul:"AGUAZUL",chameza:"CHÁMEZA",hatocorozal:"HATO COROZAL",monterrey:"MONTERREY",recetor:"RECETOR",sabanalarga:"SABANALARGA",sacama:"SÁCAMA",tamara:"TÁMARA",trinidad:"TRINIDAD",villanueva:"VILLANUEVA",yopal:"YOPAL",aguachica:"AGUACHICA",sanalberto:"SAN ALBERTO",gachala:"GACHALÁ",guaduas:"GUADUAS",medina:"MEDINA",paratebueno:"PARATEBUENO",puertosalgar:"PUERTO SALGAR",ubala:"UBALÁ",aipe:"AIPE",garzon:"GARZÓN",tello:"TELLO",villavieja:"VILLAVIEJA",manaure:"MANAURE",santamaria:"SANTA MARTA",barrancadeupia:"BARRANCA DE UPÍA",castillalanueva:"CASTILLA LA NUEVA",cubarral:"CUBARRAL",cumaral:"CUMARAL",elcastillo:"EL CASTILLO",eldorado:"EL DORADO",fuentedeoro:"FUENTE DE ORO",guamal:"GUAMAL",lejanias:"LEJANÍAS",puertogaitan:"PUERTO GAITÁN",puertolleras:"PUERTO LLERAS",restrepo:"RESTREPO",vistahermosa:"VISTAHERMOSA",ipiales:"IPIALES",tibu:"TIBÚ",orito:"ORITO",puertocaicedo:"PUERTO CAICEDO",puertoleguizamo:"PUERTO LEGUÍZAMO",bolivar:"BOLIVAR",cimitarra:"CIMITARRA",puertoparra:"PUERTO PARRA",puertowilches:"PUERTO WILCHES",sabanadetorres:"SABANA DE TORRES",sanvicentedechucuri:"SAN VICENTE DE CHUCURÍ",simacota:"SIMACOTA",covenas:"COVEÑAS",icononzo:"ICONONZO",cumaribo:"CUMARIBO"};
  return key && map[key] ? map[key] : key.toUpperCase();
} 

function getDocumentTypeAndNumber({ tag, title }) {
  tag = tag === undefined ? null : tag && tag.trim().replace(/\s.+/g, '').toLowerCase()
  let map = {cobro:'Aviso',codigos:'codigo',calendario:'Calendario',convocatorias:'Convocatoria',certificaciones:'Certificación',avoca:'Avoca',auto:'Auto',notificación:'Notificación',orta:'Orta',otra:'Otra',estados:'Estado',resoluciones:'Resolución',decretos:'Decreto',acuerdos:'Acuerdo',circulares:'Circular',edictos:'Edicto',edicto:'Edicto',acta:'Acta',ley:'Ley',decreto_nacional:'decreto'}
  let documentType = null
  let match = title && /^([\wóò]+).*N[o°]\D+(\d+)/.exec(title.trim()) || /^([\wóò]+)\D+(\d+)/.exec(title.trim())
  if (map[tag]) {
    documentType = map[tag]
  } else {
    if (match) {
      documentType = match[1].toLowerCase()
      if (/Resol/i.test(documentType)) documentType = 'resolución'
      if (/Notifi/i.test(documentType)) documentType = 'notificación'
      if (/publica/i.test(documentType)) documentType = 'publicación'
      if (/Radica/i.test(documentType)) documentType = 'radicación'
      if (/Constitu/i.test(documentType)) documentType = 'constitución'
      if (/Certificaci/i.test(documentType)) documentType = 'certificación'
      if (/Personer/i.test(documentType)) documentType = 'personería'
      documentType = documentType.charAt(0).toUpperCase() + documentType.slice(1);
    }
  }
  let doc = { documentType: null };
  if (documentType) {
    doc.documentType = documentType;
    doc[`${documentType.toLowerCase()}Number`] = match && match[2] || null
  } else {
  	 doc = { documentType: null, documentNumber: null }
  }
  return doc
}

const formatDate = (date) => {
  let d = date && moment(date.replace(/\sdel?/g, ''), ['DD MMMM YYYY', 'DD/MM/YYYY', 'DD-MM-YYYY', 'YYYY/MM/DD'], 'es');
  return d && d.isValid ? d.format('YYYY-MM-DD') : null;
}

function titleCase(str) {
   var splitStr = str && str.toLowerCase().split(' ');
   for (var i = 0; i < splitStr.length; i++) {
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
   }
   return splitStr.join(' ').replace(/\bde/i, 'de'); 
}

const sentenceCase = (input) => {
  input = input === undefined ? null : input && input.trim().replace(/(^["]|["]$)/g, '');
  return (
    input && input.toString().toLowerCase().replace(/(^|[.?!] *)([a-z])/g,
        (match, separator, char) => separator + char.toUpperCase()
      )
  );
};

const parseRemoteUrl = async (urlToParse, parserId = "A06repriqg1a2sf") => {
    const urlToParseId = "H" + new Buffer(urlToParse).toString("base64");
    const urlToParseId2 = "H" + sha256(urlToParse) + ".N";
    const resp = await graphql(`
          query {
            nodes(ids: ["${urlToParseId}", "${urlToParseId2}"]) {
              id
              ... on CrawledURL {
                lastSuccessfulRequest {
                  id
                }
              }
            }
          }`);

    let parserRes;
    let node = resp.nodes && resp.nodes.filter(n => n)[0];
    if (node && node.lastSuccessfulRequest) {
        // Parse acordao listing page
        parserRes = await graphql(`
            query {
              node(id:"${parserId}") {
                ... on CrawledPageParser {
                  jsonOutputFor(requestId:"${node.lastSuccessfulRequest.id}")
                }
              }
            }`);
    }

    return parserRes && parserRes.node && parserRes.node.jsonOutputFor;//returns array, filter as necessary
};