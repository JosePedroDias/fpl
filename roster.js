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
  printPlayers,
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

function generateTeam(players) {
  // sorting by different criteria gets us different outcomes
  sortNum(players, 'total_points');
  // sortNum(players, 'ict_index');
  // sortNum(players, 'bps');
  // sortNum(players, 'selected_by_percent');
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
    printPlayers(team);
    const cost = teamCost(team);
    const mtc = maxTeamsCounts(team);
    if (cost > MAX_COST) {
      console.log('too expensive!');
      let { index, player } = mostCostlyPlayer(team);
      const et = player.element_type;
      console.log(
        `<- removing ${elementTypeToPosition[et]} player ${
          player.web_name
        } costing ${player.now_cost}...`
      );
      pools[et].push(player); // to the end...
      player = pools[et].shift();
      team[index] = player;
      console.log(
        `-> replacing him with ${elementTypeToPosition[et]} player ${
          player.web_name
        } costing ${player.now_cost}...
`
      );
    } else if (mtc.number > MAX_PLAYERS_PER_TEAM) {
      console.log(`too many players from ${mtc.team} (${mtc.number})!`);
      let { index, player } = mostCostlyPlayer(mtc.players);
      index = team.indexOf(player);
      const et = player.element_type;
      console.log(
        `<- removing ${elementTypeToPosition[et]} player ${
          player.web_name
        } costing ${player.now_cost}...`
      );
      pools[et].push(player); // to the end...
      player = pools[et].shift();
      team[index] = player;
      console.log(
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
  //printPlayers(team);

  console.log('== DONE ==');

  return team;
}

(async function() {
  const teams = await loadTeams();

  const players = await loadPlayers();

  const team = generateTeam(players);
  writeJson('team.json', team);

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
