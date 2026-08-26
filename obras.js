/* ============================================================
   OBRAS DE p.bione — ARQUIVO DE EDIÇÃO
   ============================================================
   Para ADICIONAR uma obra:
     1. Coloque a foto na pasta  images/  (ex: images/minha-obra.jpg)
     2. Copie um bloco { ... } abaixo, cole antes do ']' final e edite.
   Para REMOVER uma obra: apague o bloco { ... } dela (com a vírgula).
   Para marcar como VENDIDA:  vendido: true

   stripeLink: cole aqui o "Payment Link" criado no painel do Stripe.
   Ele SEMPRE começa com https://buy.stripe.com/ — links de outros
   domínios são ignorados pelo site (proteção contra adulteração).
   Deixe "" enquanto não tiver o link (o botão Comprar não aparece).

   Máximo recomendado: 15 obras por série.
   ============================================================ */

var OBRAS = [
  {
    id: "imperfeitos-02",
    serie: { pt: "Imperfeitos", en: "Imperfect" },
    titulo: { pt: "Pensamentos", en: "Thoughts" },
    descricao: {
      pt: "Pensamentos que saem à prática. Uma analogia ao pensar e transformar.",
      en: "Thoughts turning into action. An analogy between thinking and transforming."
    },
    tecnica: { pt: "Óleo sobre tela", en: "Oil on canvas" },
    dimensoes: "100 × 70 cm",
    larguraCm: 100,
    alturaCm: 70,
    ano: 2024,
    preco: 500,
    imagem: "images/pensamentos.jpg",
    stripeLink: "",
    vendido: false
  },
  {
    id: "imperfeitos-03",
    serie: { pt: "Imperfeitos", en: "Imperfect" },
    titulo: { pt: "Jardim", en: "Garden" },
    descricao: {
      pt: "Um lugar perfeito não é branco e negro; tem flores e se pode caminhar descalço.",
      en: "A perfect place isn't black and white; it has flowers and you can walk barefoot."
    },
    tecnica: { pt: "Óleo sobre tela", en: "Oil on canvas" },
    dimensoes: "200 × 90 cm",
    larguraCm: 200,
    alturaCm: 90,
    ano: 2024,
    preco: 800,
    imagem: "images/jardim.jpg",
    stripeLink: "",
    vendido: false
  },
  {
    id: "imperfeitos-06",
    serie: { pt: "Imperfeitos", en: "Imperfect" },
    titulo: { pt: "Caos", en: "Chaos" },
    descricao: {
      pt: "A ingenuidade de visitar lugares cheios de gente.",
      en: "The naivety of visiting places full of people."
    },
    tecnica: { pt: "Óleo sobre tela", en: "Oil on canvas" },
    dimensoes: "100 × 70 cm",
    larguraCm: 100,
    alturaCm: 70,
    ano: 2025,
    preco: 500,
    imagem: "images/caos-2025.jpg",
    stripeLink: "",
    vendido: false
  },
  {
    id: "imperfeitos-08",
    serie: { pt: "Imperfeitos", en: "Imperfect" },
    titulo: { pt: "Células #8", en: "Cells #8" },
    descricao: {
      pt: "Origem da vida, há muita coisa em jogo, muitos sentimentos e trajetória.",
      en: "The origin of life — so much at stake, so many feelings and paths."
    },
    tecnica: { pt: "Acrílico sobre tela", en: "Acrylic on canvas" },
    dimensoes: "70 × 50 cm",
    larguraCm: 70,
    alturaCm: 50,
    ano: 2025,
    preco: 400,
    imagem: "images/celulas-8.jpg",
    stripeLink: "",
    vendido: false
  },
  {
    id: "imperfeitos-09",
    serie: { pt: "Imperfeitos", en: "Imperfect" },
    titulo: { pt: "Células #9", en: "Cells #9" },
    descricao: {
      pt: "Origem da vida, há muita coisa em jogo, muitos sentimentos e trajetória.",
      en: "The origin of life — so much at stake, so many feelings and paths."
    },
    tecnica: { pt: "Acrílico sobre tela", en: "Acrylic on canvas" },
    dimensoes: "70 × 50 cm",
    larguraCm: 70,
    alturaCm: 50,
    ano: 2025,
    preco: 400,
    imagem: "images/celulas-9.jpg",
    stripeLink: "",
    vendido: false
  },
  {
    id: "imperfeitos-10",
    serie: { pt: "Imperfeitos", en: "Imperfect" },
    titulo: { pt: "Células #10", en: "Cells #10" },
    descricao: {
      pt: "Origem da vida, há muita coisa em jogo, muitos sentimentos e trajetória.",
      en: "The origin of life — so much at stake, so many feelings and paths."
    },
    tecnica: { pt: "Acrílico sobre tela", en: "Acrylic on canvas" },
    dimensoes: "70 × 50 cm",
    larguraCm: 70,
    alturaCm: 50,
    ano: 2025,
    preco: 400,
    imagem: "images/celulas-10.jpg",
    stripeLink: "",
    vendido: false
  },
  {
    id: "imperfeitos-11",
    serie: { pt: "Imperfeitos", en: "Imperfect" },
    titulo: { pt: "Calor", en: "Heat" },
    descricao: {
      pt: "Cores quentes organizadas em um grande deserto de gente.",
      en: "Warm colors arranged across a vast desert of people."
    },
    tecnica: { pt: "Óleo sobre tela", en: "Oil on canvas" },
    dimensoes: "100 × 70 cm",
    larguraCm: 100,
    alturaCm: 70,
    ano: 2019,
    preco: 500,
    imagem: "images/calor.jpg",
    stripeLink: "",
    vendido: false
  }
];

/* ============================================================
   SOBRE O ARTISTA — edite bio e contatos aqui
   ============================================================ */
var ARTISTA = {
  // Foto de perfil (moldura redonda no painel "quem sou eu?").
  // Coloque sua foto na pasta images/ e ajuste o nome aqui.
  foto: "images/perfil.jpg",
  bio: {
    pt: "Sou pbione, pintor autodidata. Trabalho a partir da perspectiva de um balão — não tão alto a ponto de perder o chão — observando as cidades brasileiras e suas complexidades. Uso cores vibrantes, sem sombra, delimitadas por contornos pretos: formas abstratas que se equilibram entre si, como as próprias cidades que retrato. Não busco explicar as cidades que pinto — busco encantar, convidar quem vê a flutuar comigo por um instante sobre esse caos colorido que é viver.",
    en: "I am pbione, a self-taught painter. I work from the perspective of a hot air balloon — never so high that I lose sight of the ground — observing Brazilian cities and their complexities. I use vibrant, shadowless colors bound by black outlines: abstract forms balanced against each other, much like the cities I paint. I don't aim to explain the cities I depict — I aim to enchant, inviting the viewer to float with me for a moment above the colorful chaos of living."
  },
  instagram: "https://instagram.com/p.bione",
  email: "p.bione@gmail.com"
};
