const fallbackMatch = {
  date: null,
  location: 'Još nije uneseno',
  teams: {
    team1: [],
    team2: []
  }
};

const daysElement = document.getElementById('days');
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const locationElement = document.getElementById('location');
const matchTimeElement = document.getElementById('match-time');
const team1Element = document.getElementById('team1');
const team2Element = document.getElementById('team2');
const team1CountElement = document.getElementById('team1-count');
const team2CountElement = document.getElementById('team2-count');

let countdownInterval = null;

function formatMatchDate(dateString) {
  if (!dateString) {
    return 'Čeka se termin';
  }

  const date = new Date(dateString);

  return date.toLocaleString('hr-HR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function resetCountdown() {
  daysElement.textContent = '--';
  hoursElement.textContent = '--';
  minutesElement.textContent = '--';
  secondsElement.textContent = '--';
}

function updateCountdown(matchDateString) {
  if (!matchDateString) {
    resetCountdown();
    return;
  }

  const matchDate = new Date(matchDateString).getTime();
  const now = Date.now();
  const difference = matchDate - now;

  if (difference <= 0) {
    daysElement.textContent = '0';
    hoursElement.textContent = '0';
    minutesElement.textContent = '0';
    secondsElement.textContent = '0';
    return;
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  daysElement.textContent = days;
  hoursElement.textContent = hours;
  minutesElement.textContent = minutes;
  secondsElement.textContent = seconds;
}

function renderTeam(container, players) {
  container.innerHTML = '';

  if (!players.length) {
    container.innerHTML = '<p class="empty-state">Postava još nije složena.</p>';
    return;
  }

  players.forEach((playerName) => {
    const playerElement = document.createElement('div');
    playerElement.className = 'player-card';
    playerElement.textContent = playerName;
    container.appendChild(playerElement);
  });
}

function renderDashboardData(nextMatch) {
  locationElement.textContent = nextMatch.location || fallbackMatch.location;
  matchTimeElement.textContent = formatMatchDate(nextMatch.date);

  renderTeam(team1Element, nextMatch.teams?.team1 || []);
  renderTeam(team2Element, nextMatch.teams?.team2 || []);

  team1CountElement.textContent = `${nextMatch.teams?.team1?.length || 0} igrača`;
  team2CountElement.textContent = `${nextMatch.teams?.team2?.length || 0} igrača`;

  updateCountdown(nextMatch.date);

  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  countdownInterval = setInterval(() => {
    updateCountdown(nextMatch.date);
  }, 1000);
}

async function renderDashboard() {
  try {
    const nextMatch = await getNextMatch();
    renderDashboardData(nextMatch);
  } catch (error) {
    console.error(error);
    renderDashboardData(fallbackMatch);
  }
}

renderDashboard();