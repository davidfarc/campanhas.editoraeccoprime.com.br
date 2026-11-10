/* =========================================================
   CONFIGURAÇÃO DAS PÁGINAS (o único arquivo que precisa ser editado)
   ========================================================= */
window.SEE_CONFIG = {
  // Endereço que recebe os dados do formulário (Exact Spotter, webhook ou integração).
  // Enquanto estiver vazio, o formulário não envia nada e só redireciona (modo de teste).
  endpoint: "",

  // Pixels e tags. O que ficar vazio simplesmente nao carrega.
  // Instalacao direta, como na landing de matriculas: NAO usar contêiner do GTM
  // junto, senao tudo dispara em dobro.
  tags: {
    ga4Id: "G-773MYPYDRC",
    googleAdsId: "AW-827566705",

    // Rotulo da conversao do Google Ads, um por pagina (parte depois da barra).
    // Hoje os dois usam o mesmo rotulo da acao "Instrucoes" (id 755441474), que
    // ja soma os cadastros da landing de matriculas. Para separar por campanha,
    // criar acoes novas no Google Ads e trocar os rotulos aqui.
    googleAdsLabels: {
      "aula-experimental": "OCwzCMK-nOgCEPHUzooD",
      "apresentacao-material": "OCwzCMK-nOgCEPHUzooD"
    },

    // Os tres pixels da escola
    metaPixelIds: ["2893495017422005", "1107580709416779", "863714567549260"],

    clarityId: "z9imrt4i7l",

    // Contêiner do GTM. Deixar VAZIO: as tags acima ja sao instalacao direta.
    // Preencher so se um dia abandonarmos a instalacao direta.
    gtmId: "",

    // true  = so conta conversao de quem teve o envio aceito pelo servidor
    // false = qualquer visita a pagina do video conta
    conversaoSomenteAposFormulario: true
  },

  // Formato do envio: "json" (application/json) ou "form" (application/x-www-form-urlencoded)
  formato: "json",

  // Vídeos. Por padrão tocam direto da pasta /videos/ do próprio servidor.
  // Se um dia forem para o Panda Video ou YouTube, basta trocar pela URL do player (embed), ex.:
  //   "https://player-vz-XXXX.tv.pandavideo.com.br/embed/?v=XXXXXXXX"
  videos: {
    "aula-experimental": "/videos/aula-experimental.mp4",
    "apresentacao-material": "/videos/apresentacao-material.mp4"
  },

  // WhatsApp do comercial (somente números, com 55 e DDD). CONFIRMAR o número antes de publicar.
  whatsapp: "5581994867640",

  // Link da página da Eccoprime Academy no site
  linkAcademy: "https://editoraeccoprime.com.br/"
};
