const AIRTABLE_API_TOKEN = "patfdnvMpc0CjxTPu.4730edeb9e10f3642856770bc3c33291d2bef410d7d5faf6becf89a9d2c835ee";

const AIRTABLE_VIDEOS_URL = "https://api.airtable.com/v0/appWQBWvOA36q97b3/Videos";
const AIRTABLE_PDFS_URL = "https://api.airtable.com/v0/appWQBWvOA36q97b3/Pdfs";
const AIRTABLE_JOGOS_URL = "https://api.airtable.com/v0/appWQBWvOA36q97b3/Jogos";

function criarCardVideo(video) {
  const div = document.createElement("div");
  div.className = "video-item";
  div.innerHTML = `
    <iframe src="${video.url}" allowfullscreen></iframe>
    <div class="video-info">
      <strong title="${video.title}">${video.title}</strong>
    </div>
  `;
  return div;
}

function gerarLinkDownloadDireto(url) {
  const match = url.match(/\/d\/([^/]+)\//);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  return url; // fallback se não for formato esperado
}

function criarCardPDF(pdf) {
  const div = document.createElement("div");
  div.className = "pdf-item";
  div.innerHTML = `
    <img src="${pdf.img}" alt="${pdf.title}" onerror="this.onerror=null;this.src='https://i.postimg.cc/0jMLp8rW/9788521635451.jpg';" />
    <div class="pdf-info">
      <strong>${pdf.title}</strong>
      <a href="${gerarLinkDownloadDireto(pdf.url)}" class="button" target="_blank" rel="noopener noreferrer">Download</a>
      </div>
  `;
  return div;
}

async function carregarVideos() {
  const response = await fetch(AIRTABLE_VIDEOS_URL + "?view=Grid%20view", {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_TOKEN}`
    }
  });
  if (!response.ok) return;

  const data = await response.json();
  const videos = data.records.map(rec => ({
    title: rec.fields.TITLE || "Sem título",
    url: (rec.fields.URL || "").replace("watch?v=", "embed/")
  }));

  const primeiros4 = videos.slice(0, 4);
  const container = document.getElementById("video-track");

  primeiros4.forEach(video => {
    container.appendChild(criarCardVideo(video));
  });
}

async function carregarPDFs() {
  const response = await fetch(AIRTABLE_PDFS_URL + "?view=Grid%20view", {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_TOKEN}`
    }
  });
  if (!response.ok) return;

  const data = await response.json();
  const pdfs = data.records.map(rec => ({
    title: rec.fields.NAME || "Sem título",
    url: rec.fields.URL || "#",
    img: rec.fields.IMAGE || "https://i.postimg.cc/0jMLp8rW/9788521635451.jpg"
  }));

  const primeiros4 = pdfs.slice(0, 8);
  const container = document.getElementById("pdf-track");

  primeiros4.forEach(pdf => {
    container.appendChild(criarCardPDF(pdf));
  });


}

async function carregarJogos() {
  const response = await fetch(AIRTABLE_JOGOS_URL + "?view=Grid%20view", {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_TOKEN}`,
    },
  });

  if (!response.ok) return;

  const data = await response.json();
  const jogos = data.records;

  const primeiros4 = jogos.slice(0, 4);
  const container = document.getElementById("game-track");

  primeiros4.forEach((record) => {
    const { URL, NAME, LIKE, DESLIKE, PAGE } = record.fields;

    const div = document.createElement("div");
    div.className = "video-item";
    div.innerHTML = `
      <img src="${URL}" alt="${NAME}" style="width: 100%; height: 128px; object-fit: cover; border-radius: 8px; margin-bottom: 0.5em;">
      <div class="video-info">
        <strong>${NAME}</strong>
        <button class="xuba-play-button" onclick="window.location.href='${PAGE}'">Jogar</button>
      </div>
    `;
    container.appendChild(div);
  });
}

carregarVideos();
carregarPDFs();
carregarJogos();
