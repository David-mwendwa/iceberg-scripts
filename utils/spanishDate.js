const spanishDate = (text) => {
  let match = /.+?(\d{1,2} (?:de )?\w{3,} ?(?:de )?\d{4})/i.exec(text);
  if (!match) {
    match = /(\w+ \d{2} de \d{4})/.exec(text);
  }
  return match && match[1];
};
