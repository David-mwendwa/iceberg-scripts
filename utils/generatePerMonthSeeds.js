const moment = require('moment');

function getSeeds() { 
    let start = moment().subtract(1, 'year')
    let end = moment();
    start = moment('2021-12-01');
    end = moment('2022-04-01'); //Newest date
    

    let seeds = [];
    let c = end.clone();
    while (c.isSameOrAfter(start)) {
        seeds.push(`https://periodico.hidalgo.gob.mx/?post_type=tribe_events&eventDisplay=month&eventDate=${c.format("YYYY-MM")}`)
        c = c.subtract(1, 'months');
    }
    return seeds;
}
let seeds = getSeeds();
console.log(seeds)
