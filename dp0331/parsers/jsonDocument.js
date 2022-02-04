function parsePage({responseBody, URL}) {
    let json = JSON.parse(responseBody.content);
    const doc = {URI: [URL]};
    doc.external_cause_id = json.cause_id;
    let cause = json.objects.causes[doc.external_cause_id];
    doc.court = json.objects.courts[cause.court_id].name;
    doc.tipo_de_causa = json.objects.cause_roles[cause.cause_role_id].name;
    doc.relator = cause.teller_id && json.objects.tellers && json.objects.entities[json.objects.tellers[cause.teller_id].entity_id].name;
    doc.redactor = cause.minister_id && json.objects.ministers && json.objects.entities[json.objects.ministers[cause.minister_id].entity_id].name;
    let ingreso = null;
    for (let r in json.objects.documents) {
        let documento = json.objects.documents[r];
        let d = moment(documento.issue_date);
        d.isValid() && !ingreso && (ingreso = d);
        d.isValid() && ingreso && d.isBefore(ingreso) && (ingreso = d);
    }
    doc.fecha_de_ingreso = ingreso && ingreso.format("YYYY-MM-DD") || null;
    doc.document_status = "Terminada";//hardcorded from search
    doc.foliated_attachments = [];
    doc.pdf_attachments = [];
    let docs = json && json.objects && json.objects.documents;
    let attachments = json && json.objects && json.objects.attachments;
    let foliated_attachments = json && json.objects && json.objects.foliated_attachments;
    const searchForliated = function (attachment_id) {
        let foliated = [];
        for (let x in foliated_attachments) {
            let fa = foliated_attachments[x];
            if (fa.attachment_id === attachment_id)
                foliated.push(fa);
        }
        return foliated;
    };
    let real_urls = [];
    doc.sentencia_date = null;
    for (let id in docs) {
        let d = docs[id];
        if (/Sentencia/i.test(d.nature)) {
            let attachment = attachments[d.attachment_id];
            let dd = moment(d.issue_date);
            doc.sentencia_date = dd.isValid()?dd.format("YYYY-MM-DD"):null;
            doc.foliated_attachments = doc.foliated_attachments.concat(searchForliated(d.attachment_id)).map(a => {
                return a && a.content && a.content.url;
            }).filter(x => x);
            [attachment].forEach(a => {
                a && a.content && a.content.url && doc.pdf_attachments.push(a.content.url);
            });
            real_urls.push(`https://causas.1ta.cl/causes/${json.cause_id}/expedient/${d.id}/?attachmentId=${d.attachment_id}`);
        }
    }
    if (doc.foliated_attachments.length) {
        doc.foliated_attachments.forEach(u => u && doc.URI.push(u));
    } else if (doc.pdf_attachments.length) {
        doc.pdf_attachments.forEach(u => u && doc.URI.push(u));
    }
    doc.real_urls = real_urls;
    doc.rol_number = "R-"+cause.role_number+"-"+ingreso.format("YYYY");
  	doc.document_type = "Sentencia";
    return [doc];
}