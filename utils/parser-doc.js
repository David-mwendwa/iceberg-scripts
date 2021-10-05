"use strict";

const moment = require("moment");
const cheerio = require("cheerio");

//use * to HTML (openoffice) filter

function parsePage({URL, responseBody, html}) {
    if (!/word/i.test(responseBody.fileFormat)) {
        console.error("Error: File is NOT valid DOC " + URL);
        return [];
    }
    const document = {
        URI: URL
    };
    let locale = "es";
    document.originalDoc = [{
        mediaObjectId: responseBody.id,
        fileFormat: responseBody.fileFormat,
        locale
    }];

    if (html) {
        let $ = cheerio.load(html, {decodeEntities: false});
        //doesn't handle pictures well
        $("img").remove();
        document.htmlContent = {fileFormat: "text/html", content: $.html(), locale};
        document.text = {fileFormat: "text/plain", content: $.text(), locale};
    } else {
        document.htmlContent = null;
        document.text = html;
    }
    return [document];
}
