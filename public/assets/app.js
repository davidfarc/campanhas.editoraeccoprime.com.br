(function () {
  var C = window.SEE_CONFIG || {};

  /* ---------- Página do formulário ---------- */
  var form = document.getElementById("form-lead");
  if (form) {
    // UTMs e página de origem em campos ocultos
    var q = new URLSearchParams(location.search);
    ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach(function (k) {
      var el = form.querySelector('[name="' + k + '"]');
      if (el) el.value = q.get(k) || "";
    });
    var pg = form.querySelector('[name="pagina"]');
    if (pg) pg.value = location.href;

    // Máscara do WhatsApp: (81) 99999-9999
    var wa = form.querySelector('[name="whatsapp"]');
    wa.addEventListener("input", function () {
      var d = wa.value.replace(/\D/g, "").slice(0, 11);
      var o = d;
      if (d.length > 2) o = "(" + d.slice(0, 2) + ") " + d.slice(2);
      if (d.length > 7) o = "(" + d.slice(0, 2) + ") " + d.slice(2, d.length - 4) + "-" + d.slice(-4);
      wa.value = o;
    });

    var erro = document.getElementById("form-erro");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      erro.classList.remove("on");
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (wa.value.replace(/\D/g, "").length < 10) {
        erro.textContent = "Confira o WhatsApp com DDD.";
        erro.classList.add("on"); wa.focus(); return;
      }
      var dados = {};
      new FormData(form).forEach(function (v, k) { dados[k] = v; });
      dados.whatsapp_numeros = "55" + wa.value.replace(/\D/g, "");
      dados.consentimento = form.consentimento.checked ? "sim" : "não";
      dados.enviado_em = new Date().toISOString();

      var destino = form.getAttribute("data-redirect");
      var slug = location.pathname.split("/").filter(Boolean).pop() || "";
      var btn = form.querySelector("button[type=submit]");
      btn.disabled = true;

      try { sessionStorage.setItem("see_lead_nome", (dados.nome || "").split(" ")[0]); } catch (x) {}

      if (!C.endpoint) { // modo de teste
        console.warn("SEE_CONFIG.endpoint vazio: dados não enviados", dados);
        console.warn("Modo de teste: nenhuma conversão é contada.");
        location.href = destino; return;
      }
      var opts = { method: "POST" };
      if (C.formato === "form") {
        opts.headers = { "Content-Type": "application/x-www-form-urlencoded" };
        opts.body = new URLSearchParams(dados).toString();
      } else {
        opts.headers = { "Content-Type": "application/json" };
        opts.body = JSON.stringify(dados);
      }
      fetch(C.endpoint, opts)
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          // Marca o envio aceito. So aqui: e isso que libera a conversao na
          // pagina do video. No clique do botao, nunca.
          try { sessionStorage.setItem("see_lead_ok", slug); } catch (x) {}
          location.href = destino;
        })
        .catch(function () {
          btn.disabled = false;
          erro.textContent = "Não conseguimos enviar agora. Tente de novo em instantes.";
          erro.classList.add("on");
        });
    });
  }

  /* ---------- Página do vídeo ---------- */
  /* Aceita link do YouTube em qualquer formato (watch, youtu.be, embed,
     shorts, live) ou só o ID de 11 caracteres. Devolve a URL de embed
     no domínio sem cookies, sem vídeos sugeridos de outros canais. */
  function youtubeEmbed(src) {
    src = String(src || "");
    var m = src.match(
      /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([A-Za-z0-9_-]{11})/
    );
    var id = m ? m[1] : (/^[A-Za-z0-9_-]{11}$/.test(src) ? src : null);
    if (!id) return null;
    return "https://www.youtube-nocookie.com/embed/" + id +
           "?rel=0&modestbranding=1&playsinline=1";
  }

  var player = document.querySelector("[data-video]");
  if (player) {
    var src = (C.videos || {})[player.getAttribute("data-video")];
    var yt = youtubeEmbed(src);
    if (yt) src = yt;
    if (src && !yt && /\.mp4(\?|$)/i.test(src)) {
      var v = document.createElement("video");
      v.src = src; v.controls = true; v.playsInline = true; v.preload = "metadata";
      v.poster = src.replace(/\.mp4(\?.*)?$/i, ".jpg");
      v.setAttribute("controlsList", "nodownload");
      v.oncontextmenu = function () { return false; };
      v.style.cssText = "position:absolute;inset:0;width:100%;height:100%;background:#000";
      player.innerHTML = ""; player.appendChild(v);
    } else if (src) {
      var f = document.createElement("iframe");
      f.src = src;
      f.title = player.getAttribute("data-titulo") || "Vídeo";
      f.allow = "accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      player.innerHTML = ""; player.appendChild(f);
    }
    var nome = "";
    try { nome = sessionStorage.getItem("see_lead_nome") || ""; } catch (x) {}
    var oi = document.getElementById("saudacao");
    if (oi && nome) oi.textContent = nome + ", sua " + oi.getAttribute("data-item") + " está liberada.";
  }

  document.querySelectorAll("[data-whatsapp]").forEach(function (a) {
    a.href = "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(a.getAttribute("data-whatsapp"));
  });
  document.querySelectorAll("[data-academy]").forEach(function (a) { a.href = C.linkAcademy; });
})();
