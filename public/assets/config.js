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

  // Vídeos. Basta COLAR O LINK DO YOUTUBE aqui — qualquer formato serve
  // (youtube.com/watch?v=..., youtu.be/..., ou só o ID de 11 caracteres).
  // A página monta sozinha o player, no domínio sem cookies e sem sugerir
  // vídeos de outros canais no final.
  //
  // Use vídeos NÃO LISTADOS: não aparecem na busca nem no canal, mas
  // quem tiver o link assiste. É o mesmo nível de proteção de antes.
  //
  // Também aceita caminho de .mp4 no próprio servidor ou URL de player
  // (Panda Video), caso um dia mude.
  videos: {
    "aula-experimental": "https://youtu.be/JanSOYuSLYE",
    "apresentacao-material": "https://youtu.be/TBEibl8zOz4"
  },

  // WhatsApp do comercial (somente números, com 55 e DDD). CONFIRMAR o número antes de publicar.
  whatsapp: "5581994867640",

  // Link da página da Eccoprime Academy no site
  linkAcademy: "https://editoraeccoprime.com.br/"
};
