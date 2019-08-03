const {
  get,
  writeJson,
  zeroPad,
  listFilesByCreationTime,
  jsonToStringIndented,
  writeText,
  readText,
  exec,
  execRobust,
  ask
} = require('./aux');

function betweenGWs(teams) {
  let played;
  let gamesPlayedByAllTeams = true;
  teams.forEach((t, i) => {
    const p = t.played;
    if (i === 0) {
      played = p;
    } else if (played !== p) {
      gamesPlayedByAllTeams = false;
    }
  });
  return gamesPlayedByAllTeams;
}

function updateTeamsAndPlayers(o) {
  const teams = o.teams.map((t) => ({
    id: t.id,
    code: t.code,
    name: t.name,
    short_name: t.short_name
  }));
  writeJson('data/teams.json', teams);

  const players = o.elements.map((p) => ({
    id: p.id,
    code: p.code,
    team: p.team,
    web_name: p.web_name,
    element_type: p.element_type,
    now_cost: p.now_cost,
    total_points: p.total_points,
    bps: p.bps,
    form: parseFloat(p.form),
    influence: parseFloat(p.influence),
    creativity: parseFloat(p.creativity),
    threat: parseFloat(p.threat),
    ict_index: parseFloat(p.ict_index),
    selected_by_percent: parseFloat(p.selected_by_percent)
  }));
  writeJson('data/players.json', players);
}

async function findLatestBackup() {
  const files = await listFilesByCreationTime('backup');
  return files.pop();
}

function genBackupName(o) {
  const nextEvIndex = o.events.findIndex((ev) => ev.is_next);
  const nextEv = o.events[nextEvIndex];
  const title = nextEv ? `pre_GW${zeroPad(nextEv.id, 2)}` : 'end';
  const d = new Date();
  const ts = d
    .toISOString()
    .substring(0, 16)
    .replace('T', '_');
  return `backup/${title}_${ts}.json`;
}

(async function() {
  const bootstrap = await get(
    'https://fantasy.premierleague.com/api/bootstrap-static/'
  );
  const o = JSON.parse(bootstrap);

  // are we between GWs? if so, backup the data
  if (betweenGWs(o.teams)) {
    const fn = genBackupName(o);
    const newS = jsonToStringIndented(o);

    let prevFn = await findLatestBackup();
    if (prevFn) {
      prevFn = `backup/${prevFn}`;
      const prevS = readText(prevFn);
      if (newS !== prevS) {
        console.log('saving backup to ' + fn);
        writeText(fn, newS);

        const diff = (await execRobust(
          `diff "${prevFn}" "${fn}" -y --suppress-common-lines`
        )).stdout;
        console.log(`\ndiff between ${fn} and ${prevFn} (prev backup):\n`);
        console.log(diff);
        const answer = (await ask('keep the file?')).toLowerCase();
        const keep = ['y', 'yes'].indexOf(answer) !== -1;
        if (!keep) {
          console.log(`removing ${fn}`);
          await exec(`rm ${fn}`);
        } else {
          console.log(`keeping ${fn}`);

          console.log('updating teams and players to data folder...');
          updateTeamsAndPlayers(o);
        }
      } else {
        console.log(`skipping backup: similar to ${prevFn}`);
      }
    } else {
      console.log('first backup. saving backup to ' + fn);
      writeText(fn, newS);

      console.log('saving teams and players to data folder...');
      updateTeamsAndPlayers(o);
    }
  } else {
    console.log('GW happening, skipping backup.');
  }
})();
