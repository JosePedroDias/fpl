const { GKP, DEF, MID, FWD } = require('./fpl');

const { readJson, sortNum } = require('./aux');

const position = FWD;
const numPlayers = 20;
const maxPrice = 63;

let players = readJson('./data/players.json');

if (position) {
  players = players.filter((p) => p.element_type === position);
}

if (maxPrice) {
  players = players.filter((p) => p.now_cost === maxPrice);
}

sortNum(players, 'selected_by_percent').reverse();
players.splice(numPlayers, 10000);
console.log(players.map((p) => `${p.web_name} ${p.now_cost}`).join('\n'));
