# fantasy premier league

## setup

have a recent nodejs impl

## roster

    node getData
    node roster

## employed algorithm for the roster selection

- sort all player by total_points (points in the previous season, I believe), decrementing from the highest valued one
- create 4 pools with all the GKP, DEF, MID and FWDs
- create the first team by picking the top 2, 5, 5, 3 players from each pool each. \*
- keep testing and changing the team until it passes the remaining criteria of budget (<= 100) and players per team (<= 3)
  - 1st test: is team cost too high?
    - find the more costly player and switch him for the next best player of that position
  - 2nd test: are the most prevalent team below 3 players? if not
    - find the most costly player out of the most prevalent team and replace him for the next best player of that position

### variants to the algorithm

\*) instead of getting always the top element from each pool, one can fill each position with decreasingly worse players, assuming the last ones will not be playing.

there are 2 massage steps I created as well to reorder the players differently instead of plain attr order:

- if a player has a news deemed bad (ex: injury) we will zero down those attrs so he doesn't get picked.
- assuming a prediction of team places and therefore those teams will get their players more points for having won more often, the attrs can get balanced down according to estimated place the team of the place will have, that is,
  a player from the 20th place will be picked 0% of the times while the 1st 100% - attrs are capped with the percentage of success.
