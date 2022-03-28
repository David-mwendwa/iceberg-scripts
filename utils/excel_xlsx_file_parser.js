async function parsePage({ URL, responseBody, filterOutputs }) {
  let doc = {};
  doc.URI = URL;
  doc.attachment = {
    dataType: 'MEDIA',
    mediaObjectId: responseBody.id,
    fileFormat: 'application/xlsx',
    locale: 'es',
  };
  if (filterOutputs && filterOutputs['xlsx2json']) {
    let jsonParsed = JSON.parse(await filterOutputs['xlsx2json'].getContent());
    doc.parsedContent = jsonParsed;
  }
  return [doc];
}
