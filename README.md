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

*Game*
- make something that: server collects a string from each player, sends the concatenated string back.
- just to mock up a websocket connection with the game flow

## API
/user/create POST
/user/login POST
/user/logout POST: deletes cookie

/board/get GET

/room/get GET: returns public rooms
/room/create POST
/room/join POST
*Note: Room leave ready/unready is handled by websocket. since start needs to be pushed*

/game/own GET: returns your own games

**Notable Internal Functions**
post-game-result() : tallies game results to user stats and updates leaderboard 
get-user-display() : returns user properties relevant to displaying them (used for rooms and game start)
get-leaderboard() : leaderboard query

## Websocket Flow
**Room**
client commands:
- ready
- unready
- leave
server commands:
- users: sends a list of room user's display data, including self
- readystate: sends a list of user's ready state
- start

**Game**
I don't know yet

# Database
**user**
- ID
- username
- password

**game**
- timestamp
- ID1
- ID2
- ID3
- ID4
- score1
- score2
- score3
- score4
