function removeDecodedChars(metadata) {
  return metadata.replace(/u002f/ig, '/')
  	.replace(/u201c/ig, '“').replace(/u201d/ig, '”')
    .replace(/u00aa/ig, 'ª').replace(/u00ed/ig, 'í')
    .replace(/u00e9/ig, 'é').replace(/u00c9/ig, 'É')
    .replace(/u00fa/ig, 'ú').replace(/u00da/ig, 'Ú')
    .replace(/u00f3/ig, 'ó').replace(/u00d3/ig, 'Ó')
    .replace(/u00e1/ig, 'á').replace(/u00c1/ig, 'Á')
    .replace(/u00f1/ig, 'ñ').replace(/u00d1/ig, 'Ñ')
    .replace(/u00ed/ig, 'í')
}