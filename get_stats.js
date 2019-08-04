const { get, readJson, writeJson } = require('./aux');
const { writeCsv } = require('./csv');

(async function() {
  const players = readJson('data/players.json');

  let all;
  if (0) {
    all = {};
    let i = -1;
    for (const p of players) {
      ++i;
      console.log(`${i + 1} / ${players.length}`);
      const pl = await get(
        `https://fantasy.premierleague.com/api/element-summary/${p.id}/`
      );
      const o = JSON.parse(pl);
      delete o.fixtures;
      //console.log(o);
      all[p.id] = o;
    }
    writeJson(`stats/all.json`, all);
  } else {
    all = readJson('stats/all.json');
  }

  const seasonData = [];
  const headers = [
    'id',
    'code',
    'team',
    'web_name',
    'element_code',
    'start_cost',
    'end_cost',
    'total_points',
    'minutes',
    'goals_scored',
    'assists',
    'clean_sheets',
    'goals_conceded',
    'own_goals',
    'penalties_saved',
    'penalties_missed',
    'yellow_cards',
    'red_cards',
    'saves',
    'bonus',
    'bps',
    'influence',
    'creativity',
    'threat',
    'ict_index'
  ];

  //const SEASON_NAME = '2016/17';
  //const statsFn = '1617';
  //const SEASON_NAME = '2017/18';
  //const statsFn = '1718';
  const SEASON_NAME = '2018/19';
  const statsFn = '1819';

  for (const p of players) {
    const o = all[p.id];
    if (!o) {
      continue;
    }

    const oo = o.history_past.find((x) => x.season_name === SEASON_NAME);
    if (!oo) {
      continue;
    }

    seasonData.push({
      id: p.id,
      code: p.code,
      team: p.team,
      web_name: p.web_name,
      ...oo
    });
  }
  writeJson(`stats/${statsFn}.json`, seasonData);
  writeCsv(`stats/${statsFn}.csv`, headers, seasonData);
})();
