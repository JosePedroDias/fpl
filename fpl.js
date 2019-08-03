const assert = require('assert');

const { readJson, max, histogram, toValues, toPad } = require('./aux');

const GKP = 1;
const DEF = 2;
const MID = 3;
const FWD = 4;

const elementTypeToPosition = {
  [GKP]: 'GKP',
  [DEF]: 'DEF',
  [MID]: 'MID',
  [FWD]: 'FWD'
};

// used by keepKeys
const ALIASES = {
  web_name: 'name',
  total_points: 'points',
  now_cost: 'cost',
  element_type: 'pos'
};

const teamFromId = {};
const teamFromCode = {};
const teamShortFromId = {};
const teamShortFromCode = {};

const TRANSFORMS = {
  element_type: (v) => elementTypeToPosition[v],
  team: (v) => teamFromId[v]
};

const KEYS = ['web_name', 'now_cost', 'total_points', 'element_type', 'team'];

///

async function loadPlayers() {
  const players = readJson('data/players.json');
  players.forEach((p) => (p.now_cost /= 10));
  return players;
}

async function loadTeams() {
  const teams = readJson('data/teams.json');
  teams.forEach((t) => {
    teamFromCode[t.code] = t.name;
    teamShortFromCode[t.code] = t.short_name;
    teamFromId[t.id] = t.name;
    teamShortFromId[t.id] = t.short_name;
  });
  return teams;
}

function teamCost(players) {
  return players.reduce((prev, p) => prev + p.now_cost, 0);
}

function mostCostlyPlayer(players) {
  const costs = players.map((p) => p.now_cost);
  const highestCost = max(costs);
  const index = costs.indexOf(highestCost);
  return { index, player: players[index] };
}

function maxTeamsCounts(players) {
  const teams = players.map((p) => p.team);
  const h = histogram(teams);
  const maxFreq = max(Object.values(h));
  let maxTeam;
  for (let [k, v] of Object.entries(h)) {
    if (v === maxFreq) {
      maxTeam = parseInt(k, 10);
      break;
    }
  }
  return {
    team: teamFromId[maxTeam],
    number: maxFreq,
    players: teams
      .map((tId, i) => (tId === maxTeam ? players[i] : undefined))
      .filter((p) => p !== undefined)
  };
}

// utility function to transform the players objects into more friendly-reading ones
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

function teamToString(players) {
  const lines = players
    .map((p) => keepKeys(p, KEYS, ALIASES, TRANSFORMS))
    .map((o) =>
      toValues(o)
        .map((arr) => toPad(arr, 12))
        .join(' ')
    );
  lines.push('TEAM COST: ' + teamCost(players) + '\n');
  return lines.join('\n');
}

function getTeamJerseyImageUrl(teamCode) {
  return `https://fantasy.premierleague.com/dist/img/shirts/shirt_${teamCode}-110.png`;
}

function getTeamLogoImageUrl(teamCode) {
  return `https://fantasy.premierleague.com/dist/img/badges/badge_${teamCode}_80.png`;
}

function getPlayerImageUrl(playerId) {
  return `https://platform-static-files.s3.amazonaws.com/premierleague/photos/players/110x140/p${playerId}.png`;
}

function validateTeam(players) {
  const numGkps = players.filter(isGkp).length;
  assert(numGkps === NUM_GKPS, `wrong # gkps (${numGkps})`);
  const numDefs = players.filter(isDef).length;
  assert(numDefs === NUM_DEFS, `wrong # defs (${numGkps})`);
  const numMids = players.filter(isMid).length;
  assert(numMids === NUM_MIDS, `wrong # mids (${numGkps})`);
  const numFwds = players.filter(isFwd).length;
  assert(numFwds === NUM_FWDS, `wrong # fwds (${numGkps})`);

  const cost = teamCost(players);
  assert(cost <= MAX_COST, `above budget (${cost})`);

  const { team, number } = maxTeamsCounts(players);
  assert(
    number <= MAX_PLAYERS_PER_TEAM,
    `too many players from ${team} (${number})`
  );
}

module.exports = {
  GKP,
  DEF,
  MID,
  FWD,
  elementTypeToPosition,
  loadPlayers,
  loadTeams,
  teamCost,
  mostCostlyPlayer,
  maxTeamsCounts,
  getTeamJerseyImageUrl,
  getTeamLogoImageUrl,
  getPlayerImageUrl,
  teamToString,
  validateTeam
};
