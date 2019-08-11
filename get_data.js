const {
  ask,
  exec,
  execRobust,
  get,
  jsonToStringIndented,
  listFilesByCreationTime,
  pInt,
  readText,
  writeJson,
  writeText,
  zeroPad
} = require('./aux');

function betweenGWs(o) {
  const thisEvIndex = o.events.findIndex((ev) => ev.is_current);
  const nextEvIndex = o.events.findIndex((ev) => ev.is_next);
  if (thisEvIndex === -1) {
    return true;
  }
  if (nextEvIndex === -1) {
    return true;
  }
  const thisEv = o.events[thisEvIndex];
  return !!thisEv.finished;
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
    // ids
    id: p.id,
    code: p.code,
    team: p.team,
    // name
    web_name: p.web_name,
    // 1=GKP, 2=DEF, 3=MID, 4=FWD
    element_type: p.element_type,
    now_cost: p.now_cost,
    total_points: p.total_points,
    // specs
    bps: p.bps,
    form: parseFloat(p.form),
    //
    influence: parseFloat(p.influence),
    creativity: parseFloat(p.creativity),
    threat: parseFloat(p.threat),
    // ict joined
    ict_index: parseFloat(p.ict_index),
    // popularity
    selected_by_percent: parseFloat(p.selected_by_percent),
    // other info, such as injuries
    news: p.news,
    news_added: p.news_added,
    // stats
    minutes: pInt(p.minutes),
    goals_scored: pInt(p.goals_scored),
    assists: pInt(p.assists),
    clean_sheets: pInt(p.clean_sheets),
    goals_conceded: pInt(p.goals_conceded),
    own_goals: pInt(p.own_goals),
    penalties_saved: pInt(p.penalties_saved),
    penalties_missed: pInt(p.penalties_missed),
    yellow_cards: pInt(p.yellow_cards),
    red_cards: pInt(p.red_cards),
    saves: pInt(p.saves),
    bonus: pInt(p.bonus)
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
  if (betweenGWs(o)) {
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
