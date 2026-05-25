requireAdmin();

const playersPool = document.getElementById('players-pool');
const dropzones = document.querySelectorAll('.team-dropzone');
const saveMatchButton = document.getElementById('save-match-btn');
const saveLineupButton = document.getElementById('save-lineup-btn');
const matchDateInput = document.getElementById('match-date');
const matchLocationInput = document.getElementById('match-location');
const playerNameInput = document.getElementById('player-name');
const addPlayerButton = document.getElementById('add-player-btn');
const deletePlayerZone = document.getElementById('delete-player-zone');

let draggedPlayer = null;
let currentMatchId = null;

function makePlayerChip(player) {
  const playerElement = document.createElement('div');
  playerElement.className = 'player-chip';
  playerElement.draggable = true;
  playerElement.textContent = player.nickname || player.name;
  playerElement.dataset.playerId = player.id;

  playerElement.addEventListener('dragstart', () => {
    draggedPlayer = playerElement;
    playerElement.classList.add('dragging');
  });

  playerElement.addEventListener('dragend', () => {
    playerElement.classList.remove('dragging');
  });

  return playerElement;
}

function setupDropzones() {
  dropzones.forEach((zone) => {
    zone.addEventListener('dragover', (event) => {
      event.preventDefault();
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', (event) => {
      event.preventDefault();
      zone.classList.remove('drag-over');

      if (!draggedPlayer) {
        return;
      }

      zone.appendChild(draggedPlayer);
    });
  });
}

function setupDeleteZone() {
  if (!deletePlayerZone) {
    return;
  }

  deletePlayerZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    deletePlayerZone.classList.add('drag-over');
  });

  deletePlayerZone.addEventListener('dragleave', () => {
    deletePlayerZone.classList.remove('drag-over');
  });

  deletePlayerZone.addEventListener('drop', async (event) => {
    event.preventDefault();
    deletePlayerZone.classList.remove('drag-over');

    if (!draggedPlayer) {
      return;
    }

    const playerId = Number(draggedPlayer.dataset.playerId);
    const playerName = draggedPlayer.textContent.trim();

    const confirmed = confirm(`Obrisati igrača "${playerName}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deletePlayer(playerId);
      draggedPlayer.remove();
      draggedPlayer = null;

      await loadPlayers();

      alert('Igrač obrisan.');
    } catch (error) {
      console.error(error);
      alert('Greška kod brisanja igrača.');
    }
  });
}

async function loadPlayers() {
  try {
    const players = await getPlayers();

    playersPool.innerHTML = '';

    if (!players.length) {
      playersPool.innerHTML = '<p class="empty-state">Nema igrača u bazi.</p>';
      return;
    }

    players.forEach((player) => {
      playersPool.appendChild(makePlayerChip(player));
    });
  } catch (error) {
    console.error(error);
    alert('Ne mogu učitati igrače iz baze.');
  }
}

function getPlayerIdsFromZone(zoneId) {
  const zone = document.getElementById(zoneId);
  const players = zone.querySelectorAll('.player-chip');

  return [...players].map((player) => Number(player.dataset.playerId));
}

async function saveMatch() {
  const date = matchDateInput.value;
  const location = matchLocationInput.value.trim();

  if (!date || !location) {
    alert('Unesi datum i lokaciju termina.');
    return;
  }

  try {
    const result = await createMatch({ date, location });
    currentMatchId = result.matchId;

    console.log('MATCH SAVED:', result);

    alert('Termin spremljen.');
  } catch (error) {
    console.error(error);
    alert('Greška kod spremanja termina.');
  }
}

async function saveLineup() {
  if (!currentMatchId) {
    alert('Prvo spremi termin, pa onda postavu.');
    return;
  }

  const lineup = {
    matchId: currentMatchId,
    team1: getPlayerIdsFromZone('team1-dropzone'),
    team2: getPlayerIdsFromZone('team2-dropzone')
  };

  if (!lineup.team1.length || !lineup.team2.length) {
    alert('Obje ekipe moraju imati barem jednog igrača.');
    return;
  }

  try {
    const result = await createLineup(lineup);

    console.log('LINEUP SAVED:', result);

    alert('Postava spremljena.');
  } catch (error) {
    console.error(error);
    alert('Greška kod spremanja postave.');
  }
}

async function addPlayer() {
  const name = playerNameInput.value.trim();

  if (!name) {
    alert('Unesi ime igrača.');
    return;
  }

  try {
    await createPlayer({ name });

    playerNameInput.value = '';
    await loadPlayers();

    alert('Igrač dodan.');
  } catch (error) {
    console.error(error);
    alert('Greška kod dodavanja igrača.');
  }
}

if (saveMatchButton) {
  saveMatchButton.addEventListener('click', saveMatch);
}

if (saveLineupButton) {
  saveLineupButton.addEventListener('click', saveLineup);
}

if (addPlayerButton) {
  addPlayerButton.addEventListener('click', addPlayer);
}

setupDropzones();
setupDeleteZone();
loadPlayers();