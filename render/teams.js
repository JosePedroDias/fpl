(function() {
  function _teams(teams) {
    const pre = `<h1>teams</h1><table>`;
    const mid = teams
      .map(
        (t) => `<tr>
        <td><a href="#" onclick="to('team/${t.id}')">${t.name}</a></td>
        <td><img src="../${getTeamLogoUrl(t)}"></td>
        <td><img src="../${getTeamJerseyUrl(t)}"></td>
        <td>${renderJersey(t.jerseys[0])}</td>
    </tr>`
      )
      .join('\n');
    const post = `</table>`;
    return pre + mid + post;
  }

  window._.teams = _teams;
})();
