const { elementTypeToPosition } = require('./fpl');

const { readJson, toPad } = require('./aux');

const players = readJson('./data/players.json');
const team = readJson('./team.json');

console.log(
  team
    .map((p) => {
      const P = players.find((x) => x.code === p.code);
      return `${toPad(p.web_name, 14)} ${
        elementTypeToPosition[p.element_type]
      } ${toPad((P.now_cost / 10).toFixed(1), 5, true)}`;
    })
    .join('\n')
);
