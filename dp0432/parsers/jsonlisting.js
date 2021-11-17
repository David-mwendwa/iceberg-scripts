async function parsePage({responseBody, URL, html, referer}) {
    const results = [];
  	let json = JSON.parse(responseBody.content);
  	if (/\?year=(\d+)&proceedings=(.+)$/i.test(URL)) { 
        let res = json.results
        res.length && res.forEach(obj => {
            let {year, caseRecordId, proceedingType} = obj
            let proceeding = proceedingTypes[proceedingType]
            let url = `https://www.csol.ie/ccms/api/high-court-search/case-details?year=${year}&caseRecordId=${caseRecordId}&proceedingType=${proceedingType}`                
            let match = /\?year=(.+)&caseRecordId=(.+)&proceedingType=(.+)/i.exec(url)
            let yearNo = match && match[1]
            let recordNo = match && match[2]
            let processType = match && match[3]
            results.push({URI:[url], year, proceeding})
        })
    }      
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