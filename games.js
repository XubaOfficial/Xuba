const gameList = document.getElementById('game-list');
const searchBox = document.getElementById('search-box');

const AIRTABLE_URL = 'https://api.airtable.com/v0/appWQBWvOA36q97b3/Jogos';
const AUTH_HEADER = 'Bearer patfdnvMpc0CjxTPu.4730edeb9e10f3642856770bc3c33291d2bef410d7d5faf6becf89a9d2c835ee';

let allGames = [];

async function fetchGames() {
  const response = await fetch(`${AIRTABLE_URL}?view=Grid%20view`, {
    headers: {
      Authorization: AUTH_HEADER
    }
  });

  if (!response.ok) {
    console.error("Erro ao buscar jogos do Airtable");
    return;
  }

  const data = await response.json();
  allGames = data.records;
  renderGames(allGames);
}

function renderGames(games) {
  gameList.innerHTML = '';
  games.forEach(record => {
    const { URL, NAME, LIKE, DESLIKE, PAGE } = record.fields;

    const gameItem = document.createElement('div');
    gameItem.className = 'video-item';

    gameItem.innerHTML = `
      <img src="${URL}" alt="${NAME}" style="width: 100%; height: 128px; object-fit: cover; border-radius: 8px; margin-bottom: 0.5em;">
      <div class="video-info">
        <strong>${NAME}</strong>
        <div class="button-group">
          <button class="button" onclick="incrementLike('${record.id}', ${LIKE || 0})">
            <i class="fa fa-thumbs-up"></i> ${LIKE || 0}
          </button>
          <button class="button" onclick="incrementDeslike('${record.id}', ${DESLIKE || 0})">
            <i class="fa fa-thumbs-down"></i> ${DESLIKE || 0}
          </button>
        </div>
        <button class="play-button" onclick="window.location.href='${PAGE}'">Jogar</button>
      </div>
    `;
    gameList.appendChild(gameItem);
  });
}

searchBox.addEventListener('input', () => {
  const filtro = searchBox.value.toLowerCase();
  const filtrados = allGames.filter(r => r.fields.NAME.toLowerCase().includes(filtro));
  renderGames(filtrados);
});

function incrementLike(id, likes) {
  fetch(`${AIRTABLE_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: AUTH_HEADER,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields: { LIKE: likes + 1 } })
  }).then(() => location.reload());
}

function incrementDeslike(id, dislikes) {
  fetch(`${AIRTABLE_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: AUTH_HEADER,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields: { DESLIKE: dislikes + 1 } })
  }).then(() => location.reload());
}

// Início
fetchGames();
