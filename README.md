# fantasy premier league

## setup

    mkdir ext
    cd ext
    git clone https://github.com/vaastav/Fantasy-Premier-League/
    cd ..
    npm install

## roster

    node roster

## employed algorithm for the roster selection

- sort all player by total_points (points in the previous season, I believe), decrementing from the highest valued one
- create 4 pools with all the GKP, DEF, MID and FWDs
- create the first team by picking the top 2, 5, 5, 3 players from each pool each.
- keep testing and changing the team until it passes the remaining criteria of budget (<= 100) and players per team (<= 3)
  - 1st test: is team cost too high?
    - find the more costly player and switch him for the next best player of that position
  - 2nd test: are the most prevalent team below 3 players? if not
    - find the most costly player out of the most prevalent team and replace him for the next best player of that position
