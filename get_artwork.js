const { getFile, readJson, fileExists } = require('./aux');
const {
  getTeamJerseyImageUrl,
  getTeamLogoImageUrl,
  getPlayerImageUrl
} = require('./fpl');

(async function() {
  const teams = readJson('data/teams.json');
  let i;

  if (1) {
    i = -1;
    for (const t of teams) {
      ++i;
      console.log(`TEAM: ${i + 1} / ${teams.length}: ${t.name}`);
      await getFile(
        getTeamLogoImageUrl(t.code),
        `artwork/team-logos/${t.code}.png`
      );
      await getFile(
        getTeamJerseyImageUrl(t.code),
        `artwork/team-jerseys/${t.code}.png`
      );
      //break;
    }
  }

  const players = readJson('data/players.json');
  if (1) {
    i = -1;
    for (const p of players) {
      ++i;
      const path = `artwork/players/${p.code}.png`;
      if (await fileExists(path)) {
        console.log(
          `PLAYER ${i + 1} / ${players.length}: ${p.web_name} (skipping)`
        );
      } else {
        console.log(`PLAYER ${i + 1} / ${players.length}: ${p.web_name}`);
        await getFile(getPlayerImageUrl(p.code), path);
      }

      //break;
    }
  }
})();
