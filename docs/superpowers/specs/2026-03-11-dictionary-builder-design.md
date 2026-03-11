# Dictionary Builder — Design Spec

**Data:** 2026-03-11
**Escopo:** Item 6 do roadmap — Interface de Cadastro do Dicionário
**Status:** Aprovado

---

## Contexto

O DictionaryBuilder é uma interface visual dentro da demo app (`dynaform-demo`) para construir dicionários `DyfTable` de forma guiada e a prova de erros. O usuário monta a definição de uma tabela (campos, folders, metadados) e a ferramenta gera o JSON correspondente, persiste no localStorage e exibe um preview ao vivo usando os próprios componentes da lib.

A lib (`projects/dynaform`) **não é modificada**. Todo o novo código fica em `projects/dynaform-demo`.

---

## Decisões de design

| Decisão | Escolha |
|---|---|
| Localização | `dynaform-demo` — módulo dedicado, extraível para a lib no futuro |
| Persistência | `localStorage` (chave `dyf_table_${tableName}_${revision}`) |
| Exportação | JSON copiado para clipboard via `navigator.clipboard` |
| Preview ao vivo | Usa `<dyf-form>`, `<dyf-grid>`, `<dyf-detail>` com dados fictícios |
| Gestão de campos | Lista + modal por campo (PoModal) |
| Gestão de folders | Lista inline na tela principal + modal simples |
| Rota | `/builder` (lazy-loaded) |
| Componentes | Standalone (Angular 19), sem NgModule |

---

## Arquitetura

```
projects/dynaform-demo/src/app/
└── dictionary-builder/
    ├── dictionary-builder.component.ts       ← tela principal
    ├── dictionary-builder.component.html
    ├── dictionary-builder.component.scss
    ├── field-editor-modal/
    │   ├── field-editor-modal.component.ts   ← modal add/editar campo
    │   └── field-editor-modal.component.html
    ├── preview-panel/
    │   ├── preview-panel.component.ts        ← preview ao vivo (form/grid/detail)
    │   └── preview-panel.component.html
    └── dictionary-builder.service.ts         ← localStorage + JSON export
```

---

## Tela principal (`DictionaryBuilderComponent`)

**Rota:** `/builder`

**Layout em 3 blocos:**

### Bloco 1 — Dados da Tabela
Formulário com os campos de `DyfTable`:
- `tableName` (string, required, formato `snake_case`: `/^[a-z][a-z0-9_]*$/`)
- `revision` (number, required, inteiro ≥ 1)
- `label` (string, required)
- `description` (string, opcional)
- `endpoint` (string, opcional)

### Bloco 2 — Campos
`PoTable` com colunas: `fieldName`, `label`, `type`, `key`, `order`.
Ações por linha: **Editar** (abre `FieldEditorModalComponent`) e **Excluir**.
Botão "Adicionar Campo" acima da tabela.

### Bloco 3 — Folders (colapsável)
`PoTable` com colunas: `folderId`, `label`, `order`.
Ações: Adicionar (modal simples inline), Editar, Excluir.

### Rodapé com ações
- **Salvar** → persiste no localStorage via `DictionaryBuilderService.save()`
- **Copiar JSON** → copia DyfTable serializado
- **Preview** → toggle do painel `PreviewPanelComponent`

---

## Modal de Campo (`FieldEditorModalComponent`)

`PoModal` com campos agrupados em seções (usando `divider`):

**Identidade** (todos obrigatórios exceto `key`)
- `fieldName` — string, formato `/^[a-z][a-z0-9_]*$/`, único na tabela
- `property` — string, mesmo formato
- `label` — string
- `type` — select com `DyfFieldType` (7 opções)
- `key` — toggle; desabilitado se outro campo já é `key: true`

**Layout**
- `order` — number
- `gridColumns` — number, 1–12
- `folderId` — select com folders cadastrados

**Visibilidade**
- `visibleOnForm`, `visibleOnGrid`, `visibleOnDetail` — toggles (default: true)

**Comportamento**
- `required`, `disabled`, `readonly`, `clean` — toggles
- `placeholder` — string

**Campos condicionais por tipo:**
- `string`: `mask`, `maxLength`, `minLength`, `rows`, `secret`
- `number` / `currency`: `decimalsLength`, `format`
- qualquer tipo: `options` (lista label/value editável), `optionsMulti`, `optionsService`, `searchService`

---

## Preview ao Vivo (`PreviewPanelComponent`)

3 abas: **Formulário**, **Grid**, **Detalhes**.

- Usa `<dyf-form>`, `<dyf-grid>`, `<dyf-detail>` com dados fictícios
- Dados fictícios gerados por tipo: `string` → `"Exemplo"`, `number`/`currency` → `0`, `boolean` → `false`, `date`/`dateTime`/`time` → hoje
- Se o dicionário não tiver campos, exibe mensagem "Adicione campos para ver o preview"

---

## Serviço (`DictionaryBuilderService`)

```typescript
// localStorage key: `dyf_table_${tableName}_${revision}`

save(table: DyfTable): void
load(tableName: string, revision: number): DyfTable | null
loadAll(): DyfTable[]
delete(tableName: string, revision: number): void
exportJson(table: DyfTable): string   // JSON.stringify com 2 espaços
copyToClipboard(table: DyfTable): Promise<void>
```

---

## Validações

| Regra | Onde |
|---|---|
| `tableName` obrigatório, formato `snake_case` | Formulário da tabela |
| `revision` obrigatório, inteiro ≥ 1 | Formulário da tabela |
| `label` obrigatório | Formulário da tabela |
| `fieldName` obrigatório, único na tabela, formato `snake_case` | Modal de campo |
| `property` obrigatório, formato `snake_case` | Modal de campo |
| `type` obrigatório | Modal de campo |
| `gridColumns` entre 1 e 12 se preenchido | Modal de campo |
| Máximo 1 campo com `key: true` | Toggle desabilitado no modal |
| Mínimo 1 campo ao salvar | Botão Salvar desabilitado |
| Mínimo 1 campo com `key: true` ao salvar | PoNotification de erro |

---

## Navegação

O `AppComponent` ganha um link/botão na toolbar para `/builder`. A rota `/` continua com a demo atual. A rota `/builder` carrega o `DictionaryBuilderComponent` (lazy).

---

## O que fica fora do escopo

- Edição de `poConfig` (escape hatch) — muito avançado para a UI
- Importação de JSON (só exportação)
- Múltiplas revisões simultâneas
- Sincronização com backend
