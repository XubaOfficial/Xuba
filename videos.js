const videoList = document.getElementById("video-list");
const searchBox = document.getElementById("search-box");

const AIRTABLE_API_URL = "https://api.airtable.com/v0/appWQBWvOA36q97b3/Videos";
const AIRTABLE_API_TOKEN = "patfdnvMpc0CjxTPu.4730edeb9e10f3642856770bc3c33291d2bef410d7d5faf6becf89a9d2c835ee";

async function fetchVideosFromAirtable() {
  const response = await fetch(AIRTABLE_API_URL + "?view=Grid%20view", {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_TOKEN}`,
    },
  });

  if (!response.ok) {
    alert("Erro ao buscar vídeos do Airtable.");
    return [];
  }

  const data = await response.json();

  return data.records.map((rec) => {
    return {
      id: rec.id,
      title: rec.fields.TITLE || "Sem título",
      url: rec.fields.URL?.replace("watch?v=", "embed/") || "",
      likes: rec.fields.LIKE || 0,
      dislikes: rec.fields.DESLIKE || 0,
    };
  });
}

function criarCardVideo(video) {
  const div = document.createElement("div");
  const tituloExibido = limitarTitulo(video.title, 40);
  div.className = "video-item";
  div.setAttribute("data-title", video.title);
  div.setAttribute("data-id", video.id);

  div.innerHTML = `
    <iframe width="100%" height="315" src="${video.url}" frameborder="0" allowfullscreen></iframe>
    <div class="video-info">
      <strong title="${video.title}">${tituloExibido}</strong>
      <div class="buttons-like-dislike">
        <button class="button like-btn">
          <i class="fas fa-thumbs-up"></i> <span class="like-count">${video.likes}</span>
        </button>
        <button class="button dislike-btn">
          <i class="fa-solid fa-thumbs-down"></i> <span class="dislike-count">${video.dislikes}</span>
        </button>
      </div>
    </div>
  `;
  return div;
}

function exibirVideos(lista) {
  videoList.innerHTML = "";
  if (lista.length === 0) {
    videoList.innerHTML = "<p>Nenhum vídeo encontrado.</p>";
    return;
  }
  lista.forEach((video) => {
    const card = criarCardVideo(video);
    videoList.appendChild(card);
  });

  // Adiciona os eventos de curtir/descurtir
  document.querySelectorAll(".like-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!isUserLoggedIn()) {
        alert("Você precisa estar logado para dar like.");
        return;
      }
      const card = btn.closest(".video-item");
      const id = card.getAttribute("data-id");
      const countEl = btn.querySelector(".like-count");
      atualizarCampoAirtable(id, "LIKE", countEl);
    });
  });

  document.querySelectorAll(".dislike-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!isUserLoggedIn()) {
        alert("Você precisa estar logado para dar dislike.");
        return;
      }
      const card = btn.closest(".video-item");
      const id = card.getAttribute("data-id");
      const countEl = btn.querySelector(".dislike-count");
      atualizarCampoAirtable(id, "DESLIKE", countEl);
    });
  });
}

function isUserLoggedIn() {
  return !!getCurrentUser();
}

function filtrarVideos(videos) {
  const query = searchBox.value.toLowerCase().trim();
  const filtrados = videos.filter((video) =>
    video.title.toLowerCase().includes(query)
  );
  exibirVideos(filtrados);
}

async function atualizarCampoAirtable(id, campo, contadorEl) {
  // Pega o valor atual direto da tela
  const valorAtual = parseInt(contadorEl.textContent || "0");
  const novoValor = valorAtual + 1;

  const patch = await fetch(`${AIRTABLE_API_URL}/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        [campo]: novoValor,
      },
    }),
  });

  if (!patch.ok) {
    alert("Erro ao atualizar " + campo);
    return;
  }

  // Atualiza visualmente
  contadorEl.textContent = novoValor;
}

(async () => {
  const videos = await fetchVideosFromAirtable();
  exibirVideos(videos);
  searchBox.addEventListener("input", () => filtrarVideos(videos));
})();

function limitarTitulo(titulo, maxChars = 40) {
  if (titulo.length > maxChars) {
    return titulo.substring(0, maxChars - 3) + '...';
  }
  return titulo;
}
