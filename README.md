# p.bione — galeria de arte autoral

Site estático (HTML/CSS/JS puro) para exposição e venda de quadros. Sem servidor, sem banco de dados, sem chaves secretas — os pagamentos acontecem 100% nos servidores do Stripe.

## Estrutura

```
pbione-site/
├── index.html      ← página única do site
├── obras.js        ← ✏️ AQUI você edita as obras e a sua bio
├── css/style.css   ← estilo (galeria branca minimalista)
├── js/app.js       ← lógica (não precisa mexer)
├── images/         ← ✏️ fotos dos quadros, foto de perfil e a logo (logo.svg)
└── docs/           ← termos-e-privacidade.pdf (Termos & Privacidade, PT+EN)
```

## Como trocar a LOGO

A logo aparece em 2 lugares: no cabeçalho quando o visitante rola a página (o nome "p.bione" encolhe e vira a logo, com os botões das séries alinhados a ela) e no rodapé, ao lado do botão de Termos.

1. Prepare sua imagem **quadrada** (ex: 512×512px), em PNG, JPG ou SVG.
2. Coloque o arquivo na pasta `images/` com o nome `logo.svg` — ou, se for PNG/JPG, use `logo.png` e troque `images/logo.svg` por `images/logo.png` em **2 linhas do `index.html`**: a linha com `id="brand-logo"` (cabeçalho) e a linha com `class="footer-logo"` (rodapé).
3. A moldura já é redonda automaticamente (CSS `border-radius: 50%`). Suba os arquivos no GitHub e pronto.

## Formulário de contato

O botão redondo com o telefone vermelho (canto inferior direito) abre o formulário: nome, celular, e-mail, país, mensagem e a caixa de consentimento — o botão **Enviar só habilita com tudo preenchido e a caixa marcada**. Como o site não tem servidor, o envio abre o aplicativo de e-mail do visitante com a mensagem pronta, endereçada ao e-mail em `ARTISTA.email` (obras.js).

> Quer que o envio aconteça direto no site, sem abrir o e-mail do visitante? Crie uma conta grátis no https://formspree.io, e me peça para adaptar o formulário — é uma troca de ~5 linhas no `js/app.js`.

## Termos & Privacidade (PDF)

O arquivo `docs/termos-e-privacidade.pdf` (bilíngue PT/EN) cobre regras de compra, uso do site, direitos autorais das obras e proteção de dados conforme **GDPR** (Europa), **CCPA/CPRA** (EUA) e **LGPD + leis latino-americanas**. O visitante o consulta pelo botão no rodapé. É um modelo informativo — para operações maiores, revise com um(a) advogado(a). Para alterá-lo, edite e substitua o PDF mantendo o mesmo nome de arquivo.

---

## Passo 1 — Testar no seu computador

Abra o arquivo `index.html` com dois cliques (funciona direto no navegador, sem servidor).

---

## Passo 2 — Personalizar

Abra `obras.js` em qualquer editor de texto:

1. **Sua bio e contatos** — no final do arquivo, edite `ARTISTA` (bio em PT e EN, link do Instagram e e-mail). O campo `foto` é a sua foto de perfil, exibida em moldura redonda no painel "quem sou eu?": coloque a imagem em `images/` e ajuste o nome — substitua o `images/perfil.svg` de exemplo. Foto quadrada (ex: 400×400px) fica melhor.
2. **Suas obras** — cada obra é um bloco `{ ... }`. Para cada quadro:
   - Coloque a foto em `images/` (JPG ~1200px de largura é ideal; comprima em https://squoosh.app).
   - Edite título, descrição, técnica, dimensões, ano e preço (USD, só números).
   - Para **remover** uma obra, apague o bloco dela. Para marcar **vendida**: `vendido: true`.
3. Apague os arquivos `images/obra1.svg` … `obra6.svg` e `images/perfil.svg` quando substituir pelos seus.

---

## Passo 3 — Publicar no GitHub Pages (grátis)

1. Crie uma conta em https://github.com (se ainda não tiver).
2. Clique em **New repository** → nome: `pbione-site` → **Public** → **Create repository**.
3. Na página do repositório, clique em **uploading an existing file** e arraste TODOS os arquivos desta pasta (incluindo as pastas `css`, `js`, `images`). Clique em **Commit changes**.
4. Vá em **Settings → Pages** → em "Source" escolha **Deploy from a branch** → branch `main`, pasta `/ (root)` → **Save**.
5. Em ~2 minutos o site estará no ar em `https://SEU-USUARIO.github.io/pbione-site/`.

> Quiser um domínio próprio (ex: pbione.com)? Compre o domínio e configure em **Settings → Pages → Custom domain**. Ative **Enforce HTTPS**.

---

## Passo 4 — Configurar o Stripe (pagamentos)

1. Crie a conta em https://dashboard.stripe.com/register e complete a ativação (dados pessoais/bancários).
2. Para **cada quadro**:
   - No painel do Stripe: **Product catalog → + Add product** → nome do quadro, foto, preço em USD → salve.
   - Abra o produto → **Create payment link** (ou menu **Payment Links → + New**).
   - Em "After payment" você pode configurar página de confirmação e **coleta de endereço de entrega** (recomendado: ative "Collect customers' addresses → Shipping").
   - Copie o link gerado (começa com `https://buy.stripe.com/...`).
3. Cole o link no campo `stripeLink` da obra em `obras.js`.
4. Suba o `obras.js` atualizado para o GitHub (basta editar o arquivo direto no site do GitHub: abra o arquivo → ícone de lápis → cole → **Commit**).

**Importante para obras únicas:** no Payment Link, em "Advanced options", ative **Limit the number of payments** = 1. Assim ninguém compra um quadro já vendido. Depois da venda, marque `vendido: true` no `obras.js`.

> Teste antes: o Stripe tem "Test mode". Crie um payment link de teste e pague com o cartão fictício `4242 4242 4242 4242`.

---

## Passo 5 — Vincular ao Instagram

- Coloque o link do site na bio do seu perfil.
- O link do seu Instagram já aparece no painel "quem sou eu?" do site (campo `instagram` em `obras.js`).

---

## Como adicionar uma obra nova (rotina do dia a dia)

1. Foto do quadro → pasta `images/`.
2. Copie um bloco `{ ... }` em `obras.js`, cole antes do `]` e edite os textos.
3. Crie o produto + payment link no Stripe e cole em `stripeLink`.
4. Suba os dois arquivos no GitHub. Pronto — o site atualiza sozinho.

---

## Segurança (o que já está protegido)

- **Sem segredos no código**: o site não contém nenhuma chave do Stripe. Payment Links são públicos por natureza; o pagamento roda nos servidores do Stripe (PCI-DSS).
- **Anti-XSS**: nenhum texto das obras é inserido como HTML — tudo vira texto puro. Mesmo que alguém injete `<script>` no arquivo de obras, nada executa.
- **Anti-adulteração de pagamento**: o site só aceita links que começam com `https://buy.stripe.com/`. Um link falso de outro domínio é ignorado.
- **Content-Security-Policy** no HTML: bloqueia scripts, imagens e estilos de qualquer origem externa.
- **Imagens** (obras e foto de perfil): só caminhos locais são aceitos (`javascript:`, `data:` e URLs externas são rejeitados).
- **Links externos** abrem com `rel="noopener noreferrer"`.

O que **você** deve fazer:
- Ative **autenticação em 2 fatores** no GitHub e no Stripe (é onde um invasor poderia agir).
- Nunca compartilhe as chaves secretas do painel do Stripe (`sk_...`) — este site não precisa delas.
