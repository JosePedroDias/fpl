(function() {
  const et = {
    1: 'GKP',
    2: 'DEF',
    3: 'MID',
    4: 'FWD'
  };

  function _team(teamId, teams, players) {
    const team = teams.find((t) => t.id === teamId);
    const tPlayers = players.filter((p) => p.team === teamId);
    sortNum(tPlayers, 'element_type');

    const pre = `<h1>
        team: ${team.name}
      </h1><table>`;
    const mid = tPlayers
      .map(
        (p) => `<tr>
          <td>${et[p.element_type]}</td>
          <td>${p.web_name} (${p.code})</td>
          <td><img style="max-height:150px" src="../${getPlayerUrl(p)}"></td>
          <td>${renderFace(p.avatar)}</td>
      </tr>`
      )
      .join('\n');
    const post = `</table>`;
    return pre + mid + post;
  }

  window._.team = _team;
})();
