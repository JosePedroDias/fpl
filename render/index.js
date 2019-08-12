(async function() {
  const players = await json('../data/players.json');
  const teams = await json('../data/teams.json');
  const teamExtras = await json('./teamExtras.json');
  const playerExtras = await json('./playerExtras.json');

  teamExtras.forEach((te, i) => {
    const t = teams[i];
    for (const [k, v] of Object.entries(te)) {
      t[k] = v;
    }
  });

  playerExtras.forEach((pe, i) => {
    const p = players.find((p) => p.code === pe.code);
    if (!p) {
      return;
    }
    for (const [k, v] of Object.entries(te)) {
      p[k] = v;
    }
  });

  players.forEach((p) => {
    if (p.avatar) {
      return;
    }
    p.avatar = {
      skinc: rndi(5),
      hairc: rndi(5),
      neck: rndi(2) + 1,
      beard: rndi(4),
      hair: rndi(5)
    };
  });

  function to(s) {
    let html = '';
    const mainEl = document.body.querySelector('#main');
    if (s === 'teams') {
      html = _.teams(teams);
    } else if (s.indexOf('team/') === 0) {
      const id = parseInt(s.split('/').pop(), 10);
      html = _.team(id, teams, players);
    }
    mainEl.innerHTML = html;
  }
  window.to = to;
})();
