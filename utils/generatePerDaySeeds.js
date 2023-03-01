const moment = require('moment')

function getSeeds() {
  	let from = moment().subtract(3, 'months');
    let to = moment();
  
  	from = moment("2021-01-01");
  	to = moment("2022-01-01");
  
  	if (from.isAfter(to))
        [from, to] = [to, from];
  
    let seeds = [];
    let c = to.clone();
    while (c.isSameOrAfter(from)) {
        if (c.isoWeekday() <= 5) {
            let domain = ''
          	seeds.push(`${domain}?from=${c.format("YYYY-MM-DD")}&to=${c.format("YYYY-MM-DD")}&page=1`)
        }
        c = c.subtract(1, 'days');
    }
    return seeds;
}
console.log(getSeeds())