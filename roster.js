const fs = require('fs');
const csv = require('csv-parser');

function readCsv(fn) {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(fn)
      .pipe(csv())
      .on('error', reject)
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      });
  });
}

function valuesToFloats(o) {
  const O = {};
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (v !== '' && isFinite(v)) {
      O[k] = parseFloat(v);
    } else {
      O[k] = v;
    }
  }
  return O;
}

function keepKeys(o, keys) {
  const O = {};
  for (const k of keys) {
    O[k] = o[k];
  }
  return O;
}

const KEYS = [
  /*'first_name', 'second_name',*/ 'web_name',
  'now_cost',
  'total_points'
];

//const SRC_CSV = 'ext/Fantasy-Premier-League/data/2019-20/cleaned_players.csv';
const SRC_CSV = 'ext/Fantasy-Premier-League/data/2019-20/players_raw.csv';

const GKP = 1;
const DEF = 2;
const MID = 3;
const FWD = 4;

(async function() {
  const players = (await readCsv(SRC_CSV)).map(valuesToFloats);

  const gkps = players.filter((p) => p.element_type === GKP);
  const defs = players.filter((p) => p.element_type === DEF);
  const mids = players.filter((p) => p.element_type === MID);
  const fwds = players.filter((p) => p.element_type === FWD);

  console.log(fwds.map((p) => keepKeys(p, KEYS)));
})();
