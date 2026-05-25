
CREATE TABLE admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  nickname TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lineups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (match_id) REFERENCES matches(id)
);

CREATE TABLE lineup_players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lineup_id INTEGER NOT NULL,
  player_id INTEGER NOT NULL,
  team INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (lineup_id) REFERENCES lineups(id),
  FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE INDEX idx_matches_date
ON matches(date);

CREATE INDEX idx_lineups_match_id
ON lineups(match_id);

CREATE INDEX idx_lineup_players_lineup_id
ON lineup_players(lineup_id);

CREATE INDEX idx_lineup_players_player_id
ON lineup_players(player_id);
