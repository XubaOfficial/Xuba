const pdfList = document.getElementById("pdf-list");
const searchBox = document.getElementById("search-box");

// Substitua pelo seu token e base ID e table
const AIRTABLE_API_URL = "https://api.airtable.com/v0/appWQBWvOA36q97b3/Pdfs";
const AIRTABLE_API_TOKEN = "patfdnvMpc0CjxTPu.4730edeb9e10f3642856770bc3c33291d2bef410d7d5faf6becf89a9d2c835ee";

async function fetchPDFsFromAirtable() {
  const response = await fetch(AIRTABLE_API_URL + "?view=Grid%20view", {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_TOKEN}`,
    },
  });

  if (!response.ok) {
    alert("Erro ao buscar PDFs do Airtable.");
    return [];
  }

  const data = await response.json();

  // Extrai só o que interessa: nome, imagem e url
  return data.records.map((rec) => {
    return {
      title: rec.fields.NAME || "Sem título",
      url: rec.fields.URL || "#",
       downloads: rec.fields.DOWNLOADS || 0,
      img:
        rec.fields.IMAGE
          ? rec.fields.IMAGE
          : "https://i.postimg.cc/0jMLp8rW/9788521635451.jpg"
    };
  });
}

const criarCardPDF = (pdf) => {
  const div = document.createElement("div");
  div.className = "pdf-item";
  div.setAttribute("data-title", pdf.title);

  // fallback via evento onerror
  div.innerHTML = `
    <img src="${pdf.img}" alt="${pdf.title}" onerror="this.onerror=null;this.src='https://i.postimg.cc/0jMLp8rW/9788521635451.jpg';" />
    <div class="pdf-info">
      <strong>${pdf.title}</strong>
      <a href="${gerarLinkDownloadDireto(pdf.url)}" target="_blank" rel="noopener noreferrer" class="button" onclick="registrarDownload('${pdf.title}')">Download</a>
      <button onclick="compartilharPDF('${pdf.title}', '${pdf.url}')" class="button">Compartilhar</button>
      <div class="buttons-like-dislike" style="margin-top: 0.5em;">
        <span class="button" style="cursor: default;">
          <i class="fa-solid fa-download"></i> <span class="download-count">${pdf.downloads}
        </span>
      </div>
      </div>
  `;
  return div;
};

function exibirPDFs(lista) {
  pdfList.innerHTML = "";
  if (lista.length === 0) {
    pdfList.innerHTML = "<p>Nenhum PDF encontrado.</p>";
    return;
  }
  lista.forEach((pdf) => {
    pdfList.appendChild(criarCardPDF(pdf));
  });
}

function filtrarPDFs(pdfs) {
  const query = searchBox.value.toLowerCase().trim();
  const filtrados = pdfs.filter((pdf) => pdf.title.toLowerCase().includes(query));
  exibirPDFs(filtrados);
}

function compartilharPDF(titulo, url) {
  const texto = `Confira este PDF: ${titulo}\n${url}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(texto).then(() => {
      alert("Link copiado para a área de transferência!");
    });
  } else {
    alert("Seu navegador não suporta copiar para a área de transferência.");
  }
}

(async () => {
  const pdfs = await fetchPDFsFromAirtable();

  // Exibe todos inicialmente
  exibirPDFs(pdfs);

  // Pesquisa
  searchBox.addEventListener("input", () => filtrarPDFs(pdfs));
})();

async function registrarDownload(titulo) {
  // Busca o PDF correspondente
  const response = await fetch(AIRTABLE_API_URL + "?view=Grid%20view", {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_TOKEN}`
    }
  });

  if (!response.ok) {
    console.error("Erro ao buscar PDF para registrar download.");
    return;
  }

  const data = await response.json();
  const pdf = data.records.find((rec) => rec.fields.NAME === titulo);

  if (!pdf) {
    console.error("PDF não encontrado.");
    return;
  }

  const id = pdf.id;
  const atual = pdf.fields.DOWNLOADS || 0;

  // Atualiza o campo DOWNLOADS no Airtable
  await fetch(`${AIRTABLE_API_URL}/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        DOWNLOADS: atual + 1
      }
    })
  });

  // Atualiza visualmente se quiser:
  const card = document.querySelector(`[data-title="${titulo}"]`);
  if (card) {
    const span = card.querySelector(".download-count");
    if (span) {
      span.textContent = atual + 1;
    }
  }
}

function gerarLinkDownloadDireto(url) {
  const match = url.match(/\/d\/([^/]+)\//);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  return url; // fallback se não for formato esperado
}