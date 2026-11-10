/* =========================================================
   PIXELS E TAGS
   Instalação direta (sem contêiner do GTM), igual à landing de matrículas.
   Lê window.SEE_CONFIG.tags — o que estiver vazio não carrega.
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

  /* ---------- Google Analytics 4 + Google Ads ---------- */
  var base = T.ga4Id || T.googleAdsId;
  if (base) {
    script("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(base));
    gtag("js", new Date());
    if (T.ga4Id) gtag("config", T.ga4Id);
    if (T.googleAdsId) gtag("config", T.googleAdsId);
  }

  /* ---------- Meta Pixel (os três pixels da escola) ---------- */
  var pixels = T.metaPixelIds || (T.metaPixelId ? [T.metaPixelId] : []);
  if (pixels.length) {
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
    (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    pixels.forEach(function (id) { window.fbq("init", String(id)); });
    window.fbq("track", "PageView");
  }

  /* ---------- Microsoft Clarity ---------- */
  if (T.clarityId) {
    /* eslint-disable */
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", T.clarityId);
    /* eslint-enable */
  }

  /* ---------- Google Tag Manager (só se abandonarmos a instalação direta) ---------- */
  if (T.gtmId) {
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    script("https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(T.gtmId));
  }

  /* ---------- Identificador do evento (dedup com a API de Conversões) ---------- */
  function novoId() {
    try {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    } catch (x) {}
    return "see-" + Date.now() + "-" + Math.random().toString(16).slice(2, 10);
  }

  var SEE_TAGS = {
    evento: function (nome, params) {
      params = params || {};
      window.dataLayer.push(Object.assign({ event: nome }, params));
      if (T.ga4Id) gtag("event", nome, params);
    },

    /* Conversão: a página do vídeo é a página de agradecimento */
    conversao: function (origem) {
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
      if (window.clarity) {
        try { window.clarity("set", "lead", origem); } catch (x) {}
      }
    }
  };
  window.SEE_TAGS = SEE_TAGS;

  /* ---------- Disparo na página do vídeo (= página de agradecimento) ----------
     A marca é consumida e apagada: recarregar a página ou abrir o link direto
     não conta conversão. Mesma regra da landing de matrículas.                  */
  var player = document.querySelector("[data-video]");
  if (player) {
    var origem = player.getAttribute("data-video");
    var enviou = false;
    try {
      enviou = sessionStorage.getItem("see_lead_ok") === origem;
      if (enviou) sessionStorage.removeItem("see_lead_ok");
    } catch (x) {}
    if (enviou || T.conversaoSomenteAposFormulario === false) {
      SEE_TAGS.conversao(origem);
    }
  }
})();
