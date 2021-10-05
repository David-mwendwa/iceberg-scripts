"use strict";

const moment = require("moment");
const cheerio = require("cheerio");
const url = require("url");
const querystring = require("querystring");

async function parsePage({responseBody, URL}) {
    const $ = cheerio.load(responseBody.content);
    const results = [];
    let doc = {content_url: ''};
    if (doc.content_url) {
        let htmlContent = "";
        let toMerge = [doc.content_url].concat(doc.annexes);
        for (let i = 0; i < toMerge.length; i++) {
            let _url = toMerge[i];
            var URLId = "H" + new Buffer(_url).toString("base64");
            let URLIdN = "H" + sha256(_url) + ".N";
            let filter = /\.pdf/i.test(_url) ? "pdf2htmlEx" : /\.docx?/i.test(_url) ? "sofficeHtml" : null;
            if (!filter) {
                console.log("No Filter for", _url);
                continue
            }
            var resp = await graphql(`
              query {
                nodes(ids: ["${URLId}", "${URLIdN}"]) {
                id
                ... on CrawledURL {
                  lastSuccessfulRequest {
                    outputForFilter(filter: "${filter}")
                  }
                }
              }
            }`);

            let node = resp.nodes.filter(n => n)[0];

            if (node && node.lastSuccessfulRequest && node.lastSuccessfulRequest.outputForFilter[0].filterOutput.content) {
                let _html = node.lastSuccessfulRequest.outputForFilter[0].filterOutput.content;
                htmlContent += _html;
            } else {
                // throw("Conversion to HTML failed");
            }
            //throw new Error(JSON.stringify(resp, null, 4));

        }
        doc.merged_content = htmlContent && {content: htmlContent, fileFormat: "text/html", locale: "en"} || null;
        doc.URI.push(doc.content_url, doc.content_url.replace(/\/\/Judgments/, "/Judgments"), doc.content_url.replace(/([^\/])\/Judgments/, "$1//Judgments"));
        doc.URI = doc.URI.filter((c, i, a) => a.indexOf(c) === i);
        return [doc];
    }
    return results;
}

const parserTest = function () {
    const fs = require("fs");
    let buffer = fs.readFileSync(__dirname + "/../pdf/d.html");
    buffer = parsePage({responseBody: {content: buffer}, URL: ""});
    console.log(JSON.stringify(buffer, null, 4));
    console.log(buffer.length);
};
parserTest();