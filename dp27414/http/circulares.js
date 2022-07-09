async function fetchPage({
  canonicalURL,
  requestURL,
  requestOptions,
  headers,
}) {
  if (!requestOptions) requestOptions = { method: 'GET', headers };
  if (!canonicalURL) canonicalURL = requestURL;
  if (!requestURL) requestURL = canonicalURL;
  return await fetchWithCookies(requestURL, requestOptions).then((response) => {
    return {
      canonicalURL,
      request: Object.assign({ URL: requestURL }, requestOptions),
      response,
    };
  });
}

const home = async function ({ argument, canonicalURL, headers }) {
  let customHeaders = {
    'Cache-Control': 'max-age=0',
    DNT: '1',
    'If-Modified-Since': 'Fri, 17 Jun 2022 13:09:47 GMT',
    Referer:
      'https://www.casanare.gov.co/NuestraGestion/Paginas/Normatividad.aspx',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'sec-ch-ua':
      '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Accept-Encoding': 'gzip, deflate, br',
  };
  let _headers = Object.assign(customHeaders, headers);
  let method = 'GET';
  let requestOptions = { method, headers: _headers };
  let requestURL =
    'https://www.casanare.gov.co/NuestraGestion/Paginas/Resoluciones.aspx';
  let responsePage = await fetchPage({
    canonicalURL,
    requestURL,
    requestOptions,
  });
  return responsePage;
};

const getCirculares = async function ({ argument, canonicalURL, headers }) {
  let customHeaders = {
    DNT: '1',
    'If-Modified-Since': 'Thu, 30 Jun 2022 06:03:47 GMT',
    Referer:
      'https://www.casanare.gov.co/NuestraGestion/Paginas/Normatividad.aspx',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'X-Requested-With': 'XMLHttpRequest',
    'sec-ch-ua':
      '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Accept-Encoding': 'gzip, deflate, br',
  };
  let _headers = Object.assign(customHeaders, headers, {
    Accept: 'application/json; odata=verbose',
  });
  let method = 'GET';
  let requestOptions = { method, headers: _headers };
  let requestURL =
    "https://www.casanare.gov.co/NuestraGestion/_api/web/lists/getbyTitle('Normatividad')/items?$select=Title,LinkFilename,Fecha,Clasificaci_x00f3_n,A_x00f1_o,Descripci_x00f3_n&$top=10000&$filter=substringof(%27Circulares%27,Title)%20or%20substringof(%27Circulares%27,FileLeafRef)%20or%20substringof(%27Circulares%27,Clasificaci_x00f3_n)";
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
  const isCirculares = canonicalURL.match(/Circulares/i);
  if (isCirculares) {
    return [await getCirculares({ canonicalURL, headers })];
  } else {
    return defaultFetchURL({ canonicalURL, headers });
  }
}

