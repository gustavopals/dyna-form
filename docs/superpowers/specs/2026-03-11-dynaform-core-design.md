# DynaForm Core — Design Spec

**Data:** 2026-03-11
**Escopo:** Itens 1–5 do roadmap (estrutura de dados + componentes base + form + grid + detail)
**Status:** Aprovado

---

## Contexto

DynaForm é uma Angular library que gera interfaces CRUD automaticamente a partir de um dicionário JSON. O consumidor passa um objeto `DyfTable` (hardcoded ou vindo de uma API própria) e a lib renderiza form, grid e detail usando PO-UI.

A lib **não** possui backend próprio. O dicionário é resolvido externamente pelo consumidor.

---

## Decisões de design

| Decisão | Escolha |
|---|---|
| Persistência | TypeScript-only — sem backend próprio |
| Tipos de campo | Seguem `PoDynamicFormField.type` (`string`, `number`, `boolean`, `currency`, `date`, `dateTime`, `time`) |
| Agrupamento de campos | Seções com `divider` (sem abas) |
| Grid de colunas | `gridColumns` único para todos os contextos |
| Chave primária | `key: boolean` no `DyfField` |
| Identidade do dicionário | `tableName + revision` (número inteiro) |
| PO-UI avançado | `poConfig?: Partial<PoDynamicFormField>` como escape hatch |

---

## Modelo de dados (Item 1)

### `DyfTable`

```typescript
interface DyfTable {
  tableName: string;      // chave de identidade — ex: 'customers'
  revision: number;       // versão do dicionário — ex: 1
  label: string;          // título exibido nas telas
  description?: string;
  endpoint?: string;      // metadado para o consumidor (a lib não faz fetch)
  fields: DyfField[];
  folders?: DyfFolder[];
}
```

### `DyfFolder`

```typescript
interface DyfFolder {
  folderId: string;
  label: string;          // vira divider no primeiro campo do grupo
  order?: number;
}
```

> `DyfFolder` **não** possui array de fields. A relação fica exclusivamente em `DyfField.folderId`.

### `DyfFieldType`

```typescript
type DyfFieldType =
  | 'string'    // po-input | po-textarea (rows>1) | po-password (secret) | po-combo (optionsService)
  | 'number'    // po-number | po-decimal
  | 'currency'  // po-decimal (mode currency)
  | 'boolean'   // po-switch | po-checkbox (forceBooleanComponentType)
  | 'date'      // po-datepicker
  | 'dateTime'  // po-datepicker com hora
  | 'time';     // po-input time
```

### `DyfField`

```typescript
interface DyfField {
  // identidade
  fieldName: string;              // chave única dentro da tabela
  property: string;               // propriedade do objeto de dados
  label: string;
  type: DyfFieldType;

  // layout
  order?: number;
  gridColumns?: number;           // 1–12, aplicado em todos os contextos
  folderId?: string;              // referencia DyfFolder (injeta divider)

  // visibilidade por contexto (default: true)
  visibleOnGrid?: boolean;
  visibleOnForm?: boolean;
  visibleOnDetail?: boolean;
  key?: boolean;                  // marca a chave primária da entidade

  // core — comuns à maioria dos tipos
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  placeholder?: string;
  clean?: boolean;

  // string
  mask?: string;
  maxLength?: number;
  minLength?: number;
  rows?: number;                  // > 1 → po-textarea
  secret?: boolean;               // → po-password

  // select / combo / multiselect / radiogroup / checkbox
  options?: DyfFieldOption[];
  optionsMulti?: boolean;
  optionsService?: string;        // → po-combo

  // lookup
  searchService?: string;         // → po-lookup

  // date / number / currency
  format?: string;
  decimalsLength?: number;

  // escape hatch — mergeado ao PoDynamicFormField no render
  poConfig?: Partial<PoDynamicFormField>;
}

interface DyfFieldOption {
  label: string;
  value: any;
}
```

---

## Arquitetura dos componentes (Itens 2–5)

### `DyfFormBuilderService` (Item 2)

Serviço `providedIn: 'root'` responsável por todo o mapeamento `DyfField[] → PO-UI`.

| Método | Retorno | Descrição |
|---|---|---|
| `buildFormFields(table)` | `PoDynamicFormField[]` | Filtra `visibleOnForm`, injeta `divider` no 1º campo de cada folder, faz merge do `poConfig` |
| `buildGridColumns(table)` | `PoTableColumn[]` | Filtra `visibleOnGrid`, mapeia tipos para `PoTableColumn.type` |
| `buildDetailFields(table)` | `PoDynamicViewField[]` | Filtra `visibleOnDetail` |
| `getKeyField(table)` | `DyfField \| undefined` | Retorna o campo com `key: true` |

### `<dyf-form>` (Item 3)

```
Inputs:  table: DyfTable
         value?: Record<string, any>
Outputs: save: EventEmitter<Record<string, any>>
         cancel: EventEmitter<void>
Interno: PoDynamicFormComponent + DyfFormBuilderService
```

Fluxo: `DyfTable` → builder mapeia campos + injeta dividers → `PoDynamicForm` renderiza → `save` emite o valor.

### `<dyf-grid>` (Item 4)

```
Inputs:  table: DyfTable
         items: any[]
         loading?: boolean
Outputs: edit:   EventEmitter<any>  (linha selecionada)
         view:   EventEmitter<any>  (linha selecionada)
         delete: EventEmitter<any>  (linha selecionada)
         new:    EventEmitter<void>
Interno: PoTableComponent + DyfFormBuilderService
```

Ações padrão: Visualizar, Editar, Excluir. Usa `key: true` para identificar linha.

### `<dyf-detail>` (Item 5)

```
Inputs:  table: DyfTable
         value: Record<string, any>
Outputs: back: EventEmitter<void>
Interno: PoDynamicViewComponent + DyfFormBuilderService
```

---

## Fluxo na app consumidora

```
DyfTable ──► <dyf-grid>  ──(edit)──► <dyf-form>   ──(save)──► grid
                         └─(view)──► <dyf-detail> ──(back)──► grid
```

Estado de navegação e dados ficam fora da lib — responsabilidade do consumidor.

---

## O que fica fora do escopo (itens 6–8)

- Interface de cadastro do dicionário (item 6)
- Publicação npm (item 7)
- Documentação formal (item 8)
