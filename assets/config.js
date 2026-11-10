/* =========================================================
   CONFIGURAÇÃO DAS PÁGINAS (o único arquivo que precisa ser editado)
   ========================================================= */
window.SEE_CONFIG = {
  // Endereço que recebe os dados do formulário (Exact Spotter, webhook ou integração).
  // Enquanto estiver vazio, o formulário não envia nada e só redireciona (modo de teste).
  endpoint: "",

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
