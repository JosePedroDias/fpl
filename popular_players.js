const { GKP, DEF, MID, FWD } = require('./fpl');

const { readJson, sortNum } = require('./aux');

const players = readJson('./data/players.json');
sortNum(players, 'selected_by_percent').reverse();
players.splice(20, 10000);
console.log(players.map((p) => p.web_name).join('\n'));
