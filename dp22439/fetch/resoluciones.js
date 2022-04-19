
async function fetchPage({canonicalURL, requestURL, requestOptions, headers}) {
    if (!requestOptions) requestOptions = {method: "GET", headers};
    if (!canonicalURL) canonicalURL = requestURL;
    if (!requestURL) requestURL = canonicalURL;
  	if (requestURL.match(/^https/i)) {
        requestOptions.agent = new https.Agent({rejectUnauthorized: false, keepAlive: true});
    }
    return await fetchWithCookies(requestURL, requestOptions, "no-proxy")
        .then(response => {
            return {
                canonicalURL,
                request: Object.assign({URL: requestURL}, requestOptions),
                response
            };
        });
}

const parseViewState = async function ({responsePage}) {
    let html = await responsePage.response.text();
  	responsePage.response = new fetch.Response(html, responsePage.response);
    const $ = cheerio.load(html, {xmlMode: true, decodeEntities: false});
    let view_state_obj = $("div.content div[class*='view-dom-id-']").attr();
  	let view_state_value = view_state_obj.class
    let view_state = /view-dom-id-(.*)\b/.exec(view_state_value)
    view_state = view_state && view_state[1]
    if (view_state) setSharedVariable('view-state', view_state);
  	return view_state
};

const changePagination = async function ({responsePage}) {
	let html = await responsePage.response.text();
    let $ = cheerio.load(html)
  	$(".item-list > ul.pager > li > a").each(function (i) {
        let a = $(this)
        let pagination = a.attr('href')
        let year = /year.*?=(\d{4})/.exec(pagination)
        year = year && year[1]
      	let page = /page=(\d+)/.exec(pagination)
        page = page && +page[1] + 1 || /\d+/.test(a.text()) && a.text()
        let newPagination = `https://www.bcb.gob.bo/?q=resoluciones-de-directorio&year=${year}&page=${page}`
        //let newPagination = pagination.replace(/page=(\d+)/, `page=${page}`)
        a.attr('href', newPagination)
    })
    responsePage.response = new fetch.Response($.html(), responsePage.response);
    return responsePage;
}

const getHtmlData = async function({year, page, responsePage}) {
	let json = await responsePage.response.json()
    const html = json.filter((obj) => 'data' in obj)[0].data
    const $ = cheerio.load(html)
  	responsePage.response = new fetch.Response($.html(), responsePage.response);
  	responsePage.response.headers.set('content-type', 'text/html')
  	await changePagination({responsePage})
    return responsePage;
}

const home = async function ({argument, canonicalURL, headers}) {
    let customHeaders = {
        "Cache-Control": "max-age=0",
        "DNT": "1",
        "Referer": "https://www.google.com/",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"100\", \"Google Chrome\";v=\"100\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = 'https://www.bcb.gob.bo/?q=resoluciones-de-directorio';
    let responsePage = await fetchPage({ canonicalURL, requestURL, requestOptions });
    await parseViewState({ responsePage });
    return responsePage;
};

const searchByYear = async function ({ year, canonicalURL, headers }) {
    await home({ headers });
    setSharedVariable('last-search', year);
    let customHeaders = {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "DNT": "1",
        "Origin": "https://www.bcb.gob.bo",
        "Referer": "https://www.bcb.gob.bo/?q=resoluciones-de-directorio",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "X-Requested-With": "XMLHttpRequest",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"100\", \"Google Chrome\";v=\"100\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    data["q"] = `resoluciones-de-directorio`;
    data["field_fecha_resolucion_value[value][year]"] = `${year}`;
    data["title"] = ``;
    data["field_body_value"] = ``;
    data["view_name"] = `resoluciones_de_directorio`;
    data["view_display_id"] = `page`;
    data["view_args"] = ``;
    data["view_path"] = `resoluciones-de-directorio`;
    data["view_base_path"] = `resoluciones-de-directorio`;
    data["view_dom_id"] = `${getSharedVariable('view-state')}`;
    data["pager_element"] = `0`;
    data["ajax_html_ids[]"] = `skip-link,header,top-menu,textos,btnBuscar,txtBuscar,block-tb-megamenu-main-menu,tb-megamenu-main-menu,,tb-megamenu-column-5,,tb-megamenu-column-2,tb-megamenu-column-1,,,,,,tb-megamenu-column-3,,,tb-megamenu-column-4,,,,tb-megamenu-column-12,,tb-megamenu-column-8,,,,,tb-megamenu-column-7,,,,tb-megamenu-column-6,,,,,tb-megamenu-column-9,,,,tb-megamenu-column-10,,,tb-megamenu-column-11,,tb-megamenu-column-15,,tb-megamenu-column-14,,,,tb-megamenu-column-13,,,,,,,,,,,,tb-megamenu-column-19,,tb-megamenu-column-17,,,,,,,,,,,tb-megamenu-column-16,,,,tb-megamenu-column-18,,tb-megamenu-column-20,block-block-36,,tb-megamenu-column-22,,const_pol_estado,tb-megamenu-column-21,,tb-megamenu-column-24,,tb-megamenu-column-23,,tb-megamenu-column-26,,tb-megamenu-column-25,,tb-megamenu-column-28,,tb-megamenu-column-27,,tb-megamenu-column-30,,tb-megamenu-column-29,,tb-megamenu-column-31,block-block-36--2,,tb-megamenu-column-43,,tb-megamenu-column-42,,,tb-megamenu-column-34,,tb-megamenu-column-33,,,tb-megamenu-column-32,,,,,,tb-megamenu-column-35,,,,tb-megamenu-column-36,,,,tb-megamenu-column-38,,,,tb-megamenu-column-37,,,,,,tb-megamenu-column-40,,tb-megamenu-column-39,,,,,,,tb-megamenu-column-41,,,,,,,,tb-megamenu-column-47,,tb-megamenu-column-44,,,tb-megamenu-column-45,,,,,tb-megamenu-column-46,,,,,,tb-megamenu-column-48,block-block-36--3,,tb-megamenu-column-50,,tb-megamenu-column-49,,tb-megamenu-column-53,,tb-megamenu-column-51,,,tb-megamenu-column-52,,,tb-megamenu-column-56,,tb-megamenu-column-54,,,tb-megamenu-column-55,,tb-megamenu-column-57,block-block-36--4,,tb-megamenu-column-59,,tb-megamenu-column-58,,tb-megamenu-column-61,,tb-megamenu-column-60,,tb-megamenu-column-63,,tb-megamenu-column-62,,tb-megamenu-column-64,block-block-36--5,,tb-megamenu-column-66,,tb-megamenu-column-65,,,tb-megamenu-column-69,,tb-megamenu-column-67,,,tb-megamenu-column-68,,tb-megamenu-column-72,,tb-megamenu-column-70,,,tb-megamenu-column-71,,tb-megamenu-column-74,,tb-megamenu-column-73,,tb-megamenu-column-75,block-block-36--6,,tb-megamenu-column-77,,tb-megamenu-column-76,,,,,tb-megamenu-column-81,,tb-megamenu-column-80,,tb-megamenu-column-78,,,,tb-megamenu-column-79,,,,,,,tb-megamenu-column-83,,tb-megamenu-column-82,,tb-megamenu-column-84,block-block-36--7,sidr,simple-menu,content,bcb-sidebar,bcb-content,main-content,tabs-wrapper,block-system-main,views-exposed-form-resoluciones-de-directorio-page,edit-field-fecha-resolucion-value-wrapper,edit-field-fecha-resolucion-value-value-wrapper,edit-field-fecha-resolucion-value-value-inside-wrapper,edit-field-fecha-resolucion-value-value,edit-field-fecha-resolucion-value-value-year,edit-title-wrapper,edit-title,edit-field-body-value-wrapper,edit-field-body-value,edit-submit-resoluciones-de-directorio,footer,ui-id-1,event-popup-container`;
    data["ajax_page_state[theme]"] = `bcb`;
    data["ajax_page_state[theme_token]"] = `BnIDbTrbhtMPLS33NNjV3_7e_Rx1EtIWDHG2OwYVHic`;
    data["ajax_page_state[css][0]"] = `1`;
    data["ajax_page_state[css][modules/system/system.base.css]"] = `1`;
    data["ajax_page_state[css][modules/system/system.menus.css]"] = `1`;
    data["ajax_page_state[css][modules/system/system.messages.css]"] = `1`;
    data["ajax_page_state[css][modules/system/system.theme.css]"] = `1`;
    data["ajax_page_state[css][misc/ui/jquery.ui.core.css]"] = `1`;
    data["ajax_page_state[css][misc/ui/jquery.ui.theme.css]"] = `1`;
    data["ajax_page_state[css][misc/ui/jquery.ui.button.css]"] = `1`;
    data["ajax_page_state[css][misc/ui/jquery.ui.resizable.css]"] = `1`;
    data["ajax_page_state[css][misc/ui/jquery.ui.dialog.css]"] = `1`;
    data["ajax_page_state[css][modules/comment/comment.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/date/date_api/date.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/date/date_popup/themes/datepicker.1.7.css]"] = `1`;
    data["ajax_page_state[css][modules/field/theme/field.css]"] = `1`;
    data["ajax_page_state[css][modules/node/node.css]"] = `1`;
    data["ajax_page_state[css][modules/poll/poll.css]"] = `1`;
    data["ajax_page_state[css][modules/search/search.css]"] = `1`;
    data["ajax_page_state[css][modules/user/user.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/calendar/css/calendar_multiday.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/views/css/views.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/ctools/css/ctools.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/event_calendar/event_popup/css/event_popup.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/panels/css/panels.css]"] = `1`;
    data["ajax_page_state[css][https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.4.0/css/font-awesome.min.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/tb_megamenu_/css/bootstrap.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/tb_megamenu_/css/base.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/tb_megamenu_/css/default.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/tb_megamenu_/css/compatibility.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/tb_megamenu_/css/styles/black.css]"] = `1`;
    data["ajax_page_state[css][sites/all/themes/bcb/css/vista.css]"] = `1`;
    data["ajax_page_state[css][sites/all/themes/bcb/style.css]"] = `1`;
    data["ajax_page_state[css][sites/all/themes/bcb/css/jquery.sidr.dark.css]"] = `1`;
    data["ajax_page_state[css][sites/all/themes/bcb/css/nivo-slider.css]"] = `1`;
    data["ajax_page_state[css][sites/all/themes/bcb/css/default.css]"] = `1`;
    data["ajax_page_state[js][0]"] = `1`;
    data["ajax_page_state[js][1]"] = `1`;
    data["ajax_page_state[js][2]"] = `1`;
    data["ajax_page_state[js][3]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/copyprevention/copyprevention.js]"] = `1`;
    data["ajax_page_state[js][sites/all/libraries/respondjs/respond.min.js]"] = `1`;
    data["ajax_page_state[js][//code.jquery.com/jquery-1.10.2.min.js]"] = `1`;
    data["ajax_page_state[js][misc/jquery-extend-3.4.0.js]"] = `1`;
    data["ajax_page_state[js][misc/jquery-html-prefilter-3.5.0-backport.js]"] = `1`;
    data["ajax_page_state[js][misc/jquery.once.js]"] = `1`;
    data["ajax_page_state[js][misc/drupal.js]"] = `1`;
    data["ajax_page_state[js][//code.jquery.com/ui/1.10.2/jquery-ui.min.js]"] = `1`;
    data["ajax_page_state[js][misc/ui/jquery.ui.position-1.13.0-backport.js]"] = `1`;
    data["ajax_page_state[js][misc/ui/jquery.ui.dialog-1.13.0-backport.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/jquery_update/replace/ui/external/jquery.cookie.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/jquery_update/replace/misc/jquery.form.min.js]"] = `1`;
    data["ajax_page_state[js][misc/ajax.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/jquery_update/js/jquery_update.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/admin_menu/admin_devel/admin_devel.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/imagezoomer/imagezoomer.js]"] = `1`;
    data["ajax_page_state[js][public://languages/es_Jfao3FGHaq_ND7hmR1rfH1hjmsd38ZYJKgqKKIadv40.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/event_calendar/event_popup/js/event_popup.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/event_calendar/event_popup/js/event_popup_validate.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/views/js/base.js]"] = `1`;
    data["ajax_page_state[js][misc/progress.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/views/js/ajax_view.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/tb_megamenu_/js/tb-megamenu-frontend.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/tb_megamenu_/js/tb-megamenu-touch.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/google_analytics/googleanalytics.js]"] = `1`;
    data["ajax_page_state[js][sites/all/themes/bcb/js/jquery.sidr.min.js]"] = `1`;
    data["ajax_page_state[js][sites/all/themes/bcb/js/jquery-ui-1.10.4.custom.js]"] = `1`;
    data["ajax_page_state[js][sites/all/themes/bcb/js/jquery.nivo.slider.pack.js]"] = `1`;
    data["ajax_page_state[js][sites/all/themes/bcb/js/main.js]"] = `1`;
    data["ajax_page_state[jquery_version]"] = `1.10`;
    let body = querystring.stringify(data);
    let method = "POST";
    let requestOptions = {method, body, headers: _headers};
    let requestURL = 'https://www.bcb.gob.bo/?q=views/ajax';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return await getHtmlData({ responsePage });
};

const pagination = async function ({ year, page, canonicalURL, headers }) {
    if (+page > 1) {
    	let yearLastSearched = getSharedVariable('last-search');
  		if(yearLastSearched!==year){
        	await searchByYear({page: 1, year, canonicalURL, headers});
        }
    }
    let customHeaders = {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "DNT": "1",
        "Origin": "https://www.bcb.gob.bo",
        "Referer": "https://www.bcb.gob.bo/?q=resoluciones-de-directorio",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "X-Requested-With": "XMLHttpRequest",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"100\", \"Google Chrome\";v=\"100\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    data["view_name"] = `resoluciones_de_directorio`;
    data["view_display_id"] = `page`;
    data["view_args"] = ``;
    data["view_path"] = `resoluciones-de-directorio`;
    data["view_base_path"] = `resoluciones-de-directorio`;
    data['view_dom_id'] = getSharedVariable('view-state');
    data["pager_element"] = `0`;
    data["field_fecha_resolucion_value[value][year]"] = `${year}`;
    data["page"] = `${+page - 1}`
    data["ajax_html_ids[]"] = `skip-link,header,top-menu,textos,btnBuscar,txtBuscar,block-tb-megamenu-main-menu,tb-megamenu-main-menu,,tb-megamenu-column-5,,tb-megamenu-column-2,tb-megamenu-column-1,,,,,,tb-megamenu-column-3,,,tb-megamenu-column-4,,,,tb-megamenu-column-12,,tb-megamenu-column-8,,,,,tb-megamenu-column-7,,,,tb-megamenu-column-6,,,,,tb-megamenu-column-9,,,,tb-megamenu-column-10,,,tb-megamenu-column-11,,tb-megamenu-column-15,,tb-megamenu-column-14,,,,tb-megamenu-column-13,,,,,,,,,,,,tb-megamenu-column-19,,tb-megamenu-column-17,,,,,,,,,,,tb-megamenu-column-16,,,,tb-megamenu-column-18,,tb-megamenu-column-20,block-block-36,,tb-megamenu-column-22,,const_pol_estado,tb-megamenu-column-21,,tb-megamenu-column-24,,tb-megamenu-column-23,,tb-megamenu-column-26,,tb-megamenu-column-25,,tb-megamenu-column-28,,tb-megamenu-column-27,,tb-megamenu-column-30,,tb-megamenu-column-29,,tb-megamenu-column-31,block-block-36--2,,tb-megamenu-column-43,,tb-megamenu-column-42,,,tb-megamenu-column-34,,tb-megamenu-column-33,,,tb-megamenu-column-32,,,,,,tb-megamenu-column-35,,,,tb-megamenu-column-36,,,,tb-megamenu-column-38,,,,tb-megamenu-column-37,,,,,,tb-megamenu-column-40,,tb-megamenu-column-39,,,,,,,tb-megamenu-column-41,,,,,,,,tb-megamenu-column-47,,tb-megamenu-column-44,,,tb-megamenu-column-45,,,,,tb-megamenu-column-46,,,,,,tb-megamenu-column-48,block-block-36--3,,tb-megamenu-column-50,,tb-megamenu-column-49,,tb-megamenu-column-53,,tb-megamenu-column-51,,,tb-megamenu-column-52,,,tb-megamenu-column-56,,tb-megamenu-column-54,,,tb-megamenu-column-55,,tb-megamenu-column-57,block-block-36--4,,tb-megamenu-column-59,,tb-megamenu-column-58,,tb-megamenu-column-61,,tb-megamenu-column-60,,tb-megamenu-column-63,,tb-megamenu-column-62,,tb-megamenu-column-64,block-block-36--5,,tb-megamenu-column-66,,tb-megamenu-column-65,,,tb-megamenu-column-69,,tb-megamenu-column-67,,,tb-megamenu-column-68,,tb-megamenu-column-72,,tb-megamenu-column-70,,,tb-megamenu-column-71,,tb-megamenu-column-74,,tb-megamenu-column-73,,tb-megamenu-column-75,block-block-36--6,,tb-megamenu-column-77,,tb-megamenu-column-76,,,,,tb-megamenu-column-81,,tb-megamenu-column-80,,tb-megamenu-column-78,,,,tb-megamenu-column-79,,,,,,,tb-megamenu-column-83,,tb-megamenu-column-82,,tb-megamenu-column-84,block-block-36--7,sidr,simple-menu,content,bcb-sidebar,bcb-content,main-content,tabs-wrapper,block-system-main,views-exposed-form-resoluciones-de-directorio-page,edit-field-fecha-resolucion-value-wrapper,edit-field-fecha-resolucion-value-value-wrapper,edit-field-fecha-resolucion-value-value-inside-wrapper,edit-field-fecha-resolucion-value-value,edit-field-fecha-resolucion-value-value-year,edit-title-wrapper,edit-title,edit-field-body-value-wrapper,edit-field-body-value,edit-submit-resoluciones-de-directorio,footer,ui-id-1,event-popup-container`;
    data["ajax_page_state[theme]"] = `bcb`;
    data["ajax_page_state[theme_token]"] = `TNZ1Oiyr-hVxA1PNbB6PP3ZV3BsjLvn1ACY-GPQbbWM`;
    data["ajax_page_state[css][0]"] = `1`;
    data["ajax_page_state[css][modules/system/system.base.css]"] = `1`;
    data["ajax_page_state[css][modules/system/system.menus.css]"] = `1`;
    data["ajax_page_state[css][modules/system/system.messages.css]"] = `1`;
    data["ajax_page_state[css][modules/system/system.theme.css]"] = `1`;
    data["ajax_page_state[css][misc/ui/jquery.ui.core.css]"] = `1`;
    data["ajax_page_state[css][misc/ui/jquery.ui.theme.css]"] = `1`;
    data["ajax_page_state[css][misc/ui/jquery.ui.button.css]"] = `1`;
    data["ajax_page_state[css][misc/ui/jquery.ui.resizable.css]"] = `1`;
    data["ajax_page_state[css][misc/ui/jquery.ui.dialog.css]"] = `1`;
    data["ajax_page_state[css][modules/comment/comment.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/date/date_api/date.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/date/date_popup/themes/datepicker.1.7.css]"] = `1`;
    data["ajax_page_state[css][modules/field/theme/field.css]"] = `1`;
    data["ajax_page_state[css][modules/node/node.css]"] = `1`;
    data["ajax_page_state[css][modules/poll/poll.css]"] = `1`;
    data["ajax_page_state[css][modules/search/search.css]"] = `1`;
    data["ajax_page_state[css][modules/user/user.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/calendar/css/calendar_multiday.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/views/css/views.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/ctools/css/ctools.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/event_calendar/event_popup/css/event_popup.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/panels/css/panels.css]"] = `1`;
    data["ajax_page_state[css][https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.4.0/css/font-awesome.min.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/tb_megamenu_/css/bootstrap.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/tb_megamenu_/css/base.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/tb_megamenu_/css/default.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/tb_megamenu_/css/compatibility.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/tb_megamenu_/css/styles/black.css]"] = `1`;
    data["ajax_page_state[css][sites/all/themes/bcb/css/vista.css]"] = `1`;
    data["ajax_page_state[css][sites/all/themes/bcb/style.css]"] = `1`;
    data["ajax_page_state[css][sites/all/themes/bcb/css/jquery.sidr.dark.css]"] = `1`;
    data["ajax_page_state[css][sites/all/themes/bcb/css/nivo-slider.css]"] = `1`;
    data["ajax_page_state[css][sites/all/themes/bcb/css/default.css]"] = `1`;
    data["ajax_page_state[js][0]"] = `1`;
    data["ajax_page_state[js][1]"] = `1`;
    data["ajax_page_state[js][2]"] = `1`;
    data["ajax_page_state[js][3]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/copyprevention/copyprevention.js]"] = `1`;
    data["ajax_page_state[js][sites/all/libraries/respondjs/respond.min.js]"] = `1`;
    data["ajax_page_state[js][//code.jquery.com/jquery-1.10.2.min.js]"] = `1`;
    data["ajax_page_state[js][misc/jquery-extend-3.4.0.js]"] = `1`;
    data["ajax_page_state[js][misc/jquery-html-prefilter-3.5.0-backport.js]"] = `1`;
    data["ajax_page_state[js][misc/jquery.once.js]"] = `1`;
    data["ajax_page_state[js][misc/drupal.js]"] = `1`;
    data["ajax_page_state[js][//code.jquery.com/ui/1.10.2/jquery-ui.min.js]"] = `1`;
    data["ajax_page_state[js][misc/ui/jquery.ui.position-1.13.0-backport.js]"] = `1`;
    data["ajax_page_state[js][misc/ui/jquery.ui.dialog-1.13.0-backport.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/jquery_update/replace/ui/external/jquery.cookie.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/jquery_update/replace/misc/jquery.form.min.js]"] = `1`;
    data["ajax_page_state[js][misc/ajax.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/jquery_update/js/jquery_update.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/admin_menu/admin_devel/admin_devel.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/imagezoomer/imagezoomer.js]"] = `1`;
    data["ajax_page_state[js][public://languages/es_Jfao3FGHaq_ND7hmR1rfH1hjmsd38ZYJKgqKKIadv40.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/event_calendar/event_popup/js/event_popup.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/event_calendar/event_popup/js/event_popup_validate.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/views/js/base.js]"] = `1`;
    data["ajax_page_state[js][misc/progress.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/views/js/ajax_view.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/tb_megamenu_/js/tb-megamenu-frontend.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/tb_megamenu_/js/tb-megamenu-touch.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/google_analytics/googleanalytics.js]"] = `1`;
    data["ajax_page_state[js][sites/all/themes/bcb/js/jquery.sidr.min.js]"] = `1`;
    data["ajax_page_state[js][sites/all/themes/bcb/js/jquery-ui-1.10.4.custom.js]"] = `1`;
    data["ajax_page_state[js][sites/all/themes/bcb/js/jquery.nivo.slider.pack.js]"] = `1`;
    data["ajax_page_state[js][sites/all/themes/bcb/js/main.js]"] = `1`;
    data["ajax_page_state[jquery_version]"] = `1.10`;
    let body = querystring.stringify(data);
    let method = "POST";
    let requestOptions = {method, body, headers: _headers};
    let requestURL = 'https://www.bcb.gob.bo/?q=views/ajax';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
    return await getHtmlData({ responsePage });
};

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const isSearch = canonicalURL.match(/\?q=resoluciones-de-directorio&year=(\d+)&page=1$/i);
  	const isPagination = canonicalURL.match(/\?q=resoluciones-de-directorio&year=(\d+)&page=(\d+)$/i);
    if (isSearch) {
        let year = parseInt(isSearch[1]);
        return [await searchByYear({year, canonicalURL, headers})]
      
    } else if (isPagination) {
    	let year = parseInt(isPagination[1]);
        let page = isPagination[2] ? parseInt(isPagination[2]) : 1;
        return [await pagination({year, page, canonicalURL, headers})]
      
    } else {
      	return [await fetchPage({canonicalURL, headers})]
        //return defaultFetchURL({canonicalURL, headers});
    }
}