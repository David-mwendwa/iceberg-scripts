"use strict";

const moment = require("moment");
const cheerio = require("cheerio");


function parsePage({URL, responseBody, html, responseURL}) {
    const doc = {
        URI: URL
    };
    let locale = "es";
    html = responseBody.content;
    if (html) {
        let $ = cheerio.load(html, {decodeEntities: false});
        $("script, meta, base, iframe, frame").remove();
        $("a[href]").each(function (i) {
            let a = $(this);
            a.attr('href', 'Javascript:void(0)');
            a.attr('onclick', 'Javascript:void(0)');
            a.attr('style', (a.attr('style') || "") + "color=black;");
        });
        doc.htmlContent = {fileFormat: "text/html", content: $.html(), locale};
    }
    return [doc];
}
