function json(url) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((resp) => {
        return resp.json();
      }, reject)
      .then(resolve, reject);
  });
}

function sign(n) {
  return n < 0 ? -1 : n > 0 ? 1 : 0;
}

function sortNum(arr, criteria) {
  arr.sort((a, b) => sign(a[criteria] - b[criteria]));
  return arr;
}

function getTeamLogoUrl(t) {
  return `artwork/team-logos/${t.code}.png`;
}

function getTeamJerseyUrl(t) {
  return `artwork/team-jerseys/${t.code}.png`;
}

function getPlayerUrl(p) {
  return `artwork/players/${p.code}.png`;
}

function rndi(n) {
  return Math.floor(Math.random() * n);
}
