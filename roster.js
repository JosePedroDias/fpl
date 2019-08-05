const { times, sortNum, readJson, writeJson } = require('./aux');

const {
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
  teamToString
} = require('./fpl');

const prediction = require('./prediction');

///

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

function generateTeam(players, criteria, pickUsingRatios, debug) {
  let log = () => {};
  if (debug) {
    log = (...args) => console.log(...args);
  }

  sortNum(players, criteria);
  players.reverse();

  const pools = {
    [GKP]: players.filter(isGkp),
    [DEF]: players.filter(isDef),
    [MID]: players.filter(isMid),
    [FWD]: players.filter(isFwd)
  };

  function fetchFromPool(pool, r) {
    const [p] = pool.splice(~~(r * pool.length), 1);
    return p;
  }

  function fetchTopFromPool(pool) {
    return pool.shift();
  }

  const replaceSlotFn = [];
  const team = [];
  let teamNr = 0;
  const elTypes = [GKP, DEF, MID, FWD];
  if (!pickUsingRatios) {
    const elNums = [NUM_GKPS, NUM_DEFS, NUM_MIDS, NUM_FWDS];
    elTypes.forEach((elt, i) => {
      const pool = pools[elt];
      const f = () => fetchTopFromPool(pool);
      times(elNums[i]).forEach(() => {
        replaceSlotFn[teamNr++] = f;
        team.push(f());
      });
    });
  } else {
    const ratioOnPool = {
      [GKP]: [0, 0.2], // 2
      [DEF]: [0, 0.05, 0.05, 0.1, 0.1], // 5
      [MID]: [0, 0.05, 0.05, 0.1, 0.1], // 5
      [FWD]: [0, 0.05, 0.1] // 3
    };
    elTypes.forEach((elt) => {
      const pool = pools[elt];
      const rat = ratioOnPool[elt];
      rat.forEach((r) => {
        const f = () => fetchFromPool(pool, r);
        replaceSlotFn[teamNr++] = f;
        team.push(f());
      });
    });
  }

  while (true) {
    log(teamToString(team));
    const cost = teamCost(team);
    const mtc = maxTeamsCounts(team);
    if (cost > MAX_COST) {
      log('too expensive!');
      let { index, player } = mostCostlyPlayer(team);
      const et = player.element_type;
      log(
        `<- removing ${elementTypeToPosition[et]} player ${
          player.web_name
        } costing ${player.now_cost}...`
      );
      pools[et].push(player); // to the end...
      player = replaceSlotFn[index]();
      team[index] = player;
      log(
        `-> replacing him with ${elementTypeToPosition[et]} player ${
          player.web_name
        } costing ${player.now_cost}...
`
      );
    } else if (mtc.number > MAX_PLAYERS_PER_TEAM) {
      log(`too many players from ${mtc.team} (${mtc.number})!`);
      let { index, player } = mostCostlyPlayer(mtc.players);
      index = team.indexOf(player);
      const et = player.element_type;
      log(
        `<- removing ${elementTypeToPosition[et]} player ${
          player.web_name
        } costing ${player.now_cost}...`
      );
      pools[et].push(player); // to the end...
      player = replaceSlotFn[index]();
      team[index] = player;
      log(
        `-> replacing him with ${elementTypeToPosition[et]} player ${
          player.web_name
        } costing ${player.now_cost}...
`
      );
    } else {
      break;
    }
  }

  //sortNum(team, 'total_points');
  //team.reverse();
  //sortNum(team, 'element_type');

  return team;
}

function massageData(players, prediction) {
  const attrsAffected = ['total_points', 'ict_index', 'bps'];

  function applyNewsPenalty(p) {
    if (p.news) {
      for (const a of attrsAffected) {
        p[a] = 0;
      }
    }
  }

  const numPlaces = prediction.length;
  function applyPredictionPenalty(p) {
    //const r = (numPlaces - prediction.indexOf(p.team)) / numPlaces; // 1st->100% ... 20th->0%
    //const r = (numPlaces - prediction.indexOf(p.team) * 2) / numPlaces; // 1st->100% ... 10th->0%
    const r = (numPlaces - prediction.indexOf(p.team) * 1.5) / numPlaces; // 1st->100% ... 10th->0%
    for (const a of attrsAffected) {
      p[a] *= r;
    }
  }

  // balance down stats according to prediction of team winning
  players.forEach(applyPredictionPenalty);

  // bad news about a player zeroes out his stats
  players.forEach(applyNewsPenalty);
}

(async function() {
  await loadTeams();

  const players = await loadPlayers();
  massageData(players, prediction);

  const criterias = ['total_points', 'ict_index', 'bps', 'selected_by_percent'];
  for (const crit of criterias) {
    const team = generateTeam(players, crit, true);
    console.log(`\n\nCRITERIA: ${crit}\n`);
    console.log(teamToString(team));
    //writeJson(`team_${crit}.json`, team);
  }
})();
