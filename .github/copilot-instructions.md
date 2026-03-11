# DynaForm — Copilot Instructions

## Visão Geral do Projeto

DynaForm é uma **Angular Library** low-code/no-code que gera automaticamente interfaces CRUD (grid, formulário, detalhes) a partir de um dicionário de campos JSON (`DyfTable`). Usa **PO-UI** como biblioteca de componentes.

O workspace contém dois projetos Angular:
- `dynaform` (`projects/dynaform/`) — a biblioteca publicável (`npm: dynaform`)
- `dynaform-demo` (`projects/dynaform-demo/`) — app de demonstração e desenvolvimento local

## Comandos Essenciais

```bash
# Servir o app de demo (porta 4200)
npm start
# ou
ng serve dynaform-demo

# Build da biblioteca
ng build dynaform

# Build da biblioteca em modo watch (dev)
ng build dynaform --watch

# Build do app demo
ng build dynaform-demo

# Rodar testes
npm test
```

> Ao desenvolver a biblioteca, sempre fazer `ng build dynaform --watch` em paralelo com `ng serve dynaform-demo`, pois a demo consome a biblioteca pelo path mapping do `tsconfig.json`.

## Arquitetura

```
projects/
├── dynaform/src/lib/
│   ├── models/          # Interfaces de domínio (DyfTable, DyfField, DyfFolder)
│   ├── services/        # DyfFormBuilderService — lógica de mapeamento e filtragem
│   └── components/
│       ├── dyf-grid/    # Listagem via po-table
│       ├── dyf-form/    # Formulário via po-dynamic-form
│       └── dyf-detail/  # Visualização via po-dynamic-view
└── dynaform-demo/src/app/
    └── app.component.*  # Demonstração de uso com CRUD simulado
```

### Fluxo de dados

`DyfTable` (JSON) → `DyfFormBuilderService` → campos mapeados para PO-UI → componentes `dyf-*`

## Modelos Principais

### `DyfField` (`dyf-field.interface.ts`)

| Propriedade | Tipo | Descrição |
|---|---|---|
| `property` | `string` | Nome da propriedade no objeto de dados |
| `label` | `string` | Rótulo exibido na UI |
| `type` | `DyfFieldType` | Tipo do campo (ver abaixo) |
| `order` | `number?` | Ordem de exibição |
| `gridColumns` | `number?` | Largura na grid PO-UI (1–12) |
| `required` | `boolean?` | Campo obrigatório |
| `visibleOnGrid` | `boolean?` | Exibir na listagem |
| `visibleOnForm` | `boolean?` | Exibir no formulário |
| `visibleOnDetail` | `boolean?` | Exibir nos detalhes |
| `options` | `DyfFieldOption[]?` | Opções para select/multiselect |
| `folderId` | `string?` | Referência a uma `DyfFolder` |

**Tipos suportados (`DyfFieldType`):** `text`, `number`, `date`, `boolean`, `select`, `multiselect`, `textarea`, `password`, `email`, `phone`, `cpf`, `cnpj`, `currency`, `lookup`

### `DyfTable` (`dyf-table.interface.ts`)

```typescript
interface DyfTable {
  id: string;
  label: string;
  description?: string;
  endpoint?: string;   // base URL REST para operações CRUD
  fields: DyfField[];
  folders?: DyfFolder[];
}
```

## Convenções

- Todos os componentes e serviços da biblioteca são **standalone** (Angular 19+, sem NgModules)
- Prefixo dos seletores da biblioteca: `dyf-` (ex: `dyf-form`, `dyf-grid`, `dyf-detail`)
- Prefixo de arquivos: `dyf-` (ex: `dyf-form.component.ts`)
- Tudo que for público deve ser exportado em `projects/dynaform/src/public-api.ts`
- Novos itens em `models/` devem ser re-exportados em `projects/dynaform/src/lib/models/index.ts`
- Novos serviços devem ser re-exportados em `projects/dynaform/src/lib/services/index.ts`
- Usar PO-UI para todos os componentes visuais — não misturar com outras UI libs
- Strings de UI em **português** (pt-BR) — labels, placeholders, mensagens

## API Pública dos Componentes

### `<dyf-grid>`

```html
<dyf-grid
  [table]="dyfTable"
  [items]="dataArray"
  [loading]="isLoading"
  (view)="onView($event)"
  (edit)="onEdit($event)"
  (delete)="onDelete($event)">
</dyf-grid>
```

### `<dyf-form>`

```html
<dyf-form
  [table]="dyfTable"
  [value]="currentRecord"
  (save)="onSave($event)"
  (cancel)="onCancel()">
</dyf-form>
```

### `<dyf-detail>`

```html
<dyf-detail
  [table]="dyfTable"
  [value]="currentRecord">
</dyf-detail>
```

## Armadilhas Conhecidas

- **`po-dynamic-form` não suporta two-way binding (`[(ngModel)]`)** — usar `@ViewChild('dynamicForm') dynamicForm: PoDynamicFormComponent` e acessar `dynamicForm.value` no momento do submit.
- **Path mapping:** O `tsconfig.json` da raiz mapeia `'dynaform'` para o build da biblioteca. Certifique-se de ter feito `ng build dynaform` antes de rodar a demo pela primeira vez.
- **Budget do bundle:** O PO-UI é grande; os budgets no `angular.json` do projeto demo estão ajustados para `4mb` de warning e `6mb` de error.
- **Peer dependencies:** A biblioteca declara `@angular/common` e `@angular/core` como `peerDependencies` — não adicionar como `dependencies`.

## Arquivos-Chave

| Arquivo | Papel |
|---|---|
| [projects/dynaform/src/public-api.ts](../projects/dynaform/src/public-api.ts) | Surface pública da biblioteca |
| [projects/dynaform/src/lib/models/dyf-field.interface.ts](../projects/dynaform/src/lib/models/dyf-field.interface.ts) | Definição central do modelo de campo |
| [projects/dynaform/src/lib/services/dyf-form-builder.service.ts](../projects/dynaform/src/lib/services/dyf-form-builder.service.ts) | Lógica de mapeamento DyfField → PO-UI |
| [projects/dynaform-demo/src/app/app.component.ts](../projects/dynaform-demo/src/app/app.component.ts) | Exemplo completo de uso da biblioteca |
| [IDEA.MD](../IDEA.MD) | Visão de produto e roadmap |
