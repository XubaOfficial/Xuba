const API_URL_PDFS = "https://api.airtable.com/v0/appWQBWvOA36q97b3/Pdfs";
const API_URL_VIDEOS = "https://api.airtable.com/v0/appWQBWvOA36q97b3/Videos";
const API_KEY = "patfdnvMpc0CjxTPu.4730edeb9e10f3642856770bc3c33291d2bef410d7d5faf6becf89a9d2c835ee";

async function carregarDashboard() {
    // Requisição PDFs
    const resPdfs = await fetch(`${API_URL_PDFS}?view=Grid%20view`, {
        headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    // Requisição Vídeos
    const resVideos = await fetch(`${API_URL_VIDEOS}?view=Grid%20view`, {
        headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    // Verifica erros
    if (!resPdfs.ok || !resVideos.ok) {
        alert("Erro ao buscar dados do Airtable");
        return;
    }

    const dataPdfs = await resPdfs.json();
    const dataVideos = await resVideos.json();

    const registrosPdfs = dataPdfs.records;
    const registrosVideos = dataVideos.records;

    const totalPDFs = registrosPdfs.length;
    const totalDownloads = registrosPdfs.reduce((soma, r) => soma + (r.fields.DOWNLOADS || 0), 0);
    const totalVideos = registrosVideos.length;
    const totalLikes = registrosVideos.reduce((soma, r) => soma + (r.fields.LIKE || 0), 0);
    const totalDeslikes = registrosVideos.reduce((soma, r) => soma + (r.fields.DESLIKE || 0), 0);

    document.getElementById("total-pdfs").textContent = totalPDFs;
    document.getElementById("total-downloads").textContent = totalDownloads.toLocaleString("pt-BR");
    document.getElementById("total-videos").textContent = totalVideos;
    document.getElementById("total-likes").textContent = totalLikes.toLocaleString("pt-BR");
    document.getElementById("total-deslikes").textContent = totalDeslikes.toLocaleString("pt-BR");

    const tabela = document.getElementById("tabela-pdfs");
    if (tabela) {
    tabela.innerHTML = "";

    // Filtra só registros com downloads válidos (não vazio, não null)
    const registrosValidos = registrosPdfs.filter(r => {
        const d = r.fields.DOWNLOADS;
        return d !== undefined && d !== null && d !== "";
    });

    // Ordena e pega top 10
    const top10 = registrosValidos
        .slice()
        .sort((a, b) => b.fields.DOWNLOADS - a.fields.DOWNLOADS)
        .slice(0, 10);

    top10.forEach((r, i) => {
        const nome = r.fields.NAME || "Sem título";
        const downloads = r.fields.DOWNLOADS || 0;

        const icone = i < 3 ? "🔥 " : "";

        const row = document.createElement("tr");
        row.innerHTML = `<td>${icone}${nome}</td><td>${downloads}</td>`;
        tabela.appendChild(row);
    });
    }
}

carregarDashboard();
