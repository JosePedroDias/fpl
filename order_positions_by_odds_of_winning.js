const { GKP, DEF, MID, FWD, getTeamMappings, loadTeams } = require('./fpl');

const { readJson, toPad, sortNum } = require('./aux');

const team = readJson('./team.json');
const odds = readJson('./odds_gw01.json');
const teams = loadTeams();
const { teamFromId } = getTeamMappings();

//bet.pt team name to fpl teamId
const mapTeams = {
  Arsenal: 1,
  'Aston Villa': 2,
  Bournemouth: 3,
  Brighton: 4,
  Burnley: 5,
  Chelsea: 6,
  'Crystal Palace': 7,
  Everton: 8,
  Leicester: 9,
  Liverpool: 10,
  'Manchester City': 11,
  'Man. Utd': 12,
  Newcastle: 13,
  Norwich: 14,
  'Sheffield Utd': 15,
  Southampton: 16,
  Tottenham: 17,
  Watford: 18,
  'West Ham': 19,
  Wolves: 20
};

const tIds = {};
const tOdds = {};

for (const m of odds) {
  const { t1, t2, odds } = m;
  const [left, tie, right] = odds;
  const o = odds.map((n) => toPad(n.toFixed(2), 6)).join(' / ');
  let dir = ' == ';
  let v1 = tie;
  v2 = tie;
  if (left > tie && left > right) {
    dir = ' -> ';
    v1 -= 10;
    v2 *= 20;
  } else if (right > tie && right > left) {
    dir = ' <- ';
    v1 *= 20;
    v2 -= 10;
  }
  tOdds[t1] = v1;
  tOdds[t2] = v2;
  tIds[mapTeams[t1]] = v1;
  tIds[mapTeams[t2]] = v2;

  console.log(
    `${toPad(t1, 20, true)} x ${toPad(t2, 20)} -       ${o}      ${dir}`
  );
}

for (const pos of [GKP, DEF, MID, FWD]) {
  const players = team.filter((p) => p.element_type === pos);
  console.log(
    players
      .map((p) => `${toPad(p.web_name, 16)}   ${teamFromId[p.team]}`)
      .join('\n')
  );
  console.log();
}

const tOddsArr = Object.entries(tOdds).map(([a, b]) => ({
  a,
  b
}));
sortNum(tOddsArr, 'b').reverse();
console.log(tOddsArr);
