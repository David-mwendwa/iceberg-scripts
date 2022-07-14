function getDocumentTypeAndNumber({ tag, title }) {
  tag = tag === undefined ? null : tag.toLowerCase()
  let map = {orta:'Orta',otra:'Otra',estados:'Estado',resoluciones:'Resoluciòn',decretos:'Decreto',acuerdos:'Acuerdo',circulares:'Circular',edictos:'Edicto',edicto:'Edicto',acta:'Acta',ley:'Ley',decreto_nacional:'decreto'}
  let documentType = null
  let match = title && /^([\wóò]+).*N[o°]\D+(\d+)/.exec(title.trim()) || /^([\wóò]+)\D+(\d+)/.exec(title.trim())
  if (map[tag]) {
    documentType = map[tag]
  } else {
    if (match) {
      documentType = match[1].toLowerCase()
      if (/Resol/i.test(documentType)) documentType = 'resolución'
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

getDocumentTypeAndNumber({ tag: null, title: 'Resolución No 040 2021' });