// https://www.bet.pt/apostas-desportivas/futebol/inglaterra-premier-league/
arr = Array.prototype.slice
  .apply(document.querySelectorAll('.event-wrapper-inner'))
  .map((ev) => {
    const e1 = ev.querySelector('.event-details-row-team-a');
    const e2 = ev.querySelector('.event-details-row-team-b');
    if (!e1) {
      return;
    }
    const t1 = e1.innerText.split('\n')[1];
    const t2 = e2.innerText.split('\n')[1];
    const odds = Array.prototype.slice
      .apply(ev.querySelectorAll('.bet-odds-number'))
      .map((s) => parseFloat(s.innerText));
    return { t1, t2, odds };
  })
  .filter((o) => o && !!o.t1);

JSON.stringify(arr);
