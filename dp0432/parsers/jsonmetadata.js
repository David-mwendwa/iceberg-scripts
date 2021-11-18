async function parsePage({responseBody, URL, html, referer}) {
  	let match = /\?year=(.+)&caseRecordId=(.+)&proceedingType=(.+)/i.exec(URL)
    const results = [];
    let {
      year, recordId, processType,
      caseTitle,
      issueDate, 
      settingDownDate, 
      appealCourtReference, 
      supremeCourtAppealDate, 
      supremeCourtReference,
      plaintiff,
      plaintiffSolicitor,
      defendant,
      defendantSolicitor,
      filingsList,
      orderDetails,
      relevantCourtLists,
      judgmentDetailsList
    } = JSON.parse(responseBody.content);
  	let proceedings = proceedingTypes[processType]
  	let title = caseTitle;
  	let recordNo = match && match[2] || recordId
  	let docketNumber = `${year}/${recordId} ${processType}`
    let docketURL = `http://vlex.com/ireland-dockets/${docketNumber}`
    let {legalEntityForename, legalEntitySurname} = plaintiff[0]  
    let oldParsedFrom = `http://highcourtsearch.courts.ie/hcslive/case_detail.show?yearNo=${year}&recordNo=${recordNo}&processType=${processType}`
    let oldParsedFromP = `http://highcourtsearch.courts.ie/hcslive/plaintiff_detail.show?yearNo=${year}&recordNo=${recordNo}&processType=${processType}`
    let oldParsedFromD = `http://highcourtsearch.courts.ie/hcslive/defendant_detail.show?yearNo=${year}&recordNo=${recordNo}&processType=${processType}`
    results.push({
      URI:[docketURL, oldParsedFrom, oldParsedFromP, oldParsedFromD], 
      isDocket: true, year, proceedings, title, docketNumber, issueDate,
      settingDownDate, appealCourtReference, supremeCourtAppealDate, supremeCourtReference
    })
  
  	// Plaintiff
  	let plaintiffName = []
    let plaintiffSolicitorFirm = []
  	plaintiff.length && plaintiff.forEach((obj, i) => {    	
    	let name = `${obj.legalEntityForename || ''} ${obj.legalEntitySurname || ''}`.trim()
        let solicitorFirm = obj.solicitorFirm
        plaintiffName.push(name)
      	plaintiffSolicitorFirm.push(solicitorFirm)
    }) 	
    results.push({URL: [oldParsedFrom, oldParsedFromP], plaintiffName, plaintiffSolicitorFirm})
    
  	// Defendant
  	let defendantName = []
    let defendantSolicitorFirm = []
  	defendant.length && defendant.forEach((obj, i) => {    	
    	let name = `${obj.legalEntityForename || ''} ${obj.legalEntitySurname || ''}`.trim()
        let solicitorFirm = obj.solicitorFirm
        defendantName.push(name)
      	defendantSolicitorFirm.push(solicitorFirm)
    }) 	
    results.push({URL: [oldParsedFrom, oldParsedFromD], defendantName, defendantSolicitorFirm})
  
  	// Filling
  	filingsList.length && filingsList.forEach((obj, i, a) => {
    	let Date = obj.filingDate
        let Title = obj.Affidavits
        let position = i+1
        let reversedPosition = a.length - i
        let Type = 'Filings'
        let urlDate = moment(Date, 'YYYY-MM-DD')
        urlDate = urlDate.isValid ? urlDate.format('DD/MM/YYYY') : null
      	let oldURL = `http://vlex.com/ireland-dockets/${docketNumber}/Filings/${urlDate}/${reversedPosition}`       
        let url = `http://vlex.com/ireland-dockets/${docketNumber}/Filings/${position}`    
        let oldParsedFrom = `http://highcourtsearch.courts.ie/hcslive/case_filing.show?yearNo=${year}&recordNo=${recordNo}&processType=${processType}`
        results.push({URI:[oldURL,oldParsedFrom], parentURL: docketURL, Type, tablePosition: position, reversedPosition, Date, Title})
    })
  
  	//Order details
  	orderDetails.length && orderDetails.forEach((obj, i, a) => {
    	let {orderDate, orderResult, perfectedDate, registrar} = obj
        let Date = orderDate
        let Title = orderResult
        let Perfected = perfectedDate
        let tablePosition = i+1
        let reversedPosition = a.length - i
        let Type = 'Order'
        let urlDate = moment(Date, 'YYYY-MM-DD')
        urlDate = urlDate.isValid ? urlDate.format('DD/MM/YYYY') : null
      	let oldURL = `http://vlex.com/ireland-dockets/${docketNumber}/Order/${urlDate}/${reversedPosition}`
        let url = `http://vlex.com/ireland-dockets/${docketNumber}/Order/${tablePosition}`
        let oldParsedFrom = `http://highcourtsearch.courts.ie/hcslive/order_detail.show?yearNo=${year}&recordNo=${recordNo}&processType=${processType}`
        results.push({URI:[oldURL, oldParsedFrom], parentURL: docketURL, Date, Title, Perfected, tablePosition, reversedPosition, Type, Registrar:registrar})
    })
  
  	// Judgement
  	judgmentDetailsList.length && judgmentDetailsList.forEach((obj, i, a) => {
    	let {judge, deliveredDate, distributedDate} = obj
        let Title = judge
        let Delivered = deliveredDate;
      	let Distributed = distributedDate
        let position = i+1
        let reversedPosition = a.length - i
        let Type = 'Judgement'
        let urlDate = moment(Delivered, 'YYYY-MM-DD')
        urlDate = urlDate.isValid ? urlDate.format('DD/MM/YYYY') : null
      	let oldURL = `http://vlex.com/ireland-dockets/${docketNumber}/Judgment/${urlDate}/${reversedPosition}`
        let url = `http://vlex.com/ireland-dockets/${docketNumber}/Judgment/${position}`
        let oldParsedFrom = `http://highcourtsearch.courts.ie/hcslive/judgment_detail.show?yearNo=${year}&recordNo=${recordNo}&processType=${processType}`
        results.push({URI:[oldURL, oldParsedFrom], parentURL: docketURL, judge, Delivered, Distributed, tablePosition: position, reversedPosition, Type, Title})
    })
  
  	//Listing
  	relevantCourtLists.length && relevantCourtLists.forEach((obj, i, a) => {
    	let {courtListDate, listType, result, note, position} = obj
        let Date = courtListDate
        let Title = result
        let Result = result
        let tablePosition = i+1
        let reversedPosition = a.length - i
        let Type = 'Listing'
        let urlDate = moment(Date, 'YYYY-MM-DD')
        urlDate = urlDate.isValid ? urlDate.format('DD/MM/YYYY') : null
      	let oldURL = `http://vlex.com/ireland-dockets/${docketNumber}/Listing/${urlDate}/${reversedPosition}`
        let url = `http://vlex.com/ireland-dockets/${docketNumber}/Listing/${tablePosition}`
        let oldParsedFrom = `http://highcourtsearch.courts.ie/hcslive/court_lists.show?yearNo=${year}&recordNo=${recordNo}&processType=${processType}`
        results.push({URI:[oldURL,oldParsedFrom], parentURL: docketURL, Date, Title, tablePosition, reversedPosition, Type, position, Result, Note: note || null})
    })

  	return results
};


const proceedingTypes = {
    CA: "CA - Circuit Court Appeals",
    CAT: "CAT - CA-TRANSFER FROM CIRCUIT",
    CCA: "CCA - CIRCUIT COURT APPEALS PRE 1994",
    CIR: "CIR - EC CORP INSOLVENCY REGS",
    CLA: "CLA - COMMON LAW APPLICATION",
    COS: "COS - Companies Act Matters",
    EEO: "EEO - EUROPEAN ENFORCEMENT ORDER",
    EXT: "EXT - Extradition",
    FJ: "FJ - FOREIGN JUDGMENTS",
    FTE: "FTE - Foreign Tribunal Evidence",
    IA: "IA - Intended Action",
    JR: "JR - Judicial Review",
    JRP: "JRP - PRISONER JUDICIAL REVIEW APPS",
    MCA: "MCA - Miscellaneous Common Law Appl",
    P: "P - Plenary",
    PAP: "PAP - PATENTS ACT PETITION",
    PEP: "PEP - Parliamentary election Petitio",
    PIR: "PIR - PIAB RULING",
    R: "R - Revenue",
    S: "S - Summary",
    SA: "SA - SOLICITORS MATTERS",
    SC: "SC - SUPREME COURT APPEALS",
    SP: "SP - Special",
    SS: "SS - Stateside",
    SSP: "SSP - PRISONER HABEUS CORPUS APPS",
    TBA: "TBA - To be adopted by High Court",
    VL: "VL - VISITING LAWYERS",
};
