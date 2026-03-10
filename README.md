# Hearts

A web application to play the card game **Hearts**. 

Tech stack: SvelteKit frontend, Node.js backend, PostgreSQL database.

## Setup Instructions
First, set up Node.js, npm, and [Postgres](#specific-postgres-instructions). Then, run the following commands to install dependencies.
```
git clone https://github.com/shine00chang/hearts.git
(cd frontend && npm i)
(cd backend && npm i)
```
To start the frontend:
```
npm run dev  # in ./frontend
```
To start the backend:
```
npm start  # in ./backend
```

## Specific Postgres Instructions
If this repository came from a compressed tarball on Gradescope, /backend/.env should already be populated with a database url to a Neon database.
As such, the following instructions can be safely ignored if /backend/.env is already populated.

Alternatively, if you already have Postgres set up on your computer, you don't need to follow these instructions to set up Postgres.
You will, however, need to create a database and provide the url to it in /backend/.env in the form: `DATABASE_URL=postgres://...` 

### Windows:
1. Download the PostgreSQL installer from [here](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads) and run it. 
2. Set up pgAdmin 4. 
3. Now, construct the URL depending on the info you used to set it up: e.g. mine is `postgres://postgres:<PASSWORD>@localhost:5433/hearts`. 
4. Place this URL in backend/.env: `DATABASE_URL=postgres://...` 

### Linux (untested):

1. Install postgres from your package manager:
```
sudo apt update
sudo apt install postgresql postgresql-contrib
```
2. Start the service if applicable
```
sudo systemctl start postgresql.service
sudo systemctl enable postgresql.service
sudo systemctl status postgresql.service
```
3. Set up the database with the `psql` CLI

## Testing
If /backend/.env is already populated with a URL, then the following users are already created and have game data available:
- username: "mochbot", password: "test"
- username: "caboozled_pie", password: "test"
- username: "zzztoj", password: "test"
- username: "coldclear", password: "test"

If one wants to look at /profile, they are encouraged to start with one of these test users to view game data. 
If one wants to search for the past games of specific users, these users have all participated in at least one game beforehand.

# Internals

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

*Search*
- search for games of specific player

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

/game/search?{username} GET: returns the games of username

**Notable Internal Functions**
post-game-result() : tallies game results to user stats and updates leaderboard 
get-user-display() : returns user properties relevant to displaying them (used for rooms and game start)
get-leaderboard() : leaderboard query

## Websocket Flow
**Room**

Client -> Server commands:
- 'ready': player marks themselves as ready
- 'unready': player marks themselves as not ready
- 'leave': player explicitly leaves room (if no players are in the room, server delete the room)
- 'disconnect': player disconnects from the room

Server -> Client commands:
- 'state': full room state '{ id: roomId, users: Array, readyState: Map }'
- 'start': start game (all 4 players ready). From this point on, room state should include game state.
- 'nojoin': client cannot join room
- 'disconnect': server closes connection
- 'playerdisconnected': player leaves midgame '{ userId, roomId }'

**Game**
Game state: 
- hands: id: [13] \(don't send others'!)
- passing: bool (true when we are passing, false when it is done)
- passes: id: [3] \(don't send others'!)
- passDirection: string
- trick: id: card (which card has been played for this trick)
- leader: id (player that leads the trick)
- turn: id (player that needs to play next)
- heartsBroken: bool
- roundPoints: id: int (temporary accumulator that tracks points for the current round)
- points: id: int (persistent running total across all rounds; committed to db at gameend)
- roundNumber: room's round number
- dbGameId: gameId in db

Notes on card encoding:
- suit: 'S' or 'C' or 'D' or 'H'
- value: '2' to 'A'

Client -> Server commands:
- 'pass': Player tells the server which 3 selected cards to send to another player. Server stores in 'passes'
- 'play': Player tells the server which card they will play for the trick. 

Server -> Client commands:
- 'state': Sends the state object
    - server sends this when:
        - all players have sent 'pass'
        - player with turn sent 'play'
- 'illegalmove': Server emits to a player that their move was illegal. sent as a response to 'play'.

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
