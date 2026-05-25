const API_URL = 'https://futsa-worker.ww7rfpf4mp.workers.dev';

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

async function getNextMatch() {
  return apiRequest('/next-match');
}

async function createMatch(matchData) {
  return apiRequest('/matches', {
    method: 'POST',
    body: JSON.stringify(matchData)
  });
}

async function getPlayers() {
  return apiRequest('/players');
}

async function createPlayer(playerData) {
  return apiRequest('/players', {
    method: 'POST',
    body: JSON.stringify(playerData)
  });
}

async function createLineup(lineupData) {
  return apiRequest('/lineups', {
    method: 'POST',
    body: JSON.stringify(lineupData)
  });
}
