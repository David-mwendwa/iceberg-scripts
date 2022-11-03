
async function fetchPage({canonicalURL, requestURL, requestOptions, headers}) {
    if (!requestOptions) requestOptions = {method: "GET", headers};
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
    return await fetchWithCookies(requestURL, requestOptions)
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({URL: requestURL}, requestOptions),
                response
            };
        });
}

const getListing = async function ({page, from, to, canonicalURL, headers}) {
  	from = from.format('YYYY-MM-DD')
  	to = to.format('YYYY-MM-DD')
    //throw(JSON.stringify({from, to, page}))
    let customHeaders = {
        "DNT": "1",
        "Origin": "https://publicacionsentencias.stjjalisco.gob.mx",
        "Referer": "https://publicacionsentencias.stjjalisco.gob.mx/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
        "sec-ch-ua": "\"Chromium\";v=\"106\", \"Google Chrome\";v=\"106\", \"Not;A=Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = `https://publica-sentencias-backend.stjjalisco.gob.mx/tocas?page=${page}&fecha_ini=${from}&fecha_fin=${to}&sala_id=&numero=&periodo=&derivado=&delito_id=&materia_id=&tipo_juicio_id=&nombre_delito=&accion_especifica_id=&accion_simultanea_id=&magistrado_id=&sentido_id=&tipo_sentencia=&resolucion=&palabra_clave=&perspectiva_genero=&principio_ninez=&paginador=20`
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return responsePage;
};

const content = async function ({id, canonicalURL, headers}) {
    let customHeaders = {
        "DNT": "1",
        "Origin": "https://publicacionsentencias.stjjalisco.gob.mx",
        "Referer": "https://publicacionsentencias.stjjalisco.gob.mx/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
        "sec-ch-ua": "\"Chromium\";v=\"106\", \"Google Chrome\";v=\"106\", \"Not;A=Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    //let requestURL = 'https://publica-sentencias-backend.stjjalisco.gob.mx/toca/46917/file';
  	let requestURL = id ? `https://publica-sentencias-backend.stjjalisco.gob.mx/toca/${id}/file` : canonicalURL
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return responsePage;
};

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const match = canonicalURL.match(/\?(start|from)=(\d{4}-\d{2}-\d{2}).(end|to)=(\d{4}-\d{2}-\d{2})(&page=(\d+))?$/i);
  	const isContent = canonicalURL.match(/toca\/(\d+)\/file/)
    if (match) {
        let from = moment(match[2]);
        let to = moment(match[4]);
        let page = match[6] ? parseInt(match[6]) : 1;
        return [await getListing({from, to, page, canonicalURL, headers})]
    } else if (isContent) {
      	let id = isContent[1] || null
    	return [await content({id, canonicalURL, headers})]
    } else {
        return defaultFetchURL({canonicalURL, headers});
    }
}