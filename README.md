# Hearts

## Frontend Skeleton
*Login*
- user field
- password field
- login button
- signup button

*Home*
- accout name
- create room button
- join room button
    - popup:
    - public room list
    - room number input
- leaderboard button

*Self*
- list your game results

*Leaderboard*
- list of users

*Room*
- display users
- ready button
- make something that: server collects a string from each player, sends the concatenated string back.
- just to mock up a websocket connection with the game flow

## API
/user/create POST
/user/login POST
/user/logout POST: deletes cookie

/board/get GET

/room/get GET: returns public rooms
/room/create POST: redirects to room with room code. the room page will then try to connect to the room WS with that code.
/room/join POST: redirects to room with room code
*Note: Room leave ready/unready is handled by websocket. since start needs to be pushed*

/game/own GET: returns your own games

**Notable Internal Functions**
post-game-result() : tallies game results to user stats and updates leaderboard 
get-user-display() : returns user properties relevant to displaying them (used for rooms and game start)
get-leaderboard() : leaderboard query

## Websocket Flow
**Room**

Client -> Server commands:
- 'ready': player marks themselves as ready
- 'unready': player marks themselves as not ready
- 'leave': player explicitly leaves room (if no players are in the room, delete the room)
- 'disconnect': player disconnects from the room

Server -> Client commands:
- 'state': full room state '{ id: roomId, users: Array, readyState: Map }'
- 'start': start game (all 4 players ready). From this point on, room state should include game state.
- 'nojoin': client cannot join room
- 'disconnect': server closes connection

**Game**
I don't know yet

# Database
**user**
- id (SERIAL PRIMARY KEY)
- username (UNIQUE)
- password_hash

**game**
- game_id (SERIAL PRIMARY KEY)
- timestamp
- status (in progress or done)

**round**
- round_id (SERIAL PRIMARY KEY)
- game_id
- round_number
- timestamp

**round_result**
- user_id (foreign key)
- round_id (foreign key)
- score
- primary key is (user_id, round_id)

**game_users**
- game_id (foreign key)
- player_id (foreign key)
- seat (0-3)
- primary key is (game_id, player_id)
