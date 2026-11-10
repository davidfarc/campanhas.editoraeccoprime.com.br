/* =========================================================
   PIXELS E TAGS
   Lê window.SEE_CONFIG.tags. O que estiver vazio não carrega.
   Precisa vir DEPOIS de config.js e ANTES de app.js.
   ========================================================= */
(function () {
  var C = window.SEE_CONFIG || {};
  var T = C.tags || {};

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  function script(src) {
    var s = document.createElement("script");
    s.async = true; s.src = src;
    document.head.appendChild(s);
  }

  /* ---------- Google Tag Manager ---------- */
  if (T.gtmId) {
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    script("https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(T.gtmId));
  }

  /* ---------- GA4 e Google Ads (gtag.js) ---------- */
  var primeiroGtag = T.ga4Id || T.googleAdsId;
  if (primeiroGtag) {
    script("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(primeiroGtag));
    gtag("js", new Date());
    if (T.ga4Id) gtag("config", T.ga4Id);
    if (T.googleAdsId) gtag("config", T.googleAdsId);
  }

  /* ---------- Meta Pixel ---------- */
  if (T.metaPixelId) {
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
    (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq("init", String(T.metaPixelId));
    window.fbq("track", "PageView");
  }

  /* ---------- Identificador do evento (dedup com a API de Conversões) ---------- */
  function novoId() {
    try {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    } catch (x) {}
    return "see-" + Date.now() + "-" + Math.random().toString(16).slice(2, 10);
  }

  /* ---------- API interna ---------- */
  var SEE_TAGS = {
    /* Evento comum em todas as ferramentas */
    evento: function (nome, params) {
      params = params || {};
      window.dataLayer.push(Object.assign({ event: nome }, params));
      if (T.ga4Id) gtag("event", nome, params);
    },

    /* Conversão: a página do vídeo é a página de agradecimento */
    conversao: function (origem) {
      var chave = "see_conv_" + origem;
      try { if (sessionStorage.getItem(chave)) return; } catch (x) {}

      var id = novoId();
      var dados = { lead_origem: origem, event_id: id };

      window.dataLayer.push(Object.assign({ event: "lead_confirmado" }, dados));

      if (T.ga4Id) gtag("event", "generate_lead", dados);

      var label = (T.googleAdsLabels || {})[origem];
      if (T.googleAdsId && label) {
        gtag("event", "conversion", { send_to: T.googleAdsId + "/" + label, transaction_id: id });
      }

      if (window.fbq) {
        window.fbq("track", "Lead", { content_name: origem }, { eventID: id });
      }

      try { sessionStorage.setItem(chave, id); } catch (x) {}
    }
  };
  window.SEE_TAGS = SEE_TAGS;

  /* ---------- Disparo automático na página do vídeo ---------- */
  var player = document.querySelector("[data-video]");
  if (player) {
    var origem = player.getAttribute("data-video");
    var veioDoFormulario = false;
    try { veioDoFormulario = sessionStorage.getItem("see_lead_ok") === origem; } catch (x) {}
    if (!T.conversaoSomenteAposFormulario || veioDoFormulario) {
      SEE_TAGS.conversao(origem);
    }
  }
})();
