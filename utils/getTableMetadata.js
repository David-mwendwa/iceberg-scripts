// gets and returns and object of table values with their headers as keys
// params: $ from cheerio, table id
// ref: dp0086 metadata parser

const getTableMetadata = ($, tableId) => {
  let table = $(`table#${tableId}`);
  let doc = { }
  let keys = {};
  table.find(">thead>tr").first().children().each(function (i) {
    let title = $(this);
    let label = title.text().replace(/\s+/g, " ").trim().toLowerCase();
    label && (keys[i] = label);
  });

  table.find('>tbody>tr').each(function (i) {
    let cells = $(this).children();
    cells.each(function (j) {
      let child = $(this);
      let label = keys[j];
      let value = child.text().replace(/\s+/g, ' ').trim();
      doc[label] = value;
    });
  });
  return doc
}