const { readJson, has, toPad, sortNum } = require('./aux');

const etMap = {
  1: 'G',
  2: 'D',
  3: 'M',
  4: 'F'
};

function heuristic(n) {
  n = n.toLowerCase();
  if (has(n, 'unknown')) {
    return 10;
  }
  if (has(n, '75%')) {
    return 7;
  }
  if (has(n, '25%')) {
    return 5;
  }
  if (n.length) {
    return 1;
  }
  return 0;
}

(async function() {
  const teams = readJson(`data/teams.json`);
  const players = readJson(`data/players.json`);

  players.forEach((p) => (p.news_h = heuristic(p.news)));

  sortNum(players, 'news_h');
  players.reverse();

  for (const p of players) {
    if (!p.news) continue;
    if (p.news_h < 5) continue;
    const t = teams.find((tt) => tt.id === p.team);
    console.log(
      `${etMap[p.element_type]} | ${toPad(p.web_name, 12)} | ${toPad(
        t.name,
        12
      )} | ${p.news}`
    );
  }
})();
