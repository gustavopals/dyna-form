# Landing Page Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar `projects/dynaform-demo/public/landing/index.html` — página estática que apresenta a biblioteca DynaForm com navbar, hero, componentes, fluxo, quick start, CTA builder e footer.

**Architecture:** Um único arquivo HTML standalone (sem dependências externas) que usa CSS variables para a paleta e JS inline para clipboard e scroll behavior. Servido como asset estático pelo `ng serve` via pasta `public/`.

**Tech Stack:** HTML5, CSS3 (custom properties, flexbox, grid), Vanilla JS — zero frameworks, zero npm.

**Spec:** `docs/superpowers/specs/2026-03-12-landing-page-design.md`

---

## Chunk 1: Skeleton + Navbar + Hero

### Task 1: Criar o esqueleto HTML com head, CSS global e navbar

**Files:**
- Create: `projects/dynaform-demo/public/landing/index.html`

- [ ] **Step 1: Criar o arquivo com head, CSS variables e reset**

Criar `projects/dynaform-demo/public/landing/index.html` com o seguinte conteúdo inicial:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1024">
  <title>DynaForm — Auto-generates CRUD interfaces from JSON · Angular 19 · PO-UI</title>
  <meta name="description" content="Biblioteca Angular que gera formulário, grid e detalhe automaticamente a partir de um dicionário JSON de campos. Usa PO-UI v19.">
  <meta property="og:title" content="DynaForm — CRUD interfaces from JSON">
  <meta property="og:description" content="Auto-generates dyf-form, dyf-grid and dyf-detail from a DyfTable dictionary. Angular 19 + PO-UI.">
  <meta property="og:url" content="https://gustavopals.github.io/dyna-form/landing/">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:           #0a0a0f;
      --surface:      rgba(255,255,255,.03);
      --border:       rgba(255,255,255,.07);
      --accent:       #e94560;
      --accent-dark:  #c02040;
      --text:         #e2e8f0;
      --text-muted:   #64748b;
      --text-dim:     #94a3b8;
      --code-bg:      #080811;
      --purple:       #a78bfa;
      --green:        #34d399;
      --blue:         #60a5fa;
    }

    html { scroll-behavior: smooth; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      min-width: 1024px;
    }

    /* ── Utilitários ── */
    .section-label {
      display: block;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 10px;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--accent);
      color: #fff;
      padding: 12px 28px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: background .15s;
    }
    .btn-primary:hover { background: var(--accent-dark); }

    .btn-outline {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 1px solid rgba(255,255,255,.15);
      color: var(--text-dim);
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      text-decoration: none;
      cursor: pointer;
      background: transparent;
      transition: border-color .15s, color .15s;
    }
    .btn-outline:hover { border-color: rgba(255,255,255,.35); color: var(--text); }

    /* ── Navbar ── */
    nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(10,10,15,.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 48px;
      transition: background .2s;
    }
    nav.scrolled { background: rgba(10,10,15,.95); }

    .nav-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }
    .nav-logo-hex {
      width: 30px;
      height: 30px;
      background: linear-gradient(135deg, var(--accent), var(--accent-dark));
      clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
      flex-shrink: 0;
    }
    .nav-logo-text {
      font-weight: 800;
      font-size: 15px;
      letter-spacing: 2px;
      color: #fff;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 28px;
    }
    .nav-links a {
      font-size: 13px;
      color: var(--text-dim);
      text-decoration: none;
      transition: color .15s;
    }
    .nav-links a:hover { color: var(--text); }

    .nav-install {
      background: var(--accent);
      color: #fff;
      padding: 7px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
      text-decoration: none;
      transition: background .15s;
    }
    .nav-install:hover { background: var(--accent-dark); color: #fff; }
  </style>
</head>
<body>

  <!-- ① NAVBAR -->
  <nav id="nav">
    <a href="#" class="nav-logo">
      <div class="nav-logo-hex"></div>
      <span class="nav-logo-text">DYNAFORM</span>
    </a>
    <div class="nav-links">
      <a href="#quick-start">Docs</a>
      <a href="../">Demo</a>
      <a href="../builder">Builder</a>
      <a href="https://github.com/gustavopals/dyna-form" target="_blank" rel="noopener">GitHub ↗</a>
      <a href="#install" class="nav-install">npm install</a>
    </div>
  </nav>

</body>
</html>
```

- [ ] **Step 2: Verificar que o arquivo é servido**

```bash
# Verificar que o arquivo existe no lugar certo
ls projects/dynaform-demo/public/landing/
# Esperado: index.html

# Iniciar o dev server (em outra aba/terminal)
ng serve
# Acessar: http://localhost:4200/landing/
# Esperado: página com fundo escuro e navbar "DYNAFORM"
```

---

### Task 2: Adicionar seção Hero

**Files:**
- Modify: `projects/dynaform-demo/public/landing/index.html`

- [ ] **Step 1: Adicionar CSS do Hero**

Inserir dentro do `<style>` existente, antes do fechamento `</style>`:

```css
    /* ── Hero ── */
    .hero {
      padding: 88px 48px 72px;
      text-align: center;
      position: relative;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(233,69,96,.10);
      border: 1px solid rgba(233,69,96,.35);
      color: var(--accent);
      font-size: 11px;
      font-weight: 600;
      padding: 5px 14px;
      border-radius: 20px;
      margin-bottom: 24px;
    }

    .hero h1 {
      font-size: 52px;
      font-weight: 900;
      line-height: 1.1;
      margin-bottom: 18px;
      letter-spacing: -1px;
    }

    .hero h1 .gradient {
      background: linear-gradient(90deg, var(--accent), #f97316);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-sub {
      color: var(--text-muted);
      font-size: 16px;
      max-width: 520px;
      margin: 0 auto 32px;
      line-height: 1.7;
    }

    .hero-ctas {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-bottom: 28px;
    }

    .hero-install {
      display: inline-flex;
      align-items: center;
      gap: 14px;
      background: rgba(255,255,255,.04);
      border: 1px solid var(--border);
      padding: 11px 20px;
      border-radius: 8px;
      font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
      font-size: 13px;
      color: var(--text-dim);
    }

    .hero-install .dollar { color: var(--accent); }
    .hero-install .pkg    { color: var(--text); }

    .copy-btn {
      font-size: 11px;
      background: rgba(255,255,255,.06);
      border: 1px solid var(--border);
      color: var(--text-dim);
      padding: 3px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-family: inherit;
      transition: background .15s, color .15s;
    }
    .copy-btn:hover { background: rgba(255,255,255,.1); color: var(--text); }
    .copy-btn.copied { color: var(--green); border-color: var(--green); }
```

- [ ] **Step 2: Adicionar HTML do Hero**

Inserir após a tag `</nav>`, antes de `</body>`:

```html
  <!-- ② HERO -->
  <section class="hero" id="install">
    <div class="hero-badge">⬡ Angular 19 · PO-UI · Open Source</div>
    <h1>Gere interfaces <span class="gradient">CRUD</span><br>a partir de um JSON</h1>
    <p class="hero-sub">Defina seus campos uma vez, reutilize em formulário, grid e detalhe — sem repetição, sem boilerplate.</p>
    <div class="hero-ctas">
      <a href="../" class="btn-primary">▶ Ver Demo ao vivo</a>
      <a href="../builder" class="btn-outline">Montar campos →</a>
    </div>
    <div class="hero-install">
      <span class="dollar">$</span>
      <span class="pkg">npm install @gustavopals/dynaform</span>
      <button class="copy-btn" onclick="copyInstall(this)">copiar</button>
    </div>
  </section>
```

- [ ] **Step 3: Verificar visualmente**

Recarregar `http://localhost:4200/landing/`.
Esperado:
- Navbar sticky no topo
- Hero centralizado com headline grande
- Palavra "CRUD" em gradiente vermelho→laranja
- Dois botões + linha de install com botão "copiar"

- [ ] **Step 4: Commit**

```bash
git add projects/dynaform-demo/public/landing/index.html
git commit -m "feat: add landing page skeleton, navbar and hero"
```

---

## Chunk 2: Seções de conteúdo

### Task 3: Seção "3 Componentes"

**Files:**
- Modify: `projects/dynaform-demo/public/landing/index.html`

- [ ] **Step 1: Adicionar CSS dos componentes**

Inserir no `<style>` antes do `</style>`:

```css
    /* ── Seção genérica ── */
    section { padding: 80px 48px; }
    section + section { border-top: 1px solid var(--border); }

    .section-header {
      text-align: center;
      margin-bottom: 48px;
    }
    .section-header h2 {
      font-size: 30px;
      font-weight: 800;
      margin-bottom: 8px;
    }
    .section-header p {
      color: var(--text-muted);
      font-size: 15px;
    }

    /* ── Componentes ── */
    .comp-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      max-width: 960px;
      margin: 0 auto;
    }

    .comp-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 28px 24px;
      transition: border-color .2s, transform .2s;
    }
    .comp-card:hover {
      border-color: rgba(233,69,96,.4);
      transform: translateY(-2px);
    }

    .comp-icon { font-size: 32px; margin-bottom: 14px; }

    .comp-tag {
      font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
      font-size: 13px;
      font-weight: 700;
      color: var(--accent);
      margin-bottom: 8px;
    }

    .comp-title {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 8px;
      color: var(--text);
    }

    .comp-desc {
      color: var(--text-muted);
      font-size: 13px;
      line-height: 1.6;
    }
```

- [ ] **Step 2: Adicionar HTML da seção componentes**

Inserir após o `</section>` do Hero:

```html
  <!-- ③ COMPONENTES -->
  <section id="componentes">
    <div class="section-header">
      <span class="section-label">O que você ganha</span>
      <h2>Três componentes, zero repetição</h2>
      <p>Um único dicionário de campos alimenta tudo</p>
    </div>
    <div class="comp-grid">
      <div class="comp-card">
        <div class="comp-icon">📋</div>
        <div class="comp-tag">&lt;dyf-form&gt;</div>
        <div class="comp-title">Formulário CRUD</div>
        <div class="comp-desc">Cria e edita registros. Campos com validação, máscara, select e agrupamento por abas.</div>
      </div>
      <div class="comp-card">
        <div class="comp-icon">📊</div>
        <div class="comp-tag">&lt;dyf-grid&gt;</div>
        <div class="comp-title">Grid de listagem</div>
        <div class="comp-desc">Tabela com colunas automáticas, paginação, busca e ações de editar, excluir e detalhe.</div>
      </div>
      <div class="comp-card">
        <div class="comp-icon">🔍</div>
        <div class="comp-tag">&lt;dyf-detail&gt;</div>
        <div class="comp-title">Detalhe readonly</div>
        <div class="comp-desc">Exibe um registro formatado para leitura, com labels e valores dos campos configurados.</div>
      </div>
    </div>
  </section>
```

- [ ] **Step 3: Verificar visualmente**

Recarregar `http://localhost:4200/landing/`.
Esperado: grid de 3 cards com ícone, tag `<dyf-*>`, título e descrição. Hover deve elevar o card e destacar borda vermelha.

---

### Task 4: Seção "Como Funciona"

**Files:**
- Modify: `projects/dynaform-demo/public/landing/index.html`

- [ ] **Step 1: Adicionar CSS do fluxo**

Inserir no `<style>`:

```css
    /* ── Como funciona ── */
    .steps-wrapper {
      max-width: 800px;
      margin: 0 auto;
      position: relative;
    }

    /* linha conectora entre steps */
    .steps-wrapper::after {
      content: '';
      position: absolute;
      top: 36px;
      left: calc(16.5% + 28px);
      right: calc(16.5% + 28px);
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(233,69,96,.4), transparent);
      pointer-events: none;
    }

    .steps {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0;
    }

    .step { text-align: center; padding: 0 24px; }

    .step-num {
      width: 60px;
      height: 60px;
      background: rgba(233,69,96,.08);
      border: 2px solid rgba(233,69,96,.4);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      font-weight: 900;
      color: var(--accent);
      margin: 0 auto 18px;
    }

    .step h3 {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .step p {
      color: var(--text-muted);
      font-size: 13px;
      line-height: 1.6;
    }

    .step p code {
      font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
      font-size: 12px;
      color: var(--accent);
      background: rgba(233,69,96,.08);
      padding: 1px 5px;
      border-radius: 3px;
    }
```

- [ ] **Step 2: Adicionar HTML da seção como funciona**

Inserir após `</section>` dos componentes:

```html
  <!-- ④ COMO FUNCIONA -->
  <section id="como-funciona" style="background: rgba(233,69,96,.02);">
    <div class="section-header">
      <span class="section-label">Fluxo</span>
      <h2>Três passos para ter um CRUD</h2>
      <p>Do JSON ao produto final em minutos</p>
    </div>
    <div class="steps-wrapper">
      <div class="steps">
        <div class="step">
          <div class="step-num">1</div>
          <h3>Defina o dicionário</h3>
          <p>Crie um objeto <code>DyfTable</code> com campos, tipos e opções. Use o Builder visual ou escreva na mão.</p>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <h3>Use os componentes</h3>
          <p>Passe o <code>DyfTable</code> para <code>&lt;dyf-form&gt;</code>, <code>&lt;dyf-grid&gt;</code> ou <code>&lt;dyf-detail&gt;</code> via @Input.</p>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <h3>CRUD pronto</h3>
          <p>DynaForm gera formulários, colunas e layouts automaticamente. Sem código repetitivo.</p>
        </div>
      </div>
    </div>
  </section>
```

- [ ] **Step 3: Verificar visualmente**

Recarregar `http://localhost:4200/landing/`.
Esperado: 3 steps com círculos numerados bordeados de vermelho e linha conectora horizontal entre eles.

- [ ] **Step 4: Commit do chunk 2 até aqui**

```bash
git add projects/dynaform-demo/public/landing/index.html
git commit -m "feat: add components and how-it-works sections to landing page"
```

---

## Chunk 3: Quick Start, CTA Builder e Footer

### Task 5: Seção "Quick Start"

**Files:**
- Modify: `projects/dynaform-demo/public/landing/index.html`

- [ ] **Step 1: Adicionar CSS dos code blocks**

Inserir no `<style>`:

```css
    /* ── Quick Start ── */
    .qs-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      max-width: 960px;
      margin: 0 auto;
    }

    .code-block {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
    }

    .code-header {
      background: rgba(255,255,255,.04);
      padding: 9px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border);
    }

    .code-lang {
      font-size: 11px;
      color: var(--text-muted);
      font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
    }

    .code-dots { display: flex; gap: 5px; }
    .code-dots span {
      width: 10px; height: 10px;
      border-radius: 50%;
      background: rgba(255,255,255,.12);
    }

    .code-body {
      padding: 18px 20px;
      font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
      font-size: 12.5px;
      line-height: 1.75;
      color: var(--text-dim);
      overflow-x: auto;
    }

    /* syntax highlight tokens */
    .tk  { color: var(--purple); } /* keyword */
    .ts  { color: var(--green);  } /* string  */
    .tt  { color: var(--blue);   } /* type    */
    .tp  { color: var(--accent); } /* tag/prop */
    .tc  { color: var(--text-dim); opacity: .6; } /* comment */
    .tn  { color: #f97316; }       /* number  */
```

- [ ] **Step 2: Adicionar HTML do Quick Start**

Inserir após `</section>` de "Como funciona":

```html
  <!-- ⑤ QUICK START -->
  <section id="quick-start">
    <div class="section-header">
      <span class="section-label">Exemplo</span>
      <h2>Começar leva 5 minutos</h2>
      <p>Instale, defina o dicionário, use os componentes</p>
    </div>
    <div class="qs-grid">

      <!-- TypeScript -->
      <div class="code-block">
        <div class="code-header">
          <span class="code-lang">TypeScript — dicionário</span>
          <div class="code-dots"><span></span><span></span><span></span></div>
        </div>
        <div class="code-body">
<span class="tk">const</span> TABLE: <span class="tt">DyfTable</span> = {<br>
&nbsp;&nbsp;tableName: <span class="ts">'clientes'</span>,<br>
&nbsp;&nbsp;revision: <span class="tn">1</span>,<br>
&nbsp;&nbsp;label: <span class="ts">'Clientes'</span>,<br>
&nbsp;&nbsp;fields: [<br>
&nbsp;&nbsp;&nbsp;&nbsp;{<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;fieldName: <span class="ts">'id'</span>, property: <span class="ts">'id'</span>,<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;label: <span class="ts">'ID'</span>, type: <span class="ts">'number'</span>,<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;key: <span class="tk">true</span>,<br>
&nbsp;&nbsp;&nbsp;&nbsp;},<br>
&nbsp;&nbsp;&nbsp;&nbsp;{<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;fieldName: <span class="ts">'nome'</span>, property: <span class="ts">'nome'</span>,<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;label: <span class="ts">'Nome'</span>, type: <span class="ts">'string'</span>,<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;required: <span class="tk">true</span>, gridColumns: <span class="tn">8</span>,<br>
&nbsp;&nbsp;&nbsp;&nbsp;},<br>
&nbsp;&nbsp;&nbsp;&nbsp;{<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;fieldName: <span class="ts">'ativo'</span>, property: <span class="ts">'ativo'</span>,<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;label: <span class="ts">'Ativo'</span>, type: <span class="ts">'boolean'</span>,<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;gridColumns: <span class="tn">4</span>,<br>
&nbsp;&nbsp;&nbsp;&nbsp;},<br>
&nbsp;&nbsp;],<br>
};<br>
        </div>
      </div>

      <!-- HTML -->
      <div class="code-block">
        <div class="code-header">
          <span class="code-lang">HTML — template</span>
          <div class="code-dots"><span></span><span></span><span></span></div>
        </div>
        <div class="code-body">
<span class="tc">&lt;!-- Grid de listagem --&gt;</span><br>
&lt;<span class="tp">dyf-grid</span><br>
&nbsp;&nbsp;[table]=<span class="ts">"TABLE"</span><br>
&nbsp;&nbsp;[items]=<span class="ts">"items"</span><br>
&nbsp;&nbsp;(edit)=<span class="ts">"onEdit($event)"</span><br>
&nbsp;&nbsp;(delete)=<span class="ts">"onDelete($event)"</span>&gt;<br>
&lt;/<span class="tp">dyf-grid</span>&gt;<br>
<br>
<span class="tc">&lt;!-- Formulário de edição --&gt;</span><br>
&lt;<span class="tp">dyf-form</span><br>
&nbsp;&nbsp;[table]=<span class="ts">"TABLE"</span><br>
&nbsp;&nbsp;[value]=<span class="ts">"item"</span><br>
&nbsp;&nbsp;(save)=<span class="ts">"onSave($event)"</span><br>
&nbsp;&nbsp;(cancel)=<span class="ts">"back()"</span>&gt;<br>
&lt;/<span class="tp">dyf-form</span>&gt;<br>
<br>
<span class="tc">&lt;!-- Detalhe readonly --&gt;</span><br>
&lt;<span class="tp">dyf-detail</span><br>
&nbsp;&nbsp;[table]=<span class="ts">"TABLE"</span><br>
&nbsp;&nbsp;[value]=<span class="ts">"item"</span>&gt;<br>
&lt;/<span class="tp">dyf-detail</span>&gt;<br>
        </div>
      </div>

    </div>
  </section>
```

---

### Task 6: CTA Builder e Footer

**Files:**
- Modify: `projects/dynaform-demo/public/landing/index.html`

- [ ] **Step 1: Adicionar CSS do CTA Builder e Footer**

Inserir no `<style>`:

```css
    /* ── CTA Builder ── */
    .cta-builder { text-align: center; }

    .cta-box {
      display: inline-block;
      max-width: 640px;
      width: 100%;
      background: linear-gradient(135deg, rgba(233,69,96,.10) 0%, rgba(15,52,96,.20) 100%);
      border: 1px solid rgba(233,69,96,.25);
      border-radius: 20px;
      padding: 56px 48px;
    }

    .cta-box h2 {
      font-size: 32px;
      font-weight: 900;
      margin-bottom: 14px;
      line-height: 1.2;
    }

    .cta-box p {
      color: var(--text-dim);
      font-size: 15px;
      line-height: 1.7;
      margin-bottom: 32px;
    }

    .cta-box p code {
      font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
      font-size: 13px;
      color: var(--accent);
    }

    .cta-btns {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    /* ── Footer ── */
    footer {
      border-top: 1px solid var(--border);
      padding: 28px 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      color: var(--text-muted);
    }

    .footer-logo {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .footer-logo-hex {
      width: 18px;
      height: 18px;
      background: linear-gradient(135deg, var(--accent), var(--accent-dark));
      clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
    }
    .footer-logo span { font-weight: 700; font-size: 12px; letter-spacing: 1px; color: var(--text-muted); }

    .footer-links { display: flex; gap: 20px; }
    .footer-links a { color: var(--text-muted); text-decoration: none; transition: color .15s; }
    .footer-links a:hover { color: var(--text); }
```

- [ ] **Step 2: Adicionar HTML do CTA Builder e Footer**

Inserir após `</section>` do Quick Start, antes de `</body>`:

```html
  <!-- ⑥ CTA BUILDER -->
  <section class="cta-builder" id="builder-cta">
    <div class="cta-box">
      <div class="hero-badge" style="margin-bottom: 20px;">Novo ✦ Ferramenta visual</div>
      <h2>Monte seus campos<br>sem escrever JSON</h2>
      <p>O Dictionary Builder deixa você criar, editar e reorganizar campos visualmente — e exporta o <code>DyfTable</code> pronto para colar no seu projeto.</p>
      <div class="cta-btns">
        <a href="../builder" class="btn-primary">Abrir Builder →</a>
        <a href="../" class="btn-outline">Ver Demo primeiro</a>
      </div>
    </div>
  </section>

  <!-- ⑦ FOOTER -->
  <footer>
    <div class="footer-logo">
      <div class="footer-logo-hex"></div>
      <span>DYNAFORM</span>
      <span style="margin-left:8px; color: var(--border);">·</span>
      <span style="margin-left:8px;">MIT License</span>
    </div>
    <div class="footer-links">
      <a href="https://www.npmjs.com/package/@gustavopals/dynaform" target="_blank" rel="noopener">npm</a>
      <a href="https://github.com/gustavopals/dyna-form" target="_blank" rel="noopener">GitHub</a>
      <a href="https://po-ui.io" target="_blank" rel="noopener">PO-UI</a>
    </div>
    <span>by Gustavo Pals</span>
  </footer>
```

- [ ] **Step 3: Verificar visualmente todas as seções**

Recarregar `http://localhost:4200/landing/`. Checar:
- Seções de componentes, fluxo, quick start aparecem corretamente
- Code blocks com syntax highlighting colorido
- CTA builder com card de gradiente
- Footer com links

- [ ] **Step 4: Commit**

```bash
git add projects/dynaform-demo/public/landing/index.html
git commit -m "feat: add quick start, cta builder and footer sections"
```

---

## Chunk 4: JS + Polimento Final

### Task 7: Comportamento JS e ajustes finais

**Files:**
- Modify: `projects/dynaform-demo/public/landing/index.html`

- [ ] **Step 1: Adicionar script JS ao final do body**

Inserir antes de `</body>`:

```html
  <script>
    // Navbar scroll effect
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 10);
    });

    // Copy install command
    function copyInstall(btn) {
      navigator.clipboard.writeText('npm install @gustavopals/dynaform').then(() => {
        btn.textContent = '✓ copiado!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'copiar';
          btn.classList.remove('copied');
        }, 2000);
      });
    }
  </script>
```

- [ ] **Step 2: Verificar comportamento JS**

No browser em `http://localhost:4200/landing/`:
1. Scrollar a página — o nav deve ficar levemente mais opaco
2. Clicar "copiar" no hero-install — deve mudar para "✓ copiado!" por 2s e voltar

- [ ] **Step 3: Commit JS**

```bash
git add projects/dynaform-demo/public/landing/index.html
git commit -m "feat: add copy-to-clipboard and navbar scroll behavior"
```

---

### Task 8: Atualizar roadmap

**Files:**
- Modify: `IDEA.MD`

- [ ] **Step 1: Marcar item 8 como concluído**

No arquivo `IDEA.MD`, alterar a linha:
```
8. [ ] Documentação e exemplos de uso
```
para:
```
8. [x] Documentação e exemplos de uso
```

- [ ] **Step 2: Commit final**

```bash
git add IDEA.MD
git commit -m "docs: mark roadmap item 8 (documentação e exemplos) as complete"
```
