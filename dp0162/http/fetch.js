"use strict";

const querystring = require("querystring");
const FormData = require("form-data");
const moment = require('moment');
const url = require('url');
const cheerio = require('cheerio');
const fetch = require('node-fetch');//to reconstruct response fetch.Response(html,....)

const fetcher = require("../../utils/fetcher");
let fetchWithCookies = fetcher.fetchWithCookies;
// let fetch = fetcher.fetch;//only use fetchWithCookies or defaultFetchURL for Tests
let defaultFetchURL = fetcher.defaultFetchURL;


let map = {};

function setSharedVariable(key, value) { map[key] = value; }

function getSharedVariable(key) {return map[key];}

async function fetchPage({
  canonicalURL,
  requestURL,
  requestOptions,
  headers,
}) {
  if (!requestOptions) requestOptions = { method: 'GET', headers };
  if (!canonicalURL) canonicalURL = requestURL;
  if (!requestURL) requestURL = canonicalURL;
  if (requestURL.match(/^https/i)) {
    requestOptions.agent = new https.Agent({
      rejectUnauthorized: false,
      keepAlive: true,
    });
  }
  return await fetchWithCookies(requestURL, requestOptions, 'no-proxy').then(
    (response) => {
      return {
        canonicalURL,
        request: Object.assign({ URL: requestURL }, requestOptions),
        response,
      };
    }
  );
}

const home = async function ({ argument, canonicalURL, headers }) {
  let customHeaders = {
    'Cache-Control': 'max-age=0',
    'sec-ch-ua':
      '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Site': 'cross-site',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-User': '?1',
    'Sec-Fetch-Dest': 'document',
    Referer: 'https://justis.visualstudio.com/',
    'Accept-Encoding': 'gzip, deflate, br',
  };
  let _headers = Object.assign(customHeaders, headers);

  let method = 'GET';
  let requestOptions = { method, headers: _headers };
  let requestURL = 'https://jurisprudencia.tsj.bo/resoluciones/avanzado';
  let responsePage = await fetchPage({
    canonicalURL,
    requestURL,
    requestOptions,
  });
  return responsePage;
};

const seachByYear = async function ({ canonicalURL, headers }) {
  await home({ headers });
  let customHeaders = {
    'sec-ch-ua':
      '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
    'X-Requested-With': 'XMLHttpRequest',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    Referer: 'https://jurisprudencia.tsj.bo/resoluciones/avanzado',
    'Accept-Encoding': 'gzip, deflate, br',
  };
  let _headers = Object.assign(customHeaders, headers);

  let method = 'GET';
  let requestOptions = { method, headers: _headers };
  let requestURL = canonicalURL;
  let responsePage = await fetchPage({
    canonicalURL,
    requestURL,
    requestOptions,
  });
  return responsePage;
};

const pagination = async function ({ canonicalURL, headers }) {
  /*if (/page=1$/.test(canonicalURL)) {
        	return await seachByYear({canonicalURL, headers})
        }*/
  let customHeaders = {
    'sec-ch-ua':
      '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
    'X-Requested-With': 'XMLHttpRequest',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    Referer: 'https://jurisprudencia.tsj.bo/resoluciones/avanzado',
    'Accept-Encoding': 'gzip, deflate, br',
  };
  let _headers = Object.assign(customHeaders, headers);
  let method = 'GET';
  let requestOptions = { method, headers: _headers };
  let requestURL = canonicalURL;
  let responsePage = await fetchPage({
    canonicalURL,
    requestURL,
    requestOptions,
  });
  return responsePage;
};

async function fetchURL({ canonicalURL, headers }) {
  if (/https?:.*https?:/i.test(canonicalURL)) {
    console.error('Rejecting URL', canonicalURL, `returning [];`);
    return [];
  }
  const match = canonicalURL.match(/\?gestion=(\d+)&page=1$/i);
  const isPagination = canonicalURL.match(/\?gestion=(\d+)&page=(\d+)$/i);
  if (match) {
    let year = parseInt(match[1]);
    return [await seachByYear({ year, canonicalURL, headers })];
  } else if (isPagination) {
    let year = parseInt(isPagination[1]);
    let page = parseInt(isPagination[2]);
    return [await pagination({ year, page, canonicalURL, headers })];
  } else {
    return await fetchPage({ canonicalURL, headers });
  }
}