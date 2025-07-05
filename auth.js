// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCNju19r8p-F_g6r0KxrWiuxiAKiK_BJAg",
  authDomain: "xuba-e62b7.firebaseapp.com",
  projectId: "xuba-e62b7",
  storageBucket: "xuba-e62b7.firebasestorage.app",
  messagingSenderId: "537819052317",
  appId: "1:537819052317:web:9cbe3d4cd295730e6f09f4"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Referências dos elementos
const saudacao = document.querySelector(".perfil-menu h4");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const btnEntrar = document.querySelector(".perfil-menu button:nth-of-type(1)");
const btnCadastrar = document.querySelector(".perfil-menu button:nth-of-type(2)");

//Avatares perfil
const avatarImg = document.getElementById("avatar-img");
const avatarPopup = document.getElementById("avatar-popup");

// Funções
function cadastrar(email, senha) {
  return auth.createUserWithEmailAndPassword(email, senha)
    .then(userCredential => {
      const user = userCredential.user;

      // Criar nó no Realtime Database com pontuação inicial
      database.ref('users/' + user.uid).set({
        email: user.email,
        pontuacao: 0
      }).then(() => {
        alert("Cadastro realizado e dados iniciais salvos!");
        const nome = user.email.split("@")[0];
        saudacao.innerText = `Olá, ${nome}`;
        atualizarCamposAutenticacao();
        limparCampos();
      }).catch((error) => {
        console.error("Erro ao salvar dados no DB:", error);
      });
    })
    .catch(err => alert("Erro: " + err.message));
}

function logar(email, senha) {
  return auth.signInWithEmailAndPassword(email, senha)
    .then(user => {
      alert("Logado com sucesso!");
      const nome = user.user.email.split("@")[0];
      saudacao.innerText = `Olá, ${nome}`;
      atualizarCamposAutenticacao();
      limparCampos();
    })
    .catch(err => alert("Erro: " + err.message));
}

function sair() {
  auth.signOut().then(() => {
    alert("Você saiu!");
    saudacao.innerText = "Olá, Visitante";
    emailInput.value = '';
    senhaInput.value = '';
    document.getElementById("pontuacao-usuario").innerText = "0";
    atualizarCamposAutenticacao();
  });
}

function limparCampos() {
  emailInput.value = '';
  senhaInput.value = '';
}

function atualizarCamposAutenticacao() {
  const saudacaoTexto = saudacao.innerText.trim();
  const visitante = "Olá, Visitante";
  const esconder = saudacaoTexto === visitante;

  emailInput.style.display = esconder ? "block" : "none";
  senhaInput.style.display = esconder ? "block" : "none";
  btnEntrar.style.display = esconder ? "block" : "none";
  btnCadastrar.style.display = esconder ? "block" : "none";

  // Esconde a pontuação se for visitante, mostra se estiver logado
  const pontuacaoUsuario = document.getElementById("pontuacao-usuario");
  if (pontuacaoUsuario) {
    pontuacaoUsuario.style.display = esconder ? "none" : "inline-block";
  }
}

// Também mantém atualização caso usuário entre por outro meio
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    const nome = user.email.split("@")[0];
    saudacao.innerText = `Olá, ${nome}`;

    // Verifica se é o dono
    const dashboardBtn = document.getElementById("dashboard-btn");
    if (user.email === "xubaofficial@gmail.com") {
      dashboardBtn.style.display = "block";
    } else {
      dashboardBtn.style.display = "none";
    }

    // ➕ Carrega a pontuação do usuário
    const pontuacaoSpan = document.getElementById("pontuacao-usuario");
    database.ref('users/' + user.uid + '/pontuacao').once('value').then(snapshot => {
      const pontos = snapshot.val() || 0;
      pontuacaoSpan.innerText = `${pontos} pts`;
    });

  } else {
    saudacao.innerText = "Olá, Visitante";

    // Oculta o botão quando não estiver logado
    const dashboardBtn = document.getElementById("dashboard-btn");
    if (dashboardBtn) dashboardBtn.style.display = "none";
  }

  atualizarCamposAutenticacao();
});

//Avatar
avatarImg.addEventListener("click", (e) => {
  e.stopPropagation(); // Evita fechar ao clicar dentro
  avatarPopup.style.display = avatarPopup.style.display === "flex" ? "none" : "flex";
});

function selecionarAvatar(src) {
  avatarImg.src = src;
  avatarPopup.style.display = "none";
}

// Fecha popup ao clicar fora
document.addEventListener("click", (e) => {
  if (!avatarPopup.contains(e.target) && e.target !== avatarImg) {
    avatarPopup.style.display = "none";
  }
});

//Muda imagem no perfil
function selecionarAvatar(src) {
  avatarImg.src = src; // muda imagem no submenu
  const perfilBtn = document.getElementById("perfil-btn");
  perfilBtn.style.backgroundImage = `url('${src}')`; // só troca a imagem de fundo do perfil-btn
  avatarPopup.style.display = "none";
}

function getCurrentUser() {
  return firebase.auth().currentUser;
}