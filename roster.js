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
  teamToString,
  getTeamJerseyImageUrl,
  getTeamLogoImageUrl,
  getPlayerImageUrl
} = require('./fpl');

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

function generateTeam(players, criteria, debug) {
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

  const team = [];
  times(NUM_GKPS).forEach(() => {
    team.push(pools[GKP].shift());
  });
  times(NUM_DEFS).forEach(() => {
    team.push(pools[DEF].shift());
  });
  times(NUM_MIDS).forEach(() => {
    team.push(pools[MID].shift());
  });
  times(NUM_FWDS).forEach(() => {
    team.push(pools[FWD].shift());
  });

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
      player = pools[et].shift();
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
      player = pools[et].shift();
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

const attrsAffectedByNews = ['total_points', 'ict_index', 'bps'];

function applyNewsPenalty(p) {
  if (p.news) {
    for (const a of attrsAffectedByNews) {
      p[a] = 0;
    }
  }
}

(async function() {
  /*const teams = */ await loadTeams();

  const players = await loadPlayers();
  // const prediction = readJson('prediction.json');

  players.forEach(applyNewsPenalty);

  const criterias = ['total_points', 'ict_index', 'bps', 'selected_by_percent'];

  for (const crit of criterias) {
    const team = generateTeam(players, crit);
    console.log(`\n\nCRITERIA: ${crit}\n`);
    console.log(teamToString(team));
    //writeJson(`team_${crit}.json`, team);
  }

  /*
  const team = readJson('team.json');
  
  for (const p of team) {
    console.log(`${p.web_name} ![](${getPlayerImageUrl(p.code)})`);
  }

  for (const t of teams) {
    console.log(
      `${t.code} ${t.name} ${t.short_name} ![logo](${getTeamLogoImageUrl(
        t.code
      )}) ![jersey](${getTeamJerseyImageUrl(t.code)})`
    );
  }*/
})();
