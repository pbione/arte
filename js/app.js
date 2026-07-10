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
      siteTitle: "p.bione — arte autoral",
      siteDescription: "p.bione — galeria de arte autoral. Original artworks by p.bione.",
      clickInfo: "clique para mais info",
      openArtwork: "abrir detalhes da obra",
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
      fSuccess: "Seu aplicativo de e-mail deve abrir com a mensagem pronta.",
      fFallback: "Se isso não acontecer, envie manualmente para:",
      fFallbackLink: "abrir e-mail",
      fMailError: "Não foi possível preparar o e-mail agora. Use o endereço abaixo para entrar em contato:",
      mailSubject: "Contato pelo site p.bione"
    },
    en: {
      siteTitle: "p.bione — original art",
      siteDescription: "p.bione — original art gallery. Original artworks by p.bione.",
      clickInfo: "click for more info",
      openArtwork: "open artwork details",
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
      fSuccess: "Your e-mail app should open with the message ready to send.",
      fFallback: "If it does not open, please contact the artist manually at:",
      fFallbackLink: "open e-mail",
      fMailError: "We could not prepare the e-mail right now. Please use the address below to get in touch:",
      mailSubject: "Contact via p.bione website"
    }
  };

  var STRIPE_PREFIX = "https://buy.stripe.com/";
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var state = {
    lang: "pt",
    serie: null, // null = todas
    lastFocus: null,
    activeArtwork: null
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

  /**
   * Bloqueia qualquer origem que não seja um caminho relativo local.
   *
   * Threat model: `OBRAS` é conteúdo editável. Se aceitássemos `javascript:`,
   * `data:` ou URLs externas aqui, um valor malicioso poderia executar script,
   * vazar dados do visitante ou carregar rastreadores remotos. Por isso as
   * imagens ficam restritas a arquivos locais dentro do próprio site.
   */
  function safeImageSrc(src) {
    // Só caminhos relativos locais (ex: images/foo.jpg).
    if (typeof src !== "string") return "";
    var s = src.trim();
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s)) return ""; // bloqueia qualquer esquema (http:, javascript:, data:...)
    if (s.indexOf("//") === 0 || s.indexOf("..") !== -1) return "";
    return s;
  }

  /**
   * Aceita apenas candidatos de `srcset` com caminhos relativos locais.
   *
   * Threat model: `srcset` também aceita URLs arbitrárias. Validamos cada
   * candidato individualmente para impedir imagens remotas ou esquemas
   * executáveis vindos do conteúdo editável.
   */
  function safeSrcset(srcset) {
    if (typeof srcset !== "string") return "";
    return srcset.split(",").map(function (part) {
      var chunk = part.trim();
      if (!chunk) return "";
      var pieces = chunk.split(/\s+/);
      var safe = safeImageSrc(pieces[0]);
      if (!safe) return "";
      return safe + (pieces[1] ? " " + pieces[1] : "");
    }).filter(Boolean).join(", ");
  }

  /**
   * Links de compra só podem apontar para o domínio público do Stripe.
   *
   * Threat model: `stripeLink` também é conteúdo editável. Sem esta checagem,
   * alguém poderia trocar o botão de compra por um link de phishing ou por
   * outro destino capaz de capturar dados do visitante.
   */
  function safeStripeLink(url) {
    if (typeof url !== "string") return "";
    var u = url.trim();
    return u.indexOf(STRIPE_PREFIX) === 0 ? u : "";
  }

  function absoluteUrl(path) {
    if (!path) return "";
    try {
      return new URL(path, window.location.href).href;
    } catch (e) {
      return String(path);
    }
  }

  function buildFallbackSrcset(src, widths) {
    if (!src) return "";
    return widths.map(function (width) {
      return src + " " + width + "w";
    }).join(", ");
  }

  function imageSize(obra) {
    var width = Number(obra && obra.imagemLargura);
    var height = Number(obra && obra.imagemAltura);
    if (isFinite(width) && width > 0 && isFinite(height) && height > 0) {
      return { width: Math.round(width), height: Math.round(height) };
    }
    var matches = typeof obra.dimensoes === "string" ? obra.dimensoes.match(/(\d+(?:[.,]\d+)?)/g) : null;
    if (matches && matches.length >= 2) {
      width = Number(matches[0].replace(",", "."));
      height = Number(matches[1].replace(",", "."));
      if (isFinite(width) && width > 0 && isFinite(height) && height > 0) {
        return { width: Math.round(width * 10), height: Math.round(height * 10) };
      }
    }
    // Conservative portrait fallback to reserve space when the artwork data
    // does not declare image dimensions or physical dimensions.
    return { width: 800, height: 1000 };
  }

  function imageData(obra, widths) {
    var src = safeImageSrc(obra.imagem);
    var fallbackSrcset = safeSrcset(obra.imagemSrcset) || buildFallbackSrcset(src, widths);
    var webpSrcset = safeSrcset(obra.imagemWebpSrcset);
    if (!webpSrcset) {
      var webpSrc = safeImageSrc(obra.imagemWebp);
      if (webpSrc) webpSrcset = buildFallbackSrcset(webpSrc, widths);
    }
    return {
      src: src,
      srcset: fallbackSrcset,
      webpSrcset: webpSrcset,
      size: imageSize(obra)
    };
  }

  function applyPicture(sourceEl, img, obra, options) {
    var widths = options.widths || [320, 640, 960];
    var data = imageData(obra, widths);
    img.src = data.src;
    img.srcset = data.srcset;
    img.sizes = options.sizes;
    img.width = data.size.width;
    img.height = data.size.height;
    img.loading = options.loading;
    img.decoding = "async";

    if (data.webpSrcset) {
      sourceEl.srcset = data.webpSrcset;
      sourceEl.sizes = options.sizes;
      sourceEl.type = "image/webp";
    } else {
      sourceEl.removeAttribute("srcset");
      sourceEl.removeAttribute("sizes");
    }
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

  function artworkById(id) {
    return validObras().filter(function (obra) {
      return typeof obra.id === "string" && obra.id === id;
    })[0] || null;
  }

  function pageUrl(obra) {
    var url = window.location.pathname;
    if (obra && typeof obra.id === "string") {
      return url + "?obra=" + encodeURIComponent(obra.id);
    }
    return url;
  }

  function updateAddressBar(obra) {
    if (!window.history || typeof window.history.replaceState !== "function") return;
    try {
      window.history.replaceState(null, "", pageUrl(obra));
    } catch (e) { /* history unavailable */ }
  }

  function setMetaContent(id, content) {
    var el = $(id);
    if (el) el.setAttribute("content", content);
  }

  function applyPageMeta(obra) {
    var title = t("siteTitle");
    var description = t("siteDescription");
    var image = absoluteUrl("images/logo.svg");
    var url = absoluteUrl(pageUrl(null));

    if (obra) {
      title = localized(obra.titulo) + " — p.bione";
      description = localized(obra.descricao) || description;
      image = absoluteUrl(safeImageSrc(obra.imagem)) || image;
      url = absoluteUrl(pageUrl(obra)) || url;
    }

    document.title = title;
    var metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute("content", description);
    setMetaContent("meta-og-title", title);
    setMetaContent("meta-og-description", description);
    setMetaContent("meta-og-image", image);
    setMetaContent("meta-og-url", url);
    setMetaContent("meta-twitter-title", title);
    setMetaContent("meta-twitter-description", description);
    setMetaContent("meta-twitter-image", image);
    var canonical = $("meta-canonical");
    if (canonical) canonical.setAttribute("href", url);
  }

  function applyUiMetadata() {
    applyPageMeta(state.activeArtwork);
  }

  function artworkFromLocation() {
    try {
      var params = new URLSearchParams(window.location.search);
      return artworkById(params.get("obra"));
    } catch (e) {
      return null;
    }
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
    var canHover = window.matchMedia && window.matchMedia("(hover: hover)").matches;
    gallery.classList.toggle("has-hover", !!canHover);

    validObras().forEach(function (obra) {
      if (state.serie && localized(obra.serie) !== state.serie) return;

      var card = document.createElement("button");
      card.type = "button";
      card.className = "artwork-card";
      card.setAttribute("aria-label", localized(obra.titulo) + " — " + t("openArtwork"));

      var picture = document.createElement("picture");
      var webpSource = document.createElement("source");
      webpSource.type = "image/webp";
      picture.appendChild(webpSource);

      var img = document.createElement("img");
      img.alt = localized(obra.titulo);
      applyPicture(webpSource, img, obra, {
        widths: [240, 480, 960],
        sizes: "(max-width: 760px) calc(100vw - 2.4rem), (max-width: 1180px) 300px, 300px",
        loading: "lazy"
      });
      picture.appendChild(img);
      card.appendChild(picture);

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
    state.activeArtwork = obra;

    var webp = $("artwork-webp");
    var img = $("artwork-img");
    img.alt = localized(obra.titulo);
    applyPicture(webp, img, obra, {
      widths: [480, 960, 1440],
      sizes: "(max-width: 760px) calc(100vw - 2.8rem), 50vw",
      loading: "eager"
    });

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

    applyPageMeta(obra);
    updateAddressBar(obra);
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
    if (EMAIL_RE.test(email)) {
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
    state.activeArtwork = null;
    ["artwork-modal", "about-panel", "contact-panel"].forEach(function (id) {
      $(id).hidden = true;
    });
    document.body.style.overflow = "";
    applyUiMetadata();
    updateAddressBar(null);
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

  function resetContactFeedback() {
    $("form-error").hidden = true;
    $("form-success").hidden = true;
    $("form-fallback").hidden = true;
  }

  function artistEmail() {
    var artista = (window.ARTISTA && typeof window.ARTISTA === "object") ? window.ARTISTA : {};
    var email = typeof artista.email === "string" ? artista.email.trim() : "";
    return EMAIL_RE.test(email) ? email : "";
  }

  function prepareMailtoUrl(to, body) {
    return "mailto:" + encodeURIComponent(to).replace(/%40/g, "@") +
      "?subject=" + encodeURIComponent(t("mailSubject")) +
      "&body=" + encodeURIComponent(body);
  }

  function showContactFallback(message, mailtoUrl, email) {
    $("form-fallback-text").textContent = message + " ";
    var link = $("form-fallback-link");
    link.textContent = t("fFallbackLink");
    if (mailtoUrl) {
      link.href = mailtoUrl;
      link.hidden = false;
    } else {
      link.hidden = true;
      link.removeAttribute("href");
    }
    $("form-fallback-email").textContent = email;
    $("form-fallback").hidden = false;
  }

  function initContactForm() {
    var form = $("contact-form");

    contactFields().forEach(function (el) {
      el.addEventListener("input", function () {
        resetContactFeedback();
        refreshSendBtn();
      });
    });
    $("f-consent").addEventListener("change", function () {
      resetContactFeedback();
      refreshSendBtn();
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var errorEl = $("form-error");
      if (!contactFormValid()) {
        resetContactFeedback();
        errorEl.textContent = t("fError");
        errorEl.hidden = false;
        return;
      }
      resetContactFeedback();

      // Sem servidor: envia abrindo o app de e-mail do visitante (mailto).
      // Veja no README como trocar por um serviço de formulários (ex: Formspree).
      var to = artistEmail();
      if (!to) {
        errorEl.textContent = t("fMailError");
        errorEl.hidden = false;
        showContactFallback(t("fMailError"), "", "");
        return;
      }

      var body =
        t("fName") + ": " + $("f-nome").value.trim() + "\n" +
        t("fPhone") + ": " + $("f-celular").value.trim() + "\n" +
        t("fEmail") + ": " + $("f-email").value.trim() + "\n" +
        t("fCountry") + ": " + $("f-pais").value.trim() + "\n\n" +
        t("fMessage") + ":\n" + $("f-mensagem").value.trim() + "\n\n" +
        "[" + t("fConsent") + "]";

      var mailtoUrl = prepareMailtoUrl(to, body);
      try {
        window.location.href = mailtoUrl;
        $("form-success").textContent = t("fSuccess");
        $("form-success").hidden = false;
        showContactFallback(t("fFallback"), mailtoUrl, to);
      } catch (e) {
        errorEl.textContent = t("fMailError");
        errorEl.hidden = false;
        showContactFallback(t("fMailError"), mailtoUrl, to);
      }

      form.reset();
      refreshSendBtn();
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
    resetContactFeedback();
    $("contact-btn").setAttribute("aria-label", t("contactTooltip"));
  }

  /* ---------- Idioma ---------- */
  function applyLang() {
    document.documentElement.lang = t("htmlLang");
    $("lang-toggle").textContent = t("langBtn");
    $("about-btn-label").textContent = t("aboutLabel");
    $("about-btn").setAttribute("aria-label", t("aboutLabel"));
    $("footer-note").textContent = t("footer");
    $("terms-link").textContent = t("terms");
    applyContactLang();
    fillAbout();
    renderAll();
    applyUiMetadata();
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
      resetContactFeedback();
      openOverlay("contact-panel");
    });

    initTopbar();
    initContactForm();

    $("lang-toggle").addEventListener("click", toggleLang);

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") closeOverlays();
    });

    applyLang();

    var linkedArtwork = artworkFromLocation();
    if (linkedArtwork) openArtwork(linkedArtwork);
  });
})();
