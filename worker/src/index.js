function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

async function getPlayers(env) {
  const { results } = await env.DB
    .prepare(`
      SELECT *
      FROM players
      WHERE is_active = 1
      ORDER BY name ASC
    `)
    .all();

  return results;
}

async function createPlayer(env, body) {
  const { name, nickname = null } = body;

  if (!name) {
    return json({ error: 'Name is required' }, 400);
  }

  const result = await env.DB
    .prepare(`
      INSERT INTO players (name, nickname)
      VALUES (?, ?)
    `)
    .bind(name, nickname)
    .run();

  return json({
    success: true,
    playerId: result.meta.last_row_id
  });
}

async function createMatch(env, body) {
  const { date, location } = body;

  if (!date || !location) {
    return json({ error: 'Date and location are required' }, 400);
  }

  const result = await env.DB
    .prepare(`
      INSERT INTO matches (date, location)
      VALUES (?, ?)
    `)
    .bind(date, location)
    .run();

  return json({
    success: true,
    matchId: result.meta.last_row_id
  });
}

async function getNextMatch(env) {
  const match = await env.DB
    .prepare(`
      SELECT *
      FROM matches
      WHERE datetime(date) >= datetime('now')
      ORDER BY datetime(date) ASC
      LIMIT 1
    `)
    .first();

  if (!match) {
    return json({
      date: null,
      location: null,
      teams: {
        team1: [],
        team2: []
      }
    });
  }

  const lineup = await env.DB
    .prepare(`
      SELECT
        lp.team,
        p.name
      FROM lineup_players lp
      JOIN players p ON p.id = lp.player_id
      JOIN lineups l ON l.id = lp.lineup_id
      WHERE l.match_id = ?
      ORDER BY p.name ASC
    `)
    .bind(match.id)
    .all();

  const teams = {
    team1: [],
    team2: []
  };

  lineup.results.forEach((player) => {
    if (player.team === 1) {
      teams.team1.push(player.name);
    }

    if (player.team === 2) {
      teams.team2.push(player.name);
    }
  });

  return json({
    id: match.id,
    date: match.date,
    location: match.location,
    teams
  });
}

async function createLineup(env, body) {
  const { matchId, team1, team2 } = body;

  if (!matchId) {
    return json({ error: 'Match ID is required' }, 400);
  }

  const lineupResult = await env.DB
    .prepare(`
      INSERT INTO lineups (match_id)
      VALUES (?)
    `)
    .bind(matchId)
    .run();

  const lineupId = lineupResult.meta.last_row_id;

  async function insertPlayers(players, team) {
    for (const playerId of players) {
      await env.DB
        .prepare(`
          INSERT INTO lineup_players (
            lineup_id,
            player_id,
            team
          )
          VALUES (?, ?, ?)
        `)
        .bind(lineupId, playerId, team)
        .run();
    }
  }

  await insertPlayers(team1 || [], 1);
  await insertPlayers(team2 || [], 2);

  return json({
    success: true,
    lineupId
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;

    if (method === 'OPTIONS') {
      return json({ ok: true });
    }

    if (url.pathname === '/') {
      return json({
        name: 'Futsa API',
        status: 'running'
      });
    }

    if (url.pathname === '/players' && method === 'GET') {
      const players = await getPlayers(env);
      return json(players);
    }

    if (url.pathname === '/players' && method === 'POST') {
      const body = await request.json();
      return createPlayer(env, body);
    }

    if (url.pathname === '/matches' && method === 'POST') {
      const body = await request.json();
      return createMatch(env, body);
    }

    if (url.pathname === '/next-match' && method === 'GET') {
      return getNextMatch(env);
    }

    if (url.pathname === '/lineups' && method === 'POST') {
      const body = await request.json();
      return createLineup(env, body);
    }

    return json({ error: 'Route not found' }, 404);
  }
};
