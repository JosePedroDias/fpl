const fs = require('fs');
const csv = require('csv-parser');
const assert = require('assert');

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

function times(n) {
  return new Array(n).fill(true).map((_, i) => i);
}

function histogram(arr) {
  const h = {};
  arr.forEach((v) => {
    if (!(v in h)) {
      h[v] = 1;
    } else {
      h[v] += 1;
    }
  });
  return h;
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

function toValues(o) {
  return Object.values(o);
}

function keepKeys(o, keys, aliases, transforms) {
  const O = {};
  for (const k of keys) {
    const K = aliases[k] || k;
    let v = o[k];
    const tr = transforms[k];
    if (tr) {
      v = tr(v);
    }
    O[K] = v;
  }
  return O;
}

function validateTeam(team) {
  assert(team.filter(isGkp).length === NUM_GKPS, 'wrong # gkps');
  assert(team.filter(isDef).length === NUM_DEFS, 'wrong # defs');
  assert(team.filter(isMid).length === NUM_MIDS, 'wrong # mids');
  assert(team.filter(isFwd).length === NUM_FWDS, 'wrong # fwds');

  const cost = team.reduce((prev, p) => prev + p.now_cost, 0);
  assert(cost <= MAX_COST, 'above budget');

  const maxPlayersPerTeam = Math.max(
    ...Object.values(histogram(team.map((p) => p.team_code)))
  );
  assert(
    maxPlayersPerTeam <= MAX_PLAYERS_PER_TEAM,
    'too many players of a team'
  );
}

const TEAMS_CSV = 'ext/Fantasy-Premier-League/data/2019-20/teams.csv';
const PLAYERS_CSV = 'ext/Fantasy-Premier-League/data/2019-20/players_raw.csv';

const GKP = 1;
const DEF = 2;
const MID = 3;
const FWD = 4;

/*
RULES:
- 2 GKP
- 5 DEF
- 5 MID
- 3 FWD

The total value of your initial squad must not exceed £100 million.
You can select up to 3 players from a single Premier League team.
   */
const NUM_GKPS = 2;
const NUM_DEFS = 5;
const NUM_MIDS = 5;
const NUM_FWDS = 3;

const MAX_COST = 100;
const MAX_PLAYERS_PER_TEAM = 3;

const isGkp = (p) => p.element_type === GKP;
const isDef = (p) => p.element_type === DEF;
const isMid = (p) => p.element_type === MID;
const isFwd = (p) => p.element_type === FWD;

(async function() {
  const teams = await readCsv(TEAMS_CSV);
  const teamFromId = {};
  teams.forEach((t) => (teamFromId[t.code] = t.name));

  //

  const players = (await readCsv(PLAYERS_CSV)).map(valuesToFloats);
  players.forEach((p) => (p.now_cost /= 10));
  players.sort((a, b) => a.total_points - b.total_points).reverse();

  //

  const ALIASES = {
    web_name: 'name',
    total_points: 'points',
    now_cost: 'cost',
    element_type: 'pos',
    team_code: 'team'
  };

  const TRANSFORMS = {
    element_type: (v) => [, 'G', 'D', 'M', 'F'][v],
    team_code: (v) => teamFromId[v]
  };

  const KEYS = [
    'web_name',
    'now_cost',
    'total_points',
    'element_type',
    'team_code'
  ];

  //

  const gkps = players.filter(isGkp);
  const defs = players.filter(isDef);
  const mids = players.filter(isMid);
  const fwds = players.filter(isFwd);

  const TEAM = [];
  times(NUM_GKPS).forEach(() => {
    TEAM.push(gkps.shift());
  });
  times(NUM_DEFS).forEach(() => {
    TEAM.push(defs.shift());
  });
  times(NUM_MIDS).forEach(() => {
    TEAM.push(mids.shift());
  });
  times(NUM_FWDS).forEach(() => {
    TEAM.push(fwds.shift());
  });

  validateTeam(TEAM);

  console.log(
    TEAM.map((p) => keepKeys(p, KEYS, ALIASES, TRANSFORMS)).map(toValues)
  );
  const cost = TEAM.reduce((prev, p) => prev + p.now_cost, 0);
  console.log(cost);
})();
