# Landing Page — Design Spec

**Data:** 2026-03-12
**Escopo:** Item 8 do roadmap — Landing page da biblioteca DynaForm
**Status:** Aprovado

---

## Objetivo

Criar uma landing page estática que apresente a biblioteca `@gustavopals/dynaform` para desenvolvedores Angular, com links para o Demo ao vivo e para o Dictionary Builder.

> **Dependência:** a landing usa `npm install @gustavopals/dynaform` no Hero. O pacote ainda não existe no npm — esta página assume que o item 7 do roadmap (npm publish) já foi concluído antes do deploy público. Durante desenvolvimento, o comando é apenas visual.

---

## Decisões

| Decisão | Escolha |
|---|---|
| Tecnologia | HTML/CSS/JS standalone — sem framework, sem dependências externas |
| Localização | `projects/dynaform-demo/public/landing/index.html` (pasta `public/` é servida como assets estáticos pelo `ng serve`) |
| Estilo | Dark navy + vermelho/coral |
| Layout | Hero centralizado + 3 feature cards + código |
| Idioma | Português (consistente com o restante do projeto) |
| Viewport mínimo | 1024px (desktop only; responsividade móvel fora do escopo) |

---

## Estrutura de Seções

### ① Navbar
- Logo hexagonal + "DYNAFORM" em letras maiúsculas
- Links: Docs, Demo, Builder, GitHub (↗ nova aba)
- Botão de destaque: `npm install` (âncora para seção de instalação)
- `position: sticky; top: 0` com fundo semi-transparente + blur

### ② Hero
- Badge: `⬡ Angular 19 · PO-UI · Open Source`
- Headline: **"Gere interfaces CRUD a partir de um JSON"** — palavra "CRUD" em gradiente vermelho→laranja
- Subtítulo: "Defina seus campos uma vez, reutilize em formulário, grid e detalhe — sem repetição, sem boilerplate."
- CTAs: `▶ Ver Demo ao vivo` (primário, vermelho) + `Montar campos →` (secundário, outline)
- Linha de instalação: `$ npm install @gustavopals/dynaform` + botão "copiar" (copia para clipboard via JS)

### ③ 3 Componentes
- Label acima: "O QUE VOCÊ GANHA"
- Título: "Três componentes, zero repetição"
- Subtítulo: "Um único dicionário de campos alimenta tudo"
- Grid 3 colunas, um card por componente:
  - `<dyf-form>` — Formulário CRUD — campos com validação, máscara, select e agrupamento por abas
  - `<dyf-grid>` — Grid de listagem — colunas automáticas, paginação, busca, ações editar/excluir/detalhe
  - `<dyf-detail>` — Detalhe readonly — exibe um registro formatado para leitura

### ④ Como Funciona
- Label acima: "FLUXO"
- Título: "Três passos para ter um CRUD"
- Subtítulo: "Do JSON ao produto final em minutos"
- 3 steps com número em círculo bordeado de vermelho, linha conectora horizontal entre eles:
  1. **Defina o dicionário** — Crie um `DyfTable` com campos, tipos e opções. Use o Builder ou escreva na mão.
  2. **Use os componentes** — Passe o `DyfTable` para `<dyf-form>`, `<dyf-grid>` ou `<dyf-detail>` via @Input.
  3. **CRUD pronto** — DynaForm gera formulários, colunas e layouts automaticamente.

### ⑤ Quick Start
- Label acima: "EXEMPLO"
- Título: "Começar leva 5 minutos"
- Subtítulo: "Instale, defina o dicionário, use os componentes"
- Grid 2 colunas lado a lado:
  - **Bloco TypeScript** — dicionário correto, respeitando a interface `DyfTable` / `DyfField`:
    ```typescript
    const TABLE: DyfTable = {
      tableName: 'clientes',
      revision: 1,
      label: 'Clientes',
      fields: [
        { fieldName: 'id',   property: 'id',   label: 'ID',   type: 'number', key: true },
        { fieldName: 'nome', property: 'nome', label: 'Nome', type: 'string', required: true, gridColumns: 8 },
        { fieldName: 'ativo',property: 'ativo',label: 'Ativo',type: 'boolean', gridColumns: 4 },
      ],
    };
    ```
  - **Bloco HTML** — uso dos 3 componentes `<dyf-grid>`, `<dyf-form>`, `<dyf-detail>` com seus inputs/outputs corretos
- Syntax highlighting manual via `<span>` com as cores da paleta:
  - Keywords (`const`, `true`) → `--purple` (`#a78bfa`)
  - Strings (`'clientes'`, `'string'`) → `--green` (`#34d399`)
  - Types (`DyfTable`) → `--blue` (`#60a5fa`)
  - Tag names no HTML (`dyf-grid`, `dyf-form`) → `--accent` (`#e94560`)
  - Comentários → `--text-dim` (`#94a3b8`)

### ⑥ CTA Builder
- Card com gradiente sutil (vermelho escuro → navy)
- Badge: "Novo ✦ Ferramenta visual"
- Título: "Monte seus campos sem escrever JSON"
- Descrição: O Dictionary Builder deixa você criar, editar e reorganizar campos visualmente — e exporta o `DyfTable` pronto para colar no seu projeto.
- CTAs: `Abrir Builder →` (primário) + `Ver Demo primeiro` (outline)

### ⑦ Footer
- Logo pequeno + "DYNAFORM" + "MIT License"
- Links:
  - npm → `https://www.npmjs.com/package/@gustavopals/dynaform`
  - GitHub → `https://github.com/gustavopals/dyna-form`
  - PO-UI → `https://po-ui.io`
- "by Gustavo Pals"

---

## Paleta de Cores

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#0a0a0f` | Fundo da página |
| `--surface` | `rgba(255,255,255,.03)` | Cards/surface |
| `--border` | `rgba(255,255,255,.07)` | Bordas sutis |
| `--accent` | `#e94560` | Vermelho primário (CTAs, destaque) |
| `--accent-dark` | `#c02040` | Hover dos botões |
| `--text` | `#e2e8f0` | Texto principal |
| `--text-muted` | `#64748b` | Subtítulos, descrições |
| `--text-dim` | `#94a3b8` | Links de nav, texto secundário |
| `--code-bg` | `#080811` | Fundo dos blocos de código |
| `--purple` | `#a78bfa` | Keywords no código |
| `--green` | `#34d399` | Strings no código |
| `--blue` | `#60a5fa` | Types no código |

---

## Tipografia

- Família: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` (system font stack)
- Monospace (código): `'Fira Code', 'Cascadia Code', 'Consolas', monospace`
- Hero h1: 52px, weight 900, line-height 1.1
- Section h2: 28–32px, weight 800
- Body: 14–16px, weight 400, line-height 1.6
- Labels de seção: 10px, weight 700, letter-spacing 2px, uppercase, cor `#e94560`

---

## Comportamento JS (inline no HTML)

- **Copiar install command:** botão "copiar" usa `navigator.clipboard.writeText()` com feedback visual ("✓ copiado!")
- **Navbar scroll:** `scroll` listener adiciona classe `scrolled` ao nav, aumentando opacidade do backdrop
- **Links internos** (a app usa `PathLocationStrategy` — sem hash):
  - Demo → `../` (raiz da app Angular)
  - Builder → `../builder`
  - GitHub → `https://github.com/gustavopals/dyna-form` (nova aba)

## `<head>` da página

```html
<title>DynaForm — Auto-generates CRUD interfaces from JSON · Angular 19 · PO-UI</title>
<meta name="description" content="Biblioteca Angular que gera formulário, grid e detalhe automaticamente a partir de um dicionário JSON de campos. Usa PO-UI v19.">
<meta property="og:title" content="DynaForm — CRUD interfaces from JSON">
<meta property="og:description" content="Auto-generates dyf-form, dyf-grid and dyf-detail from a DyfTable dictionary. Angular 19 + PO-UI.">
<meta property="og:url" content="https://github.com/gustavopals/dyna-form">
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

---

## Fora do Escopo

- Internacionalização (EN)
- Versão mobile responsiva (foco é desktop ≥ 1024px)
- Dark/light mode toggle
- Animações de entrada (scroll animations)
- Build pipeline para o HTML (serve como arquivo estático via pasta `public/`)
