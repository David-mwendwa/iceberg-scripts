const moment = require('moment')

function getSeeds() {
    let start = moment();
  	let end = moment().subtract(2, 'days');
    start = moment('2022-01-28'); //Newest date
    end = moment('2022-01-01');
    let seeds = [];
    let c = start.clone();
    console.log(c)
    while (c.isSameOrAfter(end)) {
        if (c.isoWeekday() <= 5)
            seeds.push(`https://dre.pt/web/guest/pesquisa-avancada?date=${c.format("YYYY-MM-DD")}`);
        c = c.subtract(1, 'days');
    }
    return seeds;
}
console.log(getSeeds())