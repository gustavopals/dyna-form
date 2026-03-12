# NPM Publish — Design Spec

**Data:** 2026-03-12
**Escopo:** Item 7 do roadmap — Publicar primeira versão no npm
**Status:** Aprovado

---

## Objetivo

Publicar a biblioteca `dynaform` no npm como `@gustavopals/dynaform@0.0.1` (pacote público com escopo), incluindo um README básico e um script de publicação reutilizável.

---

## Decisões

| Decisão | Escolha |
|---|---|
| Nome do pacote | `@gustavopals/dynaform` |
| Versão inicial | `0.0.1` |
| Acesso | `public` (qualquer um pode instalar) |
| README | Básico: instalação + exemplo mínimo |
| Automação | Script `npm run publish:lib` no `package.json` raiz |

---

## Mudanças

### 1. `projects/dynaform/package.json`

Atualizar com metadados completos:

```json
{
  "name": "@gustavopals/dynaform",
  "version": "0.0.1",
  "description": "Auto-generates CRUD interfaces (form, grid, detail) from a JSON field dictionary using PO-UI",
  "keywords": ["angular", "po-ui", "form", "grid", "crud", "dynamic-form"],
  "author": "Gustavo Pals",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/gustavopals/dyna-form"
  },
  "peerDependencies": {
    "@angular/common": "^19.2.0",
    "@angular/core": "^19.2.0",
    "@po-ui/ng-components": "^19.0.0"
  },
  "dependencies": {
    "tslib": "^2.3.0"
  },
  "sideEffects": false
}
```

> **Nota:** `@po-ui/ng-components` foi adicionado como `peerDependency` — estava faltando, pois a lib depende dele em runtime.

### 2. `projects/dynaform/ng-package.json`

Adicionar `assets` para incluir o README no bundle:

```json
{
  "$schema": "../../node_modules/ng-packagr/ng-package.schema.json",
  "dest": "../../dist/dynaform",
  "lib": {
    "entryFile": "src/public-api.ts"
  },
  "assets": ["README.md"]
}
```

### 3. `projects/dynaform/README.md`

README com as seguintes seções:

**Título e descrição:** `@gustavopals/dynaform` — Auto-generates CRUD interfaces from a JSON field dictionary using PO-UI.

**Installation:**
```bash
npm install @gustavopals/dynaform @po-ui/ng-components
```

**Setup** — registrar `PoModule` e `PoTemplatesModule` no `app.config.ts` via `importProvidersFrom`.

**Quick start** — exemplo completo de `DyfTable` com 2 campos e uso dos 3 componentes:
```typescript
const TABLE: DyfTable = {
  tableName: 'customers', revision: 1, label: 'Clientes',
  fields: [
    { fieldName: 'id', property: 'id', label: 'ID', type: 'number', key: true },
    { fieldName: 'name', property: 'name', label: 'Nome', type: 'string', required: true },
  ]
};
```
```html
<dyf-grid [table]="TABLE" [items]="items" (edit)="onEdit($event)"></dyf-grid>
<dyf-form [table]="TABLE" [value]="item" (save)="onSave($event)"></dyf-form>
<dyf-detail [table]="TABLE" [value]="item"></dyf-detail>
```

**Field types** — tabela com os 7 tipos de `DyfFieldType`: `string`, `number`, `currency`, `boolean`, `date`, `dateTime`, `time`.

**Peer dependencies** — `@angular/core ^19`, `@po-ui/ng-components ^19`.

### 4. `package.json` raiz — scripts de publicação

```json
"publish:lib": "npm whoami && ng build dynaform --configuration production && npm publish dist/dynaform --access public",
"publish:lib:dry": "ng build dynaform --configuration production && npm publish dist/dynaform --access public --dry-run"
```

O `npm whoami` no início do `publish:lib` falha imediatamente com mensagem clara se o usuário não estiver logado, evitando fazer o build inteiro só para falhar no publish.

### 5. Pré-requisito: autenticação npm

Antes de publicar, o usuário precisa estar logado no npm:

```bash
npm login
# ou com token:
npm set //registry.npmjs.org/:_authToken=<token>
```

O script `publish:lib` não faz login automaticamente — é responsabilidade do usuário estar autenticado. A documentação do script deve mencionar esse pré-requisito.

### 6. Dry-run antes de publicar

O script completo inclui um passo de dry-run opcional para validar o pacote antes de publicar de fato:

```bash
npm publish dist/dynaform --access public --dry-run
```

Adicionar script auxiliar `publish:lib:dry` no `package.json` raiz:

```json
"publish:lib:dry": "ng build dynaform --configuration production && npm publish dist/dynaform --access public --dry-run"
```

---

## Nota sobre versão do PO-UI nas peerDependencies

A lib usa `@po-ui/ng-components` internamente. A versão nas `peerDependencies` usa range permissivo `^19.0.0` (não a versão exata do projeto) para permitir que consumidores usem qualquer patch/minor do PO-UI 19 sem conflitos. Essa é a prática correta para bibliotecas.

---

## Fora do escopo

- CI/CD automático (GitHub Actions) — item futuro
- Changelog / release notes — item futuro
- Versionamento semântico automático (`semantic-release`) — item futuro
