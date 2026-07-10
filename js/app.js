/* ============================================================
   p.bione — lógica da galeria
   Segurança:
   - Nenhum dado dinâmico é inserido via innerHTML (anti-XSS):
     todo texto usa textContent / createElement.
   - Links de compra só são aceitos se começarem com
     https://buy.stripe.com/ (anti-adulteração).
   - Imagens só são aceitas de caminhos relativos locais.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Textos da interface (PT/EN) ---------- */
  var UI = {
    pt: {
      clickInfo: "clique para mais info",
      aboutLabel: "quem sou eu?",
      buy: "Comprar",
      sold: "Vendido",
      technique: "Técnica",
      dimensions: "Dimensões",
      year: "Ano",
      all: "Todas",
      close: "Fechar",
      footer: "© " + new Date().getFullYear() + " p.bione — todas as obras são autorais",
      langBtn: "EN",
      htmlLang: "pt-BR",
      terms: "Termos & Privacidade (PDF)",
      contactTooltip: "Contato",
      contactTitle: "Contato",
      fName: "Nome",
      fPhone: "Celular",
      fEmail: "E-mail",
      fCountry: "País",
      fMessage: "Mensagem",
      fConsent: "Confirmo que li os Termos & Privacidade e autorizo o uso dos meus dados de contato e das informações fornecidas exclusivamente para responder a esta mensagem.",
      fSend: "Enviar",
      fError: "Preencha todos os campos e marque a caixa de confirmação.",
      mailSubject: "Contato pelo site p.bione"
    },
    en: {
      clickInfo: "click for more info",
      aboutLabel: "about me",
      buy: "Buy",
      sold: "Sold",
      technique: "Technique",
      dimensions: "Dimensions",
      year: "Year",
      all: "All",
      close: "Close",
      footer: "© " + new Date().getFullYear() + " p.bione — all artworks are original",
      langBtn: "PT",
      htmlLang: "en",
      terms: "Terms & Privacy (PDF)",
      contactTooltip: "Contact",
      contactTitle: "Contact",
      fName: "Name",
      fPhone: "Phone",
      fEmail: "E-mail",
      fCountry: "Country",
      fMessage: "Message",
      fConsent: "I confirm I have read the Terms & Privacy and consent to the use of my contact details and the information provided exclusively to reply to this message.",
      fSend: "Send",
      fError: "Please fill in all fields and tick the confirmation box.",
      mailSubject: "Contact via p.bione website"
    }
  };

  var STRIPE_PREFIX = "https://buy.stripe.com/";

  var state = {
    lang: "pt",
    serie: null, // null = todas
    lastFocus: null
  };

  try {
    var saved = window.localStorage.getItem("pbione-lang");
    if (saved === "pt" || saved === "en") state.lang = saved;
  } catch (e) { /* localStorage indisponível: segue em pt */ }

  /* ---------- Helpers ---------- */
  function $(id) { return document.getElementById(id); }

  function t(key) { return UI[state.lang][key]; }

  function localized(field) {
    // Aceita string simples ou objeto {pt, en}
    if (typeof field === "string") return field;
    if (field && typeof field === "object") {
      return String(field[state.lang] || field.pt || field.en || "");
    }
    return "";
  }

  function safeImageSrc(src) {
    // Só caminhos relativos locais (ex: images/foo.jpg).
    if (typeof src !== "string") return "";
    var s = src.trim();
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s)) return ""; // bloqueia qualquer esquema (http:, javascript:, data:...)
    if (s.indexOf("//") === 0 || s.indexOf("..") !== -1) return "";
    return s;
  }

  function safeStripeLink(url) {
    if (typeof url !== "string") return "";
    var u = url.trim();
    return u.indexOf(STRIPE_PREFIX) === 0 ? u : "";
  }

  function formatPrice(value) {
    var n = Number(value);
    if (!isFinite(n) || n <= 0) return "";
    try {
      return new Intl.NumberFormat(state.lang === "pt" ? "pt-BR" : "en-US", {
        style: "currency", currency: "USD", maximumFractionDigits: 0
      }).format(n);
    } catch (e) {
      return "US$ " + n;
    }
  }

  function validObras() {
    if (!Array.isArray(window.OBRAS)) return [];
    return window.OBRAS.filter(function (o) {
      return o && typeof o === "object" && safeImageSrc(o.imagem) && localized(o.titulo);
    });
  }

  /* ---------- Séries ---------- */
  function seriesList() {
    var seen = [];
    validObras().forEach(function (o) {
      var name = localized(o.serie);
      if (name && seen.indexOf(name) === -1) seen.push(name);
    });
    return seen;
  }

  function renderSeriesNav() {
    var nav = $("series-nav");
    nav.textContent = "";
    var list = seriesList();
    if (list.length < 2) { nav.hidden = true; state.serie = null; return; }
    nav.hidden = false;

    var all = document.createElement("button");
    all.type = "button";
    all.className = "series-link";
    all.textContent = t("all");
    all.setAttribute("aria-pressed", state.serie === null ? "true" : "false");
    all.addEventListener("click", function () { state.serie = null; renderAll(); });
    nav.appendChild(all);

    list.forEach(function (name) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "series-link";
      btn.textContent = name;
      btn.setAttribute("aria-pressed", state.serie === name ? "true" : "false");
      btn.addEventListener("click", function () { state.serie = name; renderAll(); });
      nav.appendChild(btn);
    });
  }

  /* ---------- Galeria ---------- */
  function renderGallery() {
    var gallery = $("gallery");
    gallery.textContent = "";

    if (window.matchMedia && window.matchMedia("(hover: hover)").matches) {
      gallery.classList.add("has-hover");
    }

    validObras().forEach(function (obra) {
      if (state.serie && localized(obra.serie) !== state.serie) return;

      var card = document.createElement("button");
      card.type = "button";
      card.className = "artwork-card";
      card.setAttribute("aria-label", localized(obra.titulo));

      var img = document.createElement("img");
      img.src = safeImageSrc(obra.imagem);
      img.alt = localized(obra.titulo);
      img.loading = "lazy";
      card.appendChild(img);

      if (obra.vendido === true) {
        var sold = document.createElement("span");
        sold.className = "card-sold";
        sold.textContent = t("sold");
        card.appendChild(sold);
      }

      var caption = document.createElement("span");
      caption.className = "card-caption";
      caption.textContent = localized(obra.titulo);
      card.appendChild(caption);

      var hint = document.createElement("span");
      hint.className = "hover-hint";
      hint.textContent = t("clickInfo");
      card.appendChild(hint);

      // Um clique já abre (duplo clique também funciona naturalmente)
      card.addEventListener("click", function () { openArtwork(obra, card); });

      gallery.appendChild(card);
    });
  }

  /* ---------- Janela flutuante da obra ---------- */
  function openArtwork(obra, trigger) {
    state.lastFocus = trigger || document.activeElement;

    var img = $("artwork-img");
    img.src = safeImageSrc(obra.imagem);
    img.alt = localized(obra.titulo);

    $("artwork-title").textContent = localized(obra.titulo);
    $("artwork-series").textContent = localized(obra.serie);
    $("artwork-desc").textContent = localized(obra.descricao);

    $("spec-technique-label").textContent = t("technique");
    $("spec-technique").textContent = localized(obra.tecnica);
    $("spec-dimensions-label").textContent = t("dimensions");
    $("spec-dimensions").textContent = typeof obra.dimensoes === "string" ? obra.dimensoes : "";
    $("spec-year-label").textContent = t("year");
    $("spec-year").textContent = obra.ano ? String(obra.ano) : "";

    $("artwork-price").textContent = formatPrice(obra.preco);

    var buy = $("buy-btn");
    var soldBadge = $("sold-badge");
    var link = safeStripeLink(obra.stripeLink);

    if (obra.vendido === true) {
      buy.hidden = true;
      buy.removeAttribute("href");
      soldBadge.textContent = t("sold");
      soldBadge.hidden = false;
    } else if (link) {
      buy.href = link;
      buy.textContent = t("buy");
      buy.hidden = false;
      soldBadge.hidden = true;
    } else {
      buy.hidden = true;
      buy.removeAttribute("href");
      soldBadge.hidden = true;
    }

    openOverlay("artwork-modal");
  }

  /* ---------- Painel sobre ---------- */
  function fillAbout() {
    var artista = (window.ARTISTA && typeof window.ARTISTA === "object") ? window.ARTISTA : {};
    $("about-bio").textContent = localized(artista.bio);

    // Foto de perfil (moldura redonda) — mesma validação de segurança das obras
    var foto = $("about-foto");
    var fotoSrc = safeImageSrc(artista.foto);
    if (fotoSrc) {
      foto.src = fotoSrc;
      foto.hidden = false;
    } else {
      foto.hidden = true;
      foto.removeAttribute("src");
    }

    var ig = $("about-instagram");
    var igUrl = typeof artista.instagram === "string" ? artista.instagram.trim() : "";
    if (igUrl.indexOf("https://instagram.com/") === 0 ||
        igUrl.indexOf("https://www.instagram.com/") === 0) {
      ig.href = igUrl;
      ig.hidden = false;
    } else {
      ig.hidden = true;
      ig.removeAttribute("href");
    }

    var mail = $("about-email");
    var email = typeof artista.email === "string" ? artista.email.trim() : "";
    // valida formato simples de e-mail antes de montar o mailto:
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      mail.href = "mailto:" + encodeURIComponent(email).replace(/%40/g, "@");
      mail.hidden = false;
    } else {
      mail.hidden = true;
      mail.removeAttribute("href");
    }
  }

  /* ---------- Overlays ---------- */
  function openOverlay(id) {
    var overlay = $(id);
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    var closeBtn = overlay.querySelector(".close-btn");
    if (closeBtn) closeBtn.focus();
  }

  function closeOverlays() {
    ["artwork-modal", "about-panel", "contact-panel"].forEach(function (id) {
      $(id).hidden = true;
    });
    document.body.style.overflow = "";
    if (state.lastFocus && typeof state.lastFocus.focus === "function") {
      state.lastFocus.focus();
      state.lastFocus = null;
    }
  }

  function bindOverlay(id) {
    var overlay = $(id);
    overlay.addEventListener("click", function (ev) {
      // fecha ao clicar no fundo ou no X
      if (ev.target === overlay || ev.target.hasAttribute("data-close")) {
        closeOverlays();
      }
    });
  }

  /* ---------- Cabeçalho compacto ao rolar ---------- */
  function initTopbar() {
    var topbar = $("topbar");
    var ticking = false;
    function update() {
      topbar.classList.toggle("compact", window.scrollY > 60);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- Formulário de contato ---------- */
  function contactFields() {
    return [$("f-nome"), $("f-celular"), $("f-email"), $("f-pais"), $("f-mensagem")];
  }

  function contactFormValid() {
    var filled = contactFields().every(function (el) {
      return el.checkValidity() && el.value.trim() !== "";
    });
    return filled && $("f-consent").checked;
  }

  function refreshSendBtn() {
    $("send-btn").disabled = !contactFormValid();
  }

  function initContactForm() {
    var form = $("contact-form");

    contactFields().forEach(function (el) {
      el.addEventListener("input", refreshSendBtn);
    });
    $("f-consent").addEventListener("change", refreshSendBtn);

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var errorEl = $("form-error");
      if (!contactFormValid()) {
        errorEl.textContent = t("fError");
        errorEl.hidden = false;
        return;
      }
      errorEl.hidden = true;

      // Sem servidor: envia abrindo o app de e-mail do visitante (mailto).
      // Veja no README como trocar por um serviço de formulários (ex: Formspree).
      var artista = (window.ARTISTA && typeof window.ARTISTA === "object") ? window.ARTISTA : {};
      var to = typeof artista.email === "string" ? artista.email.trim() : "";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return;

      var body =
        t("fName") + ": " + $("f-nome").value.trim() + "\n" +
        t("fPhone") + ": " + $("f-celular").value.trim() + "\n" +
        t("fEmail") + ": " + $("f-email").value.trim() + "\n" +
        t("fCountry") + ": " + $("f-pais").value.trim() + "\n\n" +
        t("fMessage") + ":\n" + $("f-mensagem").value.trim() + "\n\n" +
        "[" + t("fConsent") + "]";

      window.location.href = "mailto:" + encodeURIComponent(to).replace(/%40/g, "@") +
        "?subject=" + encodeURIComponent(t("mailSubject")) +
        "&body=" + encodeURIComponent(body);

      form.reset();
      refreshSendBtn();
      closeOverlays();
    });
  }

  function applyContactLang() {
    $("contact-tooltip").textContent = t("contactTooltip");
    $("contact-title").textContent = t("contactTitle");
    $("lbl-nome").textContent = t("fName");
    $("lbl-celular").textContent = t("fPhone");
    $("lbl-email").textContent = t("fEmail");
    $("lbl-pais").textContent = t("fCountry");
    $("lbl-mensagem").textContent = t("fMessage");
    $("lbl-consent").textContent = t("fConsent");
    $("send-btn").textContent = t("fSend");
    $("form-error").hidden = true;
    $("contact-btn").setAttribute("aria-label", t("contactTooltip"));
  }

  /* ---------- Idioma ---------- */
  function applyLang() {
    document.documentElement.lang = t("htmlLang");
    $("lang-toggle").textContent = t("langBtn");
    $("about-btn-label").textContent = t("aboutLabel");
    $("footer-note").textContent = t("footer");
    $("terms-link").textContent = t("terms");
    applyContactLang();
    fillAbout();
    renderAll();
  }

  function toggleLang() {
    state.lang = state.lang === "pt" ? "en" : "pt";
    try { window.localStorage.setItem("pbione-lang", state.lang); } catch (e) { /* ok */ }
    closeOverlays();
    applyLang();
  }

  function renderAll() {
    renderSeriesNav();
    renderGallery();
  }

  /* ---------- Inicialização ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    bindOverlay("artwork-modal");
    bindOverlay("about-panel");
    bindOverlay("contact-panel");

    $("about-btn").addEventListener("click", function () {
      state.lastFocus = $("about-btn");
      openOverlay("about-panel");
    });

    $("contact-btn").addEventListener("click", function () {
      state.lastFocus = $("contact-btn");
      openOverlay("contact-panel");
    });

    initTopbar();
    initContactForm();

    $("lang-toggle").addEventListener("click", toggleLang);

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") closeOverlays();
    });

    applyLang();
  });
})();
