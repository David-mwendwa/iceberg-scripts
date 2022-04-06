// define or get responseBody first
let html = iconv.decode(responseBody.buffer, 'win-1251');
const $ = cheerio.load(html);
