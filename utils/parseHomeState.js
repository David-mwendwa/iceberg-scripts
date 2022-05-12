// parse view dom id -> call @homepage
const parseViewState = async function ({ responsePage }) {
    let html = await responsePage.response.text();
  	responsePage.response = new fetch.Response(html, responsePage.response);
    const $ = cheerio.load(html, { xmlMode: true, decodeEntities: false });
    let content = $('div.pane-content, div.content');
    let classes = content.find("div[class*='view-dom-id-']").attr('class');
    let match = /view-dom-id-(.*)\b/.exec(classes)
    let view_dom_id = match && match[1]
    if (view_dom_id) setSharedVariable('view_dom_id', view_dom_id);
  	return view_dom_id
};

// parse theme token -> call @homepage
const parseThemeToken = async function ({responsePage}) {
    let html = await responsePage.response.text();
  	responsePage.response = new fetch.Response(html, responsePage.response);
    const $ = cheerio.load(html, {xmlMode: true, decodeEntities: false});
  	let match = /theme_token":"(.*?)"/.exec($.html())
    let theme_token = match && match[1]
    if (theme_token) setSharedVariable('theme_token', theme_token);
  	return theme_token
};