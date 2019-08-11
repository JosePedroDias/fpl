const { elementTypeToPosition, getTeamMappings, loadTeams } = require('./fpl');

const { readJson, toPad, sortNum } = require('./aux');

const gwBefore = '/home/jsad/Work/fpl/backup/pre_GW01_2019-08-08_22:11.json';
const gwAfter = '/home/jsad/Work/fpl/backup/pre_GW02_2019-08-11_09:08.json';

loadTeams();
const { teamFromId, teamFromCode } = getTeamMappings();

const myTeam = readJson('./team.json');
const myTeamCodes = myTeam.map((p) => p.code);

const o1 = readJson(gwBefore);
const o2 = readJson(gwAfter);

o2.elements.forEach((e2) => {
  if (myTeamCodes.indexOf(e2.code) === -1) {
    return;
  }

  const e1 = o1.elements.find((e) => e.id === e2.id);
  if (!e1) {
    console.log(`player new: ${e2.web_name}`);
    return;
  }

  const diff = {};
  for (const k of Object.keys(e2)) {
    const v1 = e1[k];
    const v2 = e2[k];
    if (v1 !== v2) {
      diff[k] = [v1, v2];
    }
  }

  delete diff.selected_by_percent;
  delete diff.ep_this;
  delete diff.ep_next;
  delete diff.transfers_in;
  delete diff.transfers_in_event;
  delete diff.transfers_out;
  delete diff.transfers_out_event;
  delete diff.chance_of_playing_this_round;
  delete diff.chance_of_playing_next_round;
  delete diff.news;
  delete diff.news_added;
  delete diff.influence;
  delete diff.creativity;
  delete diff.threat;
  delete diff.ict_index;
  delete diff.bps;
  delete diff.points_per_game;
  delete diff.form;
  delete diff.value_form;
  delete diff.value_season;
  delete diff.total_points;
  delete diff.dreamteam_count;
  delete diff.in_dreamteam;

  /*

OBJECTIVE, unique

OBJECTIVE, accum
clean_sheets
minutes
goals_conceded
goals_scored
assists
yellow_cards
red_cards
event_points
bonus

SUBJECTIVE
bps
form
influence
creativity
threat
ict_index
value_form
value_season

ACCUM
points_per_game
total_points

*/

  if (Object.keys(diff).length !== 0) {
    console.log(
      `
${elementTypeToPosition[e2.element_type]} ${e2.web_name} / ${
        teamFromId[e2.team]
      }`
    );
    for (const [k, v] of Object.entries(diff)) {
      const [v1, v2] = v;
      let vv = v2 - v1;
      if (vv < 0) {
        vv = v2;
      }
      console.log(`  ${toPad(k, 16, true)}: ${v1} -> ${v2} (${vv})`);
    }
  }
});
