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

const parseViewState = async function ({responsePage}) {
    let html = await responsePage.response.text();
  	responsePage.response = new fetch.Response(html, responsePage.response);
    const $ = cheerio.load(html, {xmlMode: true, decodeEntities: false});
    let classes = $("div.pane-content div[class*='view-dom-id-']").attr('class');
    let match = /view-dom-id-(.*)\b/.exec(classes)
    let view_dom_id = match && match[1]
    if (view_dom_id) setSharedVariable('view_dom_id', view_dom_id);
  	return view_dom_id
};

const parseThemeToken = async function ({responsePage}) {
    let html = await responsePage.response.text();
  	responsePage.response = new fetch.Response(html, responsePage.response);
    const $ = cheerio.load(html, {xmlMode: true, decodeEntities: false});
  	let match = /theme_token":"(.*?)"/.exec($.html())
    let theme_token = match && match[1]
    if (theme_token) setSharedVariable('theme_token', theme_token);
  	return theme_token
};

const home = async function ({argument, canonicalURL, headers}) {
    let customHeaders = {
        "authority": "www.bancoldex.com",
        "cache-control": "max-age=0",
        "dnt": "1",
        "if-none-match": "\"1652284694-0\"",
        "referer": "https://www.google.com/",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"101\", \"Google Chrome\";v=\"101\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "cross-site",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);   
    let method = "GET";
    let requestOptions = {method, headers: _headers};
    let requestURL = 'https://www.bancoldex.com/es/soluciones-financieras/lineas-de-credito';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  	await parseThemeToken({ responsePage });
  	await parseViewState({ responsePage });
    return responsePage;
};

const getHtmlDataFromJson = async function ({responsePage}) {
  	let json = await responsePage.response.json();
  	let html = json.filter(obj => Object.keys(obj).includes('data'))[0].data
    let $ = cheerio.load(html);
  	responsePage.response = new fetch.Response($.html(), responsePage.response);
  	responsePage.response.headers.set('content-type', 'text/html');
};

const changePagination = async function ({ responsePage, canonicalURL }) {
	let html = await responsePage.response.text();
    let $ = cheerio.load(html)
  	$(".item-list > ul.pager > li > a").each(function (i) {
        let a = $(this)
        let pagination = a.attr('href')
        let page = +pagination.split('page=').pop() + 1
        let newPagination = canonicalURL.replace(/&page=(\d+)/, `&page=${page}`);
        a.attr('href', newPagination)
    })
    responsePage.response = new fetch.Response($.html(), responsePage.response);
    return responsePage;
}

const searchByVigenteStatus = async function ({status, canonicalURL, headers}) {
  	await home({headers})
  	let field_tipo_circular_tid = status === 'true' ? `2666` : `2667`
    let customHeaders = {
        "authority": "www.bancoldex.com",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "dnt": "1",
        "origin": "https://www.bancoldex.com",
        "referer": "https://www.bancoldex.com/es/soluciones-financieras/lineas-de-credito",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"101\", \"Google Chrome\";v=\"101\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    data["title"] = ``;
    data["field_tipo_circular_tid"] = field_tipo_circular_tid;
    data["view_name"] = `lineas_de_credito`;
    data["view_display_id"] = `panel_linea_credito`;
    data["view_args"] = ``;
    data["view_path"] = `taxonomy/term/2500`;
    data["view_base_path"] = ``;
    data["view_dom_id"] = getSharedVariable('view_dom_id');
    data["pager_element"] = `0`;
    data["ajax_html_ids[]"] = `search-block-form,edit-search-block-form--2,edit-submit,main-content,contáctenos,Chat,Videollamada,categoria3,views-exposed-form-lineas-de-credito-panel-linea-credito,edit-title-wrapper,edit-title,edit-field-moneda-tid-wrapper,edit-field-moneda-tid-2913,edit-field-moneda-tid-2659,edit-field-moneda-tid-2658,edit-field-tipo-circular-tid-wrapper,edit-field-tipo-circular-tid,edit-field-modalidad-de-cr-dito-tid-wrapper,edit-field-modalidad-de-cr-dito-tid-2917,edit-field-modalidad-de-cr-dito-tid-2916,edit-field-tam-empresa-tid-wrapper,edit-field-tam-empresa-tid-2660,edit-field-tam-empresa-tid-2720,edit-field-tam-empresa-tid-2677,edit-field-tam-empresa-tid-2721,edit-field-destino-tid-wrapper,edit-field-destino-tid-2873,edit-field-destino-tid-2962,edit-field-destino-tid-2865,edit-field-destino-tid-2656,edit-field-destino-tid-2868,edit-field-destino-tid-2874,edit-field-sector-tid-wrapper,edit-field-sector-tid-2966,edit-field-sector-tid-2755,edit-field-sector-tid-2860,edit-field-sector-tid-2866,edit-field-sector-tid-2784,edit-field-sector-tid-2920,edit-field-sector-tid-2858,edit-field-sector-tid-2867,edit-field-sector-tid-2787,edit-field-sector-tid-2663,edit-field-sector-tid-2859,edit-field-sector-tid-2754,edit-field-sector-tid-2753,edit-field-sector-tid-2662,edit-field-sector-tid-2820,edit-field-sector-tid-2809,edit-field-sector-tid-2769,edit-field-sector-tid-2770,edit-field-regi-n-tid-wrapper,edit-field-regi-n-tid-2665,edit-field-regi-n-tid-2743,edit-field-regi-n-tid-2746,edit-field-regi-n-tid-2745,edit-field-regi-n-tid-2814,edit-field-regi-n-tid-2981,edit-field-regi-n-tid-2744,edit-field-regi-n-tid-2977,edit-field-regi-n-tid-2986,edit-field-regi-n-tid-2828,edit-field-regi-n-tid-2861,edit-field-regi-n-tid-2818,edit-field-regi-n-tid-2984,edit-field-regi-n-tid-2824,edit-field-regi-n-tid-2817,edit-field-regi-n-tid-2742,edit-field-regi-n-tid-2980,edit-field-regi-n-tid-2979,edit-field-regi-n-tid-2747,edit-field-regi-n-tid-2816,edit-field-regi-n-tid-2752,edit-field-regi-n-tid-2975,edit-field-regi-n-tid-2810,edit-field-regi-n-tid-2751,edit-field-regi-n-tid-2819,edit-field-regi-n-tid-2976,edit-field-regi-n-tid-2823,edit-field-regi-n-tid-2750,edit-field-regi-n-tid-2822,edit-field-regi-n-tid-2749,edit-field-regi-n-tid-2664,edit-field-regi-n-tid-2748,edit-field-regi-n-tid-2741,edit-field-regi-n-tid-2982,edit-field-regi-n-tid-2722,edit-field-regi-n-tid-2726,edit-field-regi-n-tid-2844,edit-field-regi-n-tid-2728,edit-field-regi-n-tid-2870,edit-field-regi-n-tid-2727,edit-field-regi-n-tid-2971,edit-field-regi-n-tid-2805,edit-field-regi-n-tid-2725,edit-field-regi-n-tid-2730,edit-field-regi-n-tid-2790,edit-field-regi-n-tid-2792,edit-field-regi-n-tid-2955,edit-field-regi-n-tid-2724,edit-field-regi-n-tid-2983,edit-field-regi-n-tid-2973,edit-field-regi-n-tid-2723,edit-field-regi-n-tid-2729,edit-field-regi-n-tid-2731,edit-field-regi-n-tid-2985,edit-field-regi-n-tid-2978,edit-field-regi-n-tid-2740,edit-field-regi-n-tid-2834,edit-field-regi-n-tid-2801,edit-field-regi-n-tid-2739,edit-field-regi-n-tid-2972,edit-field-regi-n-tid-2738,edit-field-regi-n-tid-2872,edit-field-regi-n-tid-2833,edit-field-regi-n-tid-2732,edit-field-regi-n-tid-2737,edit-field-regi-n-tid-2736,edit-field-regi-n-tid-2735,edit-field-regi-n-tid-2974,edit-field-regi-n-tid-2734,edit-field-regi-n-tid-2791,edit-field-regi-n-tid-2733,edit-submit-lineas-de-credito,edit-reset,filter-content,edit-reset-conten,title-block--interesting,live-chat,chat-button,btn_open_chat,btn_open_chat_img,chat-container,header-chat,bot-avatar-picture,icon-chat-close,chat-body,chat-input,div-chat-input,msgBox_input,btn-button-send,upload_file_user,btn-button-file,connection_ready,cboxOverlay,colorbox,cboxWrapper,cboxTopLeft,cboxTopCenter,cboxTopRight,cboxMiddleLeft,cboxContent,cboxTitle,cboxCurrent,cboxPrevious,cboxNext,cboxSlideshow,cboxLoadingOverlay,cboxLoadingGraphic,cboxMiddleRight,cboxBottomLeft,cboxBottomCenter,cboxBottomRight,goog-gt-tt,rd_tmgr`;
    data["ajax_page_state[theme]"] = `bancoldex_theme`;
    data["ajax_page_state[theme_token]"] = getSharedVariable('theme_token');
    data["ajax_page_state[css][modules/system/system.base.css]"] = `1`;
    data["ajax_page_state[css][modules/system/system.messages.css]"] = `1`;
    data["ajax_page_state[css][modules/system/system.theme.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/modules/contrib/simplenews/simplenews.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/modules/contrib/calendar/css/calendar_multiday.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/modules/contrib/date/date_api/date.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/modules/contrib/date/date_popup/themes/datepicker.1.7.css]"] = `1`;
    data["ajax_page_state[css][modules/field/theme/field.css]"] = `1`;
    data["ajax_page_state[css][modules/node/node.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/modules/contrib/picture/picture_wysiwyg.css]"] = `1`;
    data["ajax_page_state[css][modules/search/search.css]"] = `1`;
    data["ajax_page_state[css][modules/user/user.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/modules/contrib/views/css/views.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/modules/contrib/ckeditor/css/ckeditor.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/colorbox/styles/default/colorbox_style.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/modules/contrib/ctools/css/ctools.css]"] = `1`;
    data["ajax_page_state[css][public://css/menu_icons.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/modules/contrib/panels/css/panels.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/video/css/video.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/modules/contrib/social_media_links/social_media_links.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/themes/custom/bancoldex_theme/css/normalize.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/themes/custom/bancoldex_theme/css/foundation.min.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/themes/custom/bancoldex_theme/css/line_credit.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/themes/custom/bancoldex_theme/css/financial_content.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/themes/custom/bancoldex_theme/css/bancoldex_theme.css]"] = `1`;
    data["ajax_page_state[js][0]"] = `1`;
    data["ajax_page_state[js][1]"] = `1`;
    data["ajax_page_state[js][2]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/modules/contrib/picture/picturefill2/picturefill.min.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/modules/contrib/picture/picture.min.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/modules/custom/bancoldex_core/js/credito-de-redescuento.js]"] = `1`;
    data["ajax_page_state[js][//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js]"] = `1`;
    data["ajax_page_state[js][misc/jquery-extend-3.4.0.js]"] = `1`;
    data["ajax_page_state[js][misc/jquery-html-prefilter-3.5.0-backport.js]"] = `1`;
    data["ajax_page_state[js][misc/jquery.once.js]"] = `1`;
    data["ajax_page_state[js][misc/drupal.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/jquery_update/replace/ui/external/jquery.cookie.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/jquery_update/replace/misc/jquery.form.min.js]"] = `1`;
    data["ajax_page_state[js][misc/ajax.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/jquery_update/js/jquery_update.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/webform_steps/webform_steps.js]"] = `1`;
    data["ajax_page_state[js][public://languages/es_-eXnPP47Oyvbi1oAhFsUv_cr37eImR5ADvdUWhEydrk.js]"] = `1`;
    data["ajax_page_state[js][sites/all/libraries/colorbox/jquery.colorbox-min.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/colorbox/js/colorbox.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/colorbox/styles/default/colorbox_style.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/video/js/video.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/modules/contrib/better_exposed_filters/better_exposed_filters.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/modules/contrib/ctools/js/auto-submit.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/modules/contrib/field_group/field_group.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/modules/contrib/views/js/base.js]"] = `1`;
    data["ajax_page_state[js][misc/progress.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/modules/contrib/views/js/ajax_view.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/modules/contrib/google_analytics/googleanalytics.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/modules/custom/custom_text_resize/custom_text_resize.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/themes/contrib/zurb_foundation/js/vendor/modernizr.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/themes/custom/bancoldex_theme/js/foundation.min.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/themes/custom/bancoldex_theme/js/libs.min.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/themes/custom/bancoldex_theme/js/app.min.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/themes/custom/bancoldex_theme/js/bancoldex_theme.js]"] = `1`;
    data["ajax_page_state[jquery_version]"] = `1.8`;
    let body = querystring.stringify(data);
    let method = "POST";
    let requestOptions = {method, body, headers: _headers};
    let requestURL = 'https://www.bancoldex.com/es/views/ajax';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  	await getHtmlDataFromJson({responsePage})
  	await changePagination({responsePage, canonicalURL})
    return responsePage;
};

const pagination = async function ({status, page, canonicalURL, headers}) {
  	let field_tipo_circular_tid = status === 'true' ? `2666` : `2667` 	
  	if (+page === 1) {
        await searchByVigenteStatus({canonicalURL, headers}); 
    }
    let customHeaders = {
        "authority": "www.bancoldex.com",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "dnt": "1",
        "origin": "https://www.bancoldex.com",
        "referer": "https://www.bancoldex.com/es/soluciones-financieras/lineas-de-credito",
        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"101\", \"Google Chrome\";v=\"101\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        "Accept-Encoding": "gzip, deflate, br"
    };
    let _headers = Object.assign(customHeaders, headers);
    const data = {};
    data["page"] = `${parseInt(page) - 1}`; // parseInt(page) - 1
    data["view_name"] = `lineas_de_credito`;
    data["view_display_id"] = `panel_linea_credito`;
    data["view_args"] = ``;
    data["view_path"] = `taxonomy/term/2500`;
    data["view_base_path"] = ``;
    data["view_dom_id"] = getSharedVariable('view_dom_id');
    data["pager_element"] = `0`;
    data["field_tipo_circular_tid"] = field_tipo_circular_tid;
    data["ajax_html_ids[]"] = `search-block-form,edit-search-block-form--2,edit-submit,main-content,contáctenos,Chat,Videollamada,categoria3,views-exposed-form-lineas-de-credito-panel-linea-credito,edit-title-wrapper,edit-title,edit-field-moneda-tid-wrapper,edit-field-moneda-tid-2913,edit-field-moneda-tid-2659,edit-field-moneda-tid-2658,edit-field-tipo-circular-tid-wrapper,edit-field-tipo-circular-tid,edit-field-modalidad-de-cr-dito-tid-wrapper,edit-field-modalidad-de-cr-dito-tid-2917,edit-field-modalidad-de-cr-dito-tid-2916,edit-field-tam-empresa-tid-wrapper,edit-field-tam-empresa-tid-2660,edit-field-tam-empresa-tid-2720,edit-field-tam-empresa-tid-2677,edit-field-tam-empresa-tid-2721,edit-field-destino-tid-wrapper,edit-field-destino-tid-2873,edit-field-destino-tid-2962,edit-field-destino-tid-2865,edit-field-destino-tid-2656,edit-field-destino-tid-2868,edit-field-destino-tid-2874,edit-field-sector-tid-wrapper,edit-field-sector-tid-2966,edit-field-sector-tid-2755,edit-field-sector-tid-2860,edit-field-sector-tid-2866,edit-field-sector-tid-2784,edit-field-sector-tid-2920,edit-field-sector-tid-2858,edit-field-sector-tid-2867,edit-field-sector-tid-2787,edit-field-sector-tid-2663,edit-field-sector-tid-2859,edit-field-sector-tid-2754,edit-field-sector-tid-2753,edit-field-sector-tid-2662,edit-field-sector-tid-2820,edit-field-sector-tid-2809,edit-field-sector-tid-2769,edit-field-sector-tid-2770,edit-field-regi-n-tid-wrapper,edit-field-regi-n-tid-2665,edit-field-regi-n-tid-2743,edit-field-regi-n-tid-2746,edit-field-regi-n-tid-2745,edit-field-regi-n-tid-2814,edit-field-regi-n-tid-2981,edit-field-regi-n-tid-2744,edit-field-regi-n-tid-2977,edit-field-regi-n-tid-2986,edit-field-regi-n-tid-2828,edit-field-regi-n-tid-2861,edit-field-regi-n-tid-2818,edit-field-regi-n-tid-2984,edit-field-regi-n-tid-2824,edit-field-regi-n-tid-2817,edit-field-regi-n-tid-2742,edit-field-regi-n-tid-2980,edit-field-regi-n-tid-2979,edit-field-regi-n-tid-2747,edit-field-regi-n-tid-2816,edit-field-regi-n-tid-2752,edit-field-regi-n-tid-2975,edit-field-regi-n-tid-2810,edit-field-regi-n-tid-2751,edit-field-regi-n-tid-2819,edit-field-regi-n-tid-2976,edit-field-regi-n-tid-2823,edit-field-regi-n-tid-2750,edit-field-regi-n-tid-2822,edit-field-regi-n-tid-2749,edit-field-regi-n-tid-2664,edit-field-regi-n-tid-2748,edit-field-regi-n-tid-2741,edit-field-regi-n-tid-2982,edit-field-regi-n-tid-2722,edit-field-regi-n-tid-2726,edit-field-regi-n-tid-2844,edit-field-regi-n-tid-2728,edit-field-regi-n-tid-2870,edit-field-regi-n-tid-2727,edit-field-regi-n-tid-2971,edit-field-regi-n-tid-2805,edit-field-regi-n-tid-2725,edit-field-regi-n-tid-2730,edit-field-regi-n-tid-2790,edit-field-regi-n-tid-2792,edit-field-regi-n-tid-2955,edit-field-regi-n-tid-2724,edit-field-regi-n-tid-2983,edit-field-regi-n-tid-2973,edit-field-regi-n-tid-2723,edit-field-regi-n-tid-2729,edit-field-regi-n-tid-2731,edit-field-regi-n-tid-2985,edit-field-regi-n-tid-2978,edit-field-regi-n-tid-2740,edit-field-regi-n-tid-2834,edit-field-regi-n-tid-2801,edit-field-regi-n-tid-2739,edit-field-regi-n-tid-2972,edit-field-regi-n-tid-2738,edit-field-regi-n-tid-2872,edit-field-regi-n-tid-2833,edit-field-regi-n-tid-2732,edit-field-regi-n-tid-2737,edit-field-regi-n-tid-2736,edit-field-regi-n-tid-2735,edit-field-regi-n-tid-2974,edit-field-regi-n-tid-2734,edit-field-regi-n-tid-2791,edit-field-regi-n-tid-2733,edit-submit-lineas-de-credito,edit-reset,filter-content,edit-reset-conten,title-block--interesting,live-chat,chat-button,btn_open_chat,btn_open_chat_img,chat-container,header-chat,bot-avatar-picture,icon-chat-close,chat-body,chat-input,div-chat-input,msgBox_input,btn-button-send,upload_file_user,btn-button-file,connection_ready,cboxOverlay,colorbox,cboxWrapper,cboxTopLeft,cboxTopCenter,cboxTopRight,cboxMiddleLeft,cboxContent,cboxTitle,cboxCurrent,cboxPrevious,cboxNext,cboxSlideshow,cboxLoadingOverlay,cboxLoadingGraphic,cboxMiddleRight,cboxBottomLeft,cboxBottomCenter,cboxBottomRight,goog-gt-tt,rd_tmgr`;
    data["ajax_page_state[theme]"] = `bancoldex_theme`;
    data["ajax_page_state[theme_token]"] = getSharedVariable('theme_token');
    data["ajax_page_state[css][modules/system/system.base.css]"] = `1`;
    data["ajax_page_state[css][modules/system/system.messages.css]"] = `1`;
    data["ajax_page_state[css][modules/system/system.theme.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/modules/contrib/simplenews/simplenews.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/modules/contrib/calendar/css/calendar_multiday.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/modules/contrib/date/date_api/date.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/modules/contrib/date/date_popup/themes/datepicker.1.7.css]"] = `1`;
    data["ajax_page_state[css][modules/field/theme/field.css]"] = `1`;
    data["ajax_page_state[css][modules/node/node.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/modules/contrib/picture/picture_wysiwyg.css]"] = `1`;
    data["ajax_page_state[css][modules/search/search.css]"] = `1`;
    data["ajax_page_state[css][modules/user/user.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/modules/contrib/views/css/views.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/modules/contrib/ckeditor/css/ckeditor.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/colorbox/styles/default/colorbox_style.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/modules/contrib/ctools/css/ctools.css]"] = `1`;
    data["ajax_page_state[css][public://css/menu_icons.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/modules/contrib/panels/css/panels.css]"] = `1`;
    data["ajax_page_state[css][sites/all/modules/video/css/video.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/modules/contrib/social_media_links/social_media_links.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/themes/custom/bancoldex_theme/css/normalize.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/themes/custom/bancoldex_theme/css/foundation.min.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/themes/custom/bancoldex_theme/css/line_credit.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/themes/custom/bancoldex_theme/css/financial_content.css]"] = `1`;
    data["ajax_page_state[css][profiles/bancoldex_profile/themes/custom/bancoldex_theme/css/bancoldex_theme.css]"] = `1`;
    data["ajax_page_state[js][0]"] = `1`;
    data["ajax_page_state[js][1]"] = `1`;
    data["ajax_page_state[js][2]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/modules/contrib/picture/picturefill2/picturefill.min.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/modules/contrib/picture/picture.min.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/modules/custom/bancoldex_core/js/credito-de-redescuento.js]"] = `1`;
    data["ajax_page_state[js][//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js]"] = `1`;
    data["ajax_page_state[js][misc/jquery-extend-3.4.0.js]"] = `1`;
    data["ajax_page_state[js][misc/jquery-html-prefilter-3.5.0-backport.js]"] = `1`;
    data["ajax_page_state[js][misc/jquery.once.js]"] = `1`;
    data["ajax_page_state[js][misc/drupal.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/jquery_update/replace/ui/external/jquery.cookie.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/jquery_update/replace/misc/jquery.form.min.js]"] = `1`;
    data["ajax_page_state[js][misc/ajax.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/jquery_update/js/jquery_update.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/webform_steps/webform_steps.js]"] = `1`;
    data["ajax_page_state[js][public://languages/es_-eXnPP47Oyvbi1oAhFsUv_cr37eImR5ADvdUWhEydrk.js]"] = `1`;
    data["ajax_page_state[js][sites/all/libraries/colorbox/jquery.colorbox-min.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/colorbox/js/colorbox.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/colorbox/styles/default/colorbox_style.js]"] = `1`;
    data["ajax_page_state[js][sites/all/modules/video/js/video.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/modules/contrib/better_exposed_filters/better_exposed_filters.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/modules/contrib/ctools/js/auto-submit.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/modules/contrib/field_group/field_group.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/modules/contrib/views/js/base.js]"] = `1`;
    data["ajax_page_state[js][misc/progress.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/modules/contrib/views/js/ajax_view.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/modules/contrib/google_analytics/googleanalytics.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/modules/custom/custom_text_resize/custom_text_resize.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/themes/contrib/zurb_foundation/js/vendor/modernizr.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/themes/custom/bancoldex_theme/js/foundation.min.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/themes/custom/bancoldex_theme/js/libs.min.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/themes/custom/bancoldex_theme/js/app.min.js]"] = `1`;
    data["ajax_page_state[js][profiles/bancoldex_profile/themes/custom/bancoldex_theme/js/bancoldex_theme.js]"] = `1`;
    data["ajax_page_state[jquery_version]"] = `1.8`;
    let body = querystring.stringify(data);
    let method = "POST";
    let requestOptions = {method, body, headers: _headers};
    let requestURL = 'https://www.bancoldex.com/es/views/ajax';
    let responsePage = await fetchPage({canonicalURL, requestURL, requestOptions});
  	await parseThemeToken({ responsePage });
  	await parseViewState({ responsePage });
  	await getHtmlDataFromJson({responsePage})
  	await changePagination({responsePage, canonicalURL})
    return responsePage;
};

async function fetchURL({canonicalURL, headers}) {
    if (/https?:.*https?:/i.test(canonicalURL)) {
        console.error("Rejecting URL", canonicalURL, `returning [];`);
        return [];
    }
    const isSearch = canonicalURL.match(/\?vigente=(true|false)&page=1$/i);
  	const isPagination = canonicalURL.match(/\?vigente=(true|false)&page=(\d+)$/i);
    if (isSearch) {
        let status = isSearch[1];
        return [await searchByVigenteStatus({status, canonicalURL, headers})]
      
    } else if (isPagination) {
    	let status = isPagination[1];
        let page = isPagination[2] ? parseInt(isPagination[2]) : 1;
        return [await pagination({status, page, canonicalURL, headers})]
      
    } else {
      	return [await fetchPage({canonicalURL, headers})]
        //return defaultFetchURL({canonicalURL, headers});
    }
}