const { get, readJson, writeJson } = require('./aux');

(async function() {
  const bootstrap = await get(
    'https://fantasy.premierleague.com/api/bootstrap-static/'
  );
  const o = JSON.parse(bootstrap);
  //console.log(o);
  writeJson('data/bootstrap.json', o);

  //const o = readJson('bootstrap.json');

  const teams = o.teams.map((t) => ({
    id: t.id,
    code: t.code,
    name: t.name,
    short_name: t.short_name
  }));
  //console.log(teams);
  writeJson('data/teams.json', teams);

  const players = o.elements.map((p) => ({
    id: p.id,
    code: p.code,
    team: p.team,
    web_name: p.web_name,
    element_type: p.element_type,
    now_cost: p.now_cost,
    total_points: p.total_points
  }));
  //console.log(players);
  writeJson('data/players.json', players);
})();
