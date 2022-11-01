async function parsePage({responseBody, URL}) {
    let json = JSON.parse(responseBody.content);
    const results = [];
    
  	json.data.forEach(obj => {
      let doc = {URI:[], URL}
      let {numeroProcesso, classeJudicial, relator, orgaoJulgador, dataJulgamento, dataAssinatura, ementa} = obj
      let href = `https://pje.trf5.jus.br/pje/ConsultaPublica/listView.seam?processo=${numeroProcesso}`
      doc.URI.push(href)
      doc.numeroProcesso = numeroProcesso
      doc.classeJudicial = classeJudicial
      doc.relator = relator
      doc.orgaoJulgador = orgaoJulgador
      doc.dataJulgamento = formatDate(dataJulgamento)
      doc.dataAssinatura = formatDate(dataAssinatura)
      doc.title = `Processo ${numeroProcesso} del ${dataJulgamento}`
      doc.ementa = ementa
      
      results.push(doc)      	
    })
  	//return results
  
  	let filteredRecords = []
    for (obj of results) {
      let processoURL = obj.URI[0]
      let output = await parseRemoteUrl(processoURL);
      let processoHasContent = output && !!output.length
      if (processoHasContent) {
      	filteredRecords.push(obj)
      }
    }  
    return filteredRecords;
}

function formatDate(date) {
  let d = date && moment(date.replace(/\sdel?/g, ''), ['DD MMMM YYYY', 'DD/MM/YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD'], 'es');
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

const parseRemoteUrl = async (urlToParse, parserId = "A06rg5f9z6chza8") => {
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