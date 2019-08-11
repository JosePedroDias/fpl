const { GKP, DEF, MID, FWD, getTeamMappings, loadTeams } = require('./fpl');

const { readJson, toPad, sortNum, convertOdd } = require('./aux');

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
  let { t1, t2, odds } = m;
  odds = odds.map(convertOdd);
  const [left, tie, right] = odds;
  let dir = 1;
  let v1 = tie;
  v2 = tie;
  if (left > tie && left > right) {
    dir = 0;
  } else if (right > tie && right > left) {
    dir = 2;
  }
  tOdds[t1] = v1;
  tOdds[t2] = v2;
  tIds[mapTeams[t1]] = v1;
  tIds[mapTeams[t2]] = v2;

  //const o = odds.map((n) => toPad(n.toFixed(0), 2, true)).join(' / ');
  //console.log(`${toPad(t1, 20, true)} x ${toPad(t2, 20)} -     ${o}    ${dir}`);

  const o = odds
    .map((n, i) => {
      const sel = i === dir;
      const s0 = sel ? '[' : ' ';
      const s1 = sel ? ']' : ' ';
      return s0 + toPad(n.toFixed(0), 2, true) + s1;
    })
    .join('  ');
  console.log(`${toPad(t1, 20, true)}  ${o}  ${toPad(t2, 20)}`);
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
