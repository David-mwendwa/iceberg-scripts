function parsePage({responseBody, URL}) {
    let json = JSON.parse(responseBody.content);
    const results = [];
  
  	// mother
    let doc = { URI: [URL], isMother: true };
    let general = json.data.general;
    doc.proyectoLey = general.proyectoLey;
    doc.periodoParlamentario = general.desPerParAbrev;
    doc.legislatura = general.desLegis;
  	doc.fechaDePresentación_original = general.fecPresentacion;
    doc.fechaDePresentación = formatDate(general.fecPresentacion);
  	doc.titulo = `${general.proyectoLey}, ${general.titulo}`;
    doc.sumilla = general.sumilla.length ? general.sumilla : null;
    doc.observaciones = general.observaciones.length ? general.observaciones : null;
    doc.grupoParlamentario = general.desGpar.length ? general.desGpar : null

    doc.comisiones = json.data.comisiones.length && json.data.comisiones[0].nombre;

    let seguimientos = json.data.seguimientos;
    doc.ultimoEstado = seguimientos.length && seguimientos[0].desEstado;

    let firmantes = json.data.firmantes;
  	let autorPrincipal = firmantes.map(item => item.nombre).filter((_, i) => i === 0)
    doc.autorPrincipal = autorPrincipal.length ? autorPrincipal : null
  	let coautores = firmantes.map((item) => item.nombre).filter((_, i) => i !== 0);
	doc.coautores = coautores.length ? coautores : null
    doc.adherentes = null//firmantes && firmantes.length && firmantes[2] && firmantes[2].nombre || null

    // Seguimiento events
    let events = json.data.seguimientos;
  	let children = []
    for (let i = 0; i < events.length; i++) {
      let child = { URI: [], parentURI: [URL] };
      let inversedEvent = events[events.length - (i + 1)];
      let { fecha, desEstado, desComisiones, detalle, archivos } = inversedEvent;
      let uuid = archivos && archivos.length && archivos[0] && archivos[0].uuid;
      let nombreArchivo = archivos && archivos.length && archivos[0] && archivos[0].nombreArchivo;
      let href = uuid && nombreArchivo && `https://wb2server.congreso.gob.pe/spley-portal-service/archivo/uuid/${uuid}/${nombreArchivo}`;
      child.URI.push(href)
      child.fecha = formatDate(fecha);
      child.titulo = desEstado;
      child.comisión = desComisiones && desComisiones || null;
      child.detalle = detalle && detalle || null;
      child.class = /Presentado/i.test(desEstado) ? 'initial bill' : null;
      //child.sortValue = i + 1
      //child.inverseSortValue = events.length - i;
      href && children.push(child);
      href && results.push(child);
    }
  	
  	children.length && results.push(doc)
  
  	// Proyectos Acumulados
    json.data.acumulados.forEach((obj) => {
      let doc = { URI: [] };
      let { proyectoLey, titulo, perParId, pleyNum } = obj;
      doc.titulo = `${proyectoLey}, ${titulo}`;
      let href = `https://wb2server.congreso.gob.pe/spley-portal-service/expediente/${perParId}/${pleyNum}`;
      doc.URI.push(href);
      results.push(doc);
    });
    
    return results;
}

function formatDate(date) {
  let d = date && moment(date.replace(/\sdel?/g, ''), ['DD MMMM YYYY', 'DD/MM/YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD'], 'es');
  return d && d.isValid ? d.format('YYYY-MM-DD') : null;
}
const sentenceCase = (input) => {
  input = input === undefined ? null : input;
  return (
    input && input.toString().toLowerCase().replace(/(^|[.?!] *)([a-z])/g,
        (match, separator, char) => separator + char.toUpperCase()
      )
  );
};