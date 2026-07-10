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
    id: "serie-i-01",
    serie: { pt: "Série I", en: "Series I" },
    titulo: { pt: "Sem título nº 1", en: "Untitled No. 1" },
    descricao: {
      pt: "Descrição da obra: inspiração, processo e o que ela representa. Edite este texto no arquivo obras.js.",
      en: "Artwork description: inspiration, process and meaning. Edit this text in the obras.js file."
    },
    tecnica: { pt: "Acrílica sobre tela", en: "Acrylic on canvas" },
    dimensoes: "60 × 80 cm",
    ano: 2026,
    preco: 450, // em USD, só números
    imagem: "images/obra1.svg",
    stripeLink: "",
    vendido: false
  },
  {
    id: "serie-i-02",
    serie: { pt: "Série I", en: "Series I" },
    titulo: { pt: "Sem título nº 2", en: "Untitled No. 2" },
    descricao: {
      pt: "Descrição da segunda obra. Substitua pelas suas palavras.",
      en: "Description of the second artwork. Replace with your own words."
    },
    tecnica: { pt: "Óleo sobre tela", en: "Oil on canvas" },
    dimensoes: "50 × 70 cm",
    ano: 2026,
    preco: 380,
    imagem: "images/obra2.svg",
    stripeLink: "",
    vendido: false
  },
  {
    id: "serie-i-03",
    serie: { pt: "Série I", en: "Series I" },
    titulo: { pt: "Sem título nº 3", en: "Untitled No. 3" },
    descricao: {
      pt: "Descrição da terceira obra.",
      en: "Description of the third artwork."
    },
    tecnica: { pt: "Técnica mista", en: "Mixed media" },
    dimensoes: "40 × 40 cm",
    ano: 2025,
    preco: 290,
    imagem: "images/obra3.svg",
    stripeLink: "",
    vendido: false
  },
  {
    id: "serie-i-04",
    serie: { pt: "Série I", en: "Series I" },
    titulo: { pt: "Sem título nº 4", en: "Untitled No. 4" },
    descricao: {
      pt: "Descrição da quarta obra.",
      en: "Description of the fourth artwork."
    },
    tecnica: { pt: "Acrílica sobre tela", en: "Acrylic on canvas" },
    dimensoes: "70 × 100 cm",
    ano: 2025,
    preco: 620,
    imagem: "images/obra4.svg",
    stripeLink: "",
    vendido: true // exemplo de obra vendida
  },
  {
    id: "serie-ii-01",
    serie: { pt: "Série II", en: "Series II" },
    titulo: { pt: "Estudo nº 1", en: "Study No. 1" },
    descricao: {
      pt: "Primeira obra da segunda série.",
      en: "First artwork of the second series."
    },
    tecnica: { pt: "Aquarela", en: "Watercolor" },
    dimensoes: "30 × 42 cm",
    ano: 2026,
    preco: 180,
    imagem: "images/obra5.svg",
    stripeLink: "",
    vendido: false
  },
  {
    id: "serie-ii-02",
    serie: { pt: "Série II", en: "Series II" },
    titulo: { pt: "Estudo nº 2", en: "Study No. 2" },
    descricao: {
      pt: "Segunda obra da segunda série.",
      en: "Second artwork of the second series."
    },
    tecnica: { pt: "Aquarela", en: "Watercolor" },
    dimensoes: "30 × 42 cm",
    ano: 2026,
    preco: 180,
    imagem: "images/obra6.svg",
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
  foto: "images/perfil.svg",
  bio: {
    pt: "Sou p.bione, artista autoral. Escreva aqui a sua biografia: sua trajetória, o que move o seu trabalho e onde você cria.",
    en: "I am p.bione, an independent artist. Write your biography here: your journey, what drives your work and where you create."
  },
  instagram: "https://instagram.com/p.bione",
  email: "p.bione@gmail.com"
};
