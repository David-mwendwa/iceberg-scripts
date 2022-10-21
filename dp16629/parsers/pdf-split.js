const DISPLAY_OUTPUT_FASTER = false // this removes pdfContent, htmlContent & text from the output

async function parsePage({URL, responseBody, html}) {
    if (!/pdf/i.test(responseBody.fileFormat)) {
        console.error("Error: File is NOT valid PDF " + URL);
        return [];
    }
  	let results = []
  
    let text = await runRemoteFilter({URL, filter: "pdftotext_raw"});
  	if (text && typeof text === "string"){
      let lines = text && text.split(/\s*\n\s*/ig).filter(l=>l);
      let textString = lines && lines.join(' ').replace(/\s\./g, '.').trim() 
      let match = /Disponibiliza\D+?(\d{1,2}\/\d{1,2}\/\d{4})/i.exec(textString)
      let disponibilaçao = match && match[1]
      match = /Publicação\D+?(\d{1,2}\/\d{1,2}\/\d{4})/i.exec(textString)
      let publicação = match && match[1]
      match = /Ediç\D+?([\d\/]+)/.exec(textString)
      let ediçao = match && match[1]
      match = /SUMÁRIO(.+[\.]{30}\s?\d+)/i.exec(textString)
      let summaryText = match && match[1]
      //results.push({summaryText})
      let splits = summaryText.split(/([a-z].+?[\.]{10}.+?\d+)/i).filter((l) => /^\w.+\d+/.test(l) && l);
      //results.push({splits})
      const sections = []
      for (let i = 0; i < splits.length; i++) {
        let d = {}
        let title = splits[i]
        let match = /[.\s]{2,}(\d+)/.exec(title);
        if (match) {
          if (/\.gov\.br/.test(title)) {
          	title = title.replace(/^.+\.gov\.br/, '')
          }
          if (title.length > 800) break;
          d.title = title
          d.page = match[1];
          sections.push(d);
        }
      };
      //results.push({sections})

      let locale = "br";
      for (let i = 0; i < sections.length; i++) {
        const obj = {URI: [], URL}
        let { title, page } = sections[i];
        let startPage = sections[i].page
        let endPage = i < sections.length - 1 ? sections[i + 1].page : 'end'
        obj['title'] = title.replace(/[\.]{4}.+/g, '').replace(/[\(\)]/g, '').trim()
        obj['disponibilaçao'] = formatDate(disponibilaçao)
        obj['publicação'] = formatDate(publicação)
        obj['ediçao Nº'] = ediçao
        obj['startPage'] = startPage
        obj['endPage'] = endPage
        obj['pdfContent'] = await splitPDF({pdfURL: URL, startPage, endPage, locale})
        obj["htmlContent"] = obj.pdfContent && obj.pdfContent.mediaObjectId && await transcodeMediaObject({mediaObjectId: obj.pdfContent.mediaObjectId, filter:"pdf2htmlEx", locale});
        obj["text"] = obj.pdfContent && obj.pdfContent.mediaObjectId && await transcodeMediaObject({mediaObjectId: obj.pdfContent.mediaObjectId, filter:"pdftotext_raw", locale});
        obj.URI.push(URL + (URL.search(/\?/) > 0 ? "&" : "?") + `split=${startPage}-${endPage}` + `&title=${obj.title && obj.title.replace(/\s+/g, '_').replace(/:/g, '').toLowerCase()}`)
        if (DISPLAY_OUTPUT_FASTER) {
        	delete obj.pdfContent; delete obj.htmlContent; delete obj.text
        }
        results.push(obj)        
      }
  	}
  	return results
}

const runRemoteFilter = async function ({URL, id, filter}) {
    let textContent = "";
    const URLId = URL && "H" + new Buffer(URL).toString("base64");
    const URLIdN = URL && "H" + sha256(URL) + ".N";
    let query = `
              query {` +
        `
                nodes(ids: ["${URL && `${URLId}", "${URLIdN}` || `${id}`}"]) {`
        + `               id
                ... on CrawledURL {
                  lastSuccessfulRequest {
                    outputForFilter(filter: "${filter}")
                  }
                }
              }
            }`;
    const resp = await graphql(query);

    let node = resp.nodes.filter(n => n)[0];

    if (node
        && node.lastSuccessfulRequest
        && node.lastSuccessfulRequest.outputForFilter
        && node.lastSuccessfulRequest.outputForFilter.length
        && node.lastSuccessfulRequest.outputForFilter[0]
        && node.lastSuccessfulRequest.outputForFilter[0].filterOutput
        && node.lastSuccessfulRequest.outputForFilter[0].filterOutput.content) {
        let _text = node.lastSuccessfulRequest.outputForFilter[0].filterOutput.content;
        textContent += _text;
    } else {
    }
    return textContent;
};

function formatDate(date) {
    let d = date && moment(date.replace(/\sdel?/g, ''), ['DD MMMM YYYY', 'DD/MM/YYYY', 'DD-MM-YYYY'], 'es');
    return d && d.isValid ? d.format('YYYY-MM-DD') : null;
}

async function splitPDF({pdfURL, startPage = 1, endPage = 'end', locale}) {
    const URLId = "H" + new Buffer(pdfURL).toString("base64");
    const URLIdN = "H" + sha256(pdfURL) + ".N";
    const resp = await graphql(`
            query {
              nodes(ids: ["${URLId}", "${URLIdN}"]) {
                id
                ... on CrawledURL {
                  lastSuccessfulRequest {
                    outputForFilter(filter: "getPDFRange", arguments: {FROM: "${startPage}", TO: "${endPage}"})
                  }
                }
              }
            }`);
    const res = resp.nodes && (resp.nodes[0] || resp.nodes[1]);
    const transcodedMediaObject = res && res.lastSuccessfulRequest &&
        res.lastSuccessfulRequest.outputForFilter &&
        res.lastSuccessfulRequest.outputForFilter.length &&
        res.lastSuccessfulRequest.outputForFilter[0].filterOutput &&
        res.lastSuccessfulRequest.outputForFilter[0].filterOutput.transcodedMediaObject;
    if (transcodedMediaObject) {
        let doc = {
            URI: pdfURL + (pdfURL.search(/\?/) > 0 ? "&" : "?") + `split=${startPage}-${endPage}`,
            parent_url: pdfURL
        };
        doc.content = {
            mediaObjectId: transcodedMediaObject.id,
            locale, dataType: "MEDIA"
        };
        return doc.content
    }
    return null;
}

async function transcodeMediaObject({mediaObjectId, filter, locale}) {
  const resp = await graphql(`
 	 mutation {
		transcodeMediaObject (input: {
        	clientMutationId: "0",
        	filter: "${filter}",
        	mediaObjectId: "${mediaObjectId}"
      	}) {
        	mediaObject {
          		id, content
        	}
      	}
   	}`);
  if(resp && resp.transcodeMediaObject && resp.transcodeMediaObject.mediaObject && resp.transcodeMediaObject.mediaObject){
  	return {
    	mediaObjectId: resp.transcodeMediaObject.mediaObject.id,
      	locale, dataType: "MEDIA", 
    }
  }
  return null;
}