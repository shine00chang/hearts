import * as db from './database.js'

/**
 * Creates the users table in the database if it does not already exist.
*/
export const createUsersTable = async () => {
  await db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
    );
  `);
}

/**
 * Creates the game table in the database if it does not already exist.
*/
export const createGameTable = async() => {
  await db.query(`
  CREATE TABLE IF NOT EXISTS game (
    game_id SERIAL PRIMARY KEY,
    time_started TIMESTAMP NOT NULL DEFAULT now(),
    status TEXT NOT NULL CHECK (status IN ('in-progress', 'done', 'abandoned'))
  );
`);
}

export const createRoundTable = async () => {
  await db.query(`
  CREATE TABLE IF NOT EXISTS round (
    round_id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES game(game_id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    time_started TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (game_id, round_number)
  );
  `);
};


export const createRoundResultTable = async () => {
  await db.query(`
  CREATE TABLE IF NOT EXISTS round_result (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    round_id INTEGER NOT NULL REFERENCES round(round_id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    PRIMARY KEY (user_id, round_id)
  );
  `);
};

export const createGameUsersTable = async () => {
  await db.query(`
  CREATE TABLE IF NOT EXISTS game_users (
    game_id INTEGER NOT NULL REFERENCES game(game_id) ON DELETE CASCADE,
    player_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seat INTEGER NOT NULL CHECK (seat BETWEEN 0 AND 3),
    PRIMARY KEY (game_id, player_id),
    UNIQUE (game_id, seat)
  );
  `);
};

export const createSessionTable = async () => {
  await db.query(`
  CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT NOT NULL,
    user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    time_started TIMESTAMP NOT NULL DEFAULT now()
  );
  `);
}

export const createAllTables = async () => {
  await createUsersTable();
  await createGameTable();
  await createRoundTable();
  await createRoundResultTable();
  await createGameUsersTable();
  await createSessionTable();
};


export const createUser = async (username, password_hash) => { 
  try {
    await db.query(
      `INSERT INTO users (username, password_hash) VALUES ($1, $2)`,
      [username, password_hash]
);
    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
}

/**
 * Get information about a specified user from the database.
 *
 * @param {string} user The specified user to look up. Can be either by username or by id, but defaults to username lookup.
 * @param {boolean} type Specifies whether the lookup is by username or by ID. Defaults to true for username lookup.
 * @returns {string} The specified user. 
 */
export const getUser = async (user, type = true) => {
  try {
    const res = await db.query(`
      SELECT * FROM users WHERE ${type ? "username" : "id"} = $1`,
      [user]
    );
    return res.rows[0] || null
  } catch (err) {
    console.error(err.message)
  }
}

export const createGame = async () => {
  try {
    const res = await db.query(`
      INSERT INTO game (status)
      VALUES ('in-progress')
      RETURNING *;
    `);
    return res.rows[0];
  } catch (err) {
    console.error(err.message)
  }
};

export const addPlayerToGame = async (game_id, user_id, seat) => {
  try {
    await db.query(`
       INSERT INTO game_users (game_id, player_id, seat)
       VALUES ($1, $2, $3)`,
      [game_id, user_id, seat]
    );
  } catch (err) {
    console.error(err.message)
  }
};

export const createRound = async (game_id, round_number) => {
  const res = await db.query(`
     INSERT INTO round (game_id, round_number)
     VALUES ($1, $2)
     RETURNING *`,
    [game_id, round_number]
  );
  return res.rows[0];
};

export const endRound = async (round_id, user_id, score) => {
  await db.query(`
     INSERT INTO round_result (round_id, user_id, score)
     VALUES ($1, $2, $3)`,
    [round_id, user_id, score]
  );
};

export const createSession = async (session_id, user_id) => {
  await db.query(`
    INSERT INTO sessions (session_id, user_id)
    VALUES ($1, $2)`,
    [session_id, user_id]
  );
}

export const getSession = async (session_id) => {
  try {
    const res = await db.query(`
      SELECT * FROM sessions WHERE session_id = $1`,
      [session_id]
    ) 
    return (res.rows[0] || null)
  } catch (err) {
    console.error(err);
  }
}

export const deleteOldSessions = async () => {
  try {
    const res = await db.query(`DELETE FROM sessions WHERE time_started < (now() - INTERVAL '2 HOUR')`)
    return res.rows[0];
  } catch (err) {
    console.log(err);
  }
}
