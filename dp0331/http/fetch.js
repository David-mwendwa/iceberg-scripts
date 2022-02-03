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

const getCadernoId = async function ({idCausa, canonicalURL, headers}) {
    let customHeaders = {
        "Referer": "http://2ta.lexsoft.cl/2ta/search?proc=3&idCausa=" + idCausa,
        "Content-Type": "application/json; charset=utf-8",
        "X-Requested-With": "XMLHttpRequest",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);

    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = 'http://2ta.lexsoft.cl/2ta/rest/ot/data/' + idCausa;
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    let caderno = idCausa;
    let type = responsePage && responsePage.response && responsePage.response.headers.get('content-type');
    console.log(JSON.stringify(type, null, 4));
    if (/json/i.test(type)) {
        let j = await responsePage.response.buffer();
        let json = JSON.parse(j);
        let cuardenoId = json && json.causa && Array.isArray(json.causa.cuadernos) && json.causa.cuadernos.length && json.causa.cuadernos[0].id;
        if (cuardenoId)
            caderno = cuardenoId;
    }
    return caderno;
};


const fetchCausaPage = async function ({idCausa, proc, canonicalURL, headers}) {
    let customHeaders = {
        "Upgrade-Insecure-Requests": "1",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);

    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = 'http://2ta.lexsoft.cl/2ta/search?proc=' + proc + '&idCausa=' + idCausa;
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    let log = await fetchLoginPage({referer: requestURL, headers});
  	let newCaudernoId = await getCadernoId({idCausa, canonicalURL, headers});
    let list = await getJSONList({referer: requestURL, canonicalURL, headers, idCausa: newCaudernoId||idCausa});
    let j = await list.response.buffer();
    list.response = new fetch.Response(j, list.response);
    let json = JSON.parse(j);
    let documentURL = null;
    for (let i = 0; json && json.results && i < json.results.length; i++) {
        let res = json.results[i];
        if (res && res.tipoTramite && /Resoluci[óo]n/i.test(res.tipoTramite.name) && /Sentencia/i.test(res.referencia) && res.documento) {
            // this is the one
            documentURL = documentURL || res.documento.id && `http://2ta.lexsoft.cl/2ta/download/${res.documento.id}?inlineifpossible=true`;
        }
        if (documentURL) break;
    }

    let responses = [list];
    if (documentURL) {
        let contentResponse = await downloadContent({canonicalURL: documentURL, headers});
        responses.push(contentResponse);
    }
    return responses;
};


const fetchLoginPage = async function ({referer, headers}) {
    let customHeaders = {
        "Referer": referer,
        "Pragma": "no-cache",
        "Cache-Control": "no-cache",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);

    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = `http://2ta.lexsoft.cl/2ta/rest/logged_user_data?ts=${new Date().getTime()}&bust=rev3494`;//todo verify rev3494
    let responsePage = await fetchPage({canonicalURL: requestURL, requestOptions});
    return responsePage;
};


const getJSONList = async function ({referer, canonicalURL, idCausa, headers}) {
    let customHeaders = {
        "Referer": referer,
        "X-Requested-With": "XMLHttpRequest",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);

    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = 'http://2ta.lexsoft.cl/2ta/rest/tramite/bloqueados/' + idCausa + '/100/1/false';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return responsePage;
};

const downloadContent = async function ({canonicalURL, headers}) {
    let responsePage = await fetchPage({canonicalURL, headers});
    let type = responsePage.response.headers.get('content-type');
    type && console.log(`TYPE = ${type}`);
    if (/octet/i.test(type)) {
        let name = responsePage.response.headers.get('content-disposition');
        let newtype = /\.pdf/i.test(name) ? "application/pdf" : /\.docx/i.test(name) ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : /\.doc/i.test(name) ? "application/msword" : null;
        console.log('disposition:', type, name);
        if (newtype) {
            responsePage.response.headers.set('content-type', newtype);
            type = newtype;
            type && console.log(`TYPE = ${type}`);
        }
    }
    if (responsePage.response.ok && /pdf|word/i.test(type)) {//Make sure your binary fileType is permitted by this regex
        let contentSize = parseInt(responsePage.response.headers.get('content-length') || "-1");
        let buffer = await responsePage.response.buffer();
        let bufferLength = buffer.length;
        if (contentSize < 0 || bufferLength === contentSize) {
            responsePage.response = new fetch.Response(buffer, responsePage.response);
        } else if (contentSize == 0 || bufferLength == 0) {//empty response
            responsePage.response.ok = false;
            responsePage.response.status = 404;
            responsePage.response.statusText = `Empty ${type} document download: ${contentSize} > ${bufferLength}\n`.toUpperCase();
            responsePage.response = new fetch.Response(responsePage.response.statusText, responsePage.response);
        } else {
            responsePage.response.ok = false;
            responsePage.response.status = 502;
            responsePage.response.statusText = `incomplete ${type} document download: ${contentSize} > ${bufferLength}\n`.toUpperCase();
            responsePage.response = new fetch.Response(responsePage.response.statusText, responsePage.response);
        }
    } else {
        responsePage.response.ok = false;
        responsePage.response.statusText = `either not pdf, or request did not succeed: ${responsePage.response.status} && ${type}\n`.toUpperCase();
        responsePage.response.status = 502;
        responsePage.response = new fetch.Response(responsePage.response.statusText, responsePage.response);
    }
    return responsePage;
};

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const match = canonicalURL.match(/\?proc=(\d+)&idCausa=(\d+)$/i);
    if (match) {
        let proc = parseInt(match[1]);
        let idCausa = parseInt(match[2]);
        return await fetchCausaPage({proc, idCausa, canonicalURL, headers});
    } else {
        return defaultFetchURL({canonicalURL, headers});
    }
}