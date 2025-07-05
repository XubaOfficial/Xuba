const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const radius = 160;

const maxChances = 3;
let chancesRestantes = maxChances;
let chancesUsadas = 0;

let angleGray = 0;
let angleGreen = 0;
let angleBetween = 0;

const storageKey = 'jogoAnguloEstado';
const storageDateKey = 'jogoAnguloData';

function dataAtual() {
  const now = new Date();
  return now.toISOString().slice(0,10); // yyyy-mm-dd
}

function salvarEstado() {
  const estado = {
    angleGray,
    angleGreen,
    angleBetween,
    chancesRestantes,
  };
  localStorage.setItem(storageKey, JSON.stringify(estado));
  localStorage.setItem(storageDateKey, dataAtual());
}

function carregarEstado() {
  const hoje = dataAtual();
  const dataSalva = localStorage.getItem(storageDateKey);

  if (dataSalva === hoje) {
    const estado = JSON.parse(localStorage.getItem(storageKey));
    if (estado) {
      angleGray = estado.angleGray;
      angleGreen = estado.angleGreen;
      angleBetween = estado.angleBetween;
      chancesRestantes = estado.chancesRestantes;
      chancesUsadas = maxChances - chancesRestantes;
      atualizarTentativas();
      if (chancesRestantes <= 0) bloquearInputs();
      desenhar();
      return;
    }
  }
  chancesRestantes = maxChances;
  chancesUsadas = 0;
  gerarAngulos();
  salvarEstado();
  atualizarTentativas();
  desenhar();
}

function gerarAngulos() {
  angleGray = Math.floor(Math.random() * 360);
  angleGreen = Math.floor(Math.random() * 360);
  angleBetween = calcularMenorAngulo(angleGray, angleGreen);
}

function calcularMenorAngulo(a1, a2) {
  let diff = Math.abs(a1 - a2);
  return diff > 180 ? 360 - diff : diff;
}

function desenhar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  const grayRad = (angleGray * Math.PI) / 180;
  const grayX = cx + radius * Math.cos(grayRad);
  const grayY = cy - radius * Math.sin(grayRad);

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(grayX, grayY);
  ctx.strokeStyle = 'rgba(153,153,153,0.8)';
  ctx.lineWidth = 3;
  ctx.stroke();

  const greenRad = (angleGreen * Math.PI) / 180;
  const greenX = cx + radius * Math.cos(greenRad);
  const greenY = cy - radius * Math.sin(greenRad);

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(greenX, greenY);
  ctx.strokeStyle = '#00bfa5';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Arco para representar o ângulo
  const arcRadius = 50;
  const adjustedGrayRad = (2 * Math.PI) - grayRad;
  const adjustedGreenRad = (2 * Math.PI) - greenRad;

  let startAngle = adjustedGrayRad;
  let endAngle = adjustedGreenRad;

  if ((endAngle - startAngle + 2 * Math.PI) % (2 * Math.PI) > Math.PI) {
    [startAngle, endAngle] = [endAngle, startAngle];
  }

  ctx.beginPath();
  ctx.strokeStyle = '#ff9800';
  ctx.lineWidth = 5;
  ctx.arc(cx, cy, arcRadius, startAngle, endAngle, false);
  ctx.stroke();
}

function atualizarTentativas() {
  const elem = document.getElementById('tentativas');
  elem.textContent = `Tentativas: ${chancesUsadas}/${maxChances}`;
}

function bloquearInputs() {
  document.getElementById('guess').disabled = true;
  document.querySelector('button[onclick="verificarResposta()"]').disabled = true;
}

function criarContainerPalpite(palpite, indicador) {
  const container = document.createElement('div');
  container.style.marginTop = '8px';
  container.style.padding = '8px 12px';
  container.style.border = '1px solid #ddd';
  container.style.borderRadius = '6px';
  container.style.fontSize = '1.1rem';
  container.style.display = 'flex';
  container.style.justifyContent = 'space-between';
  container.style.alignItems = 'center';
  container.style.backgroundColor = '#fefefe';

  const texto = document.createElement('span');
  texto.textContent = `Palpite: ${palpite}°`;

  const indicadorEl = document.createElement('span');
  indicadorEl.style.fontSize = '1.5rem';

  // Indicadores visuais: 
  // "🔥" se acertou (exatamente)
  // "🔼" se palpite menor que ânguloBetween (mais pra cima)
  // "🔽" se palpite maior que ânguloBetween (mais pra baixo)
  indicadorEl.textContent = indicador;

  container.appendChild(texto);
  container.appendChild(indicadorEl);

  const listaPalpites = document.getElementById('lista-palpites');
  listaPalpites.appendChild(container);
}

function verificarResposta() {
  const userGuess = parseFloat(document.getElementById('guess').value);
  const feedback = document.getElementById('feedback');

  if (chancesRestantes <= 0) {
    feedback.textContent = `Suas 3 chances diárias acabaram. Volte amanhã para tentar novamente.`;
    feedback.style.color = '#f44336';
    return;
  }

  if (isNaN(userGuess) || userGuess < 0 || userGuess > 180) {
    feedback.textContent = 'Digite um número válido entre 0 e 180!';
    feedback.style.color = '#f44336';
    return;
  }

  chancesRestantes--;
  chancesUsadas++;
  salvarEstado();
  atualizarTentativas();

  let indicador = '';
  const diff = Math.abs(userGuess - angleBetween);

  if (diff === 0 || Math.round(userGuess) === Math.round(angleBetween)) {
    indicador = '🎉'; // Acertou
    feedback.textContent = `Parabéns! Você acertou o ângulo de ${angleBetween.toFixed(1)}°.`;
    feedback.style.color = '#00bfa5';
    bloquearInputs();
  } else if (diff <= 5) {
    indicador = '🥵'; // Quente
    feedback.textContent = '';
  } else if (userGuess < angleBetween) {
    indicador = '🔼'; // Mais pra cima
    feedback.textContent = '';
  } else {
    indicador = '🔽'; // Mais pra baixo
    feedback.textContent = '';
  }

  criarContainerPalpite(userGuess, indicador);

  document.getElementById('guess').value = '';

  if (chancesRestantes === 0 && !(diff === 0 || Math.round(userGuess) === Math.round(angleBetween))) {
    feedback.textContent = `Suas chances acabaram. O ângulo correto era ${angleBetween.toFixed(1)}°. Volte amanhã para tentar novamente.`;
    feedback.style.color = '#f44336';
    bloquearInputs();
  }
}

// Iniciar o jogo carregando estado salvo ou criando novo
carregarEstado();
