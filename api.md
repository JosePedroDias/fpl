# API

    /bootstrap-static
    /bootstrap-dynamic
    /elements
    /element-summary/{player_id}
    /entry/{user_id}
    /entry/{user_id}/cup
    /entry/{user_id}/event/{event_id}/picks
    /entry/{user_id}/history
    /entry/{user_id}/transfers
    /events
    /event/{event_id}/live
    /fixtures/?event={event_id}
    /game-settings
    /leagues-classic-standings/{league_id}
    /leagues-classic-standings/{league_id}
    /leagues-entries-and-h2h-matches/league/{league_id}
    /leagues-h2h-standings/{league_id}
    /my-team/{user_id}
    /teams
    /transfers

curl 'https://fantasy.premierleague.com/api/bootstrap-static/' -H 'User-Agent: x' -o bootstrap.json
