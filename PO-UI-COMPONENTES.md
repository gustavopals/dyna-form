# PO-UI — Componentes Relevantes para o DynaForm

Referência dos componentes PO-UI usados (ou a serem usados) no projeto DynaForm. Baseado na análise do código-fonte em `po-ui/po-angular` e na ferramenta **Dynamic Form** em https://po-ui.io/tools/dynamic-form.

---

## Cobertura dos tipos de campo DynaForm

| Tipo (`DyfFieldType`) | Componente PO-UI | Disponível no PO-UI? |
|---|---|---|
| `input` | `po-input` | ✅ |
| `textarea` | `po-textarea` | ✅ |
| `richtext` | `po-rich-text` | ✅ |
| `select` | `po-select` / `po-radio-group` | ✅ |
| `radiogroup` | `po-radio-group` | ✅ |
| `checkbox` | `po-checkbox` / `po-checkbox-group` | ✅ |
| `toggle` | `po-switch` | ✅ |
| `datetime` | `po-datepicker` | ✅ |
| `lookup` | `po-lookup` | ✅ |
| `attachment` | `po-upload` | ✅ |
| `info` | `po-info` | ✅ (display only) |
| `photo` | `po-upload` (imagem) + `po-image` | ⚠️ Combinação — sem componente nativo |
| `formula` | —  | ❌ Não existe no PO-UI — custom necessário |
| `qrcode` | — | ❌ Não existe no PO-UI — custom necessário |
| `signature` | — | ❌ Não existe no PO-UI — custom necessário (canvas) |

---

## Índice

1. [PoDynamicForm — componente central](#1-podynamicform)
2. [PoDynamicView — visualização de dados](#2-podynamicview)
3. [PoTable — grid/listagem](#3-potable)
4. [PoInput — campo de texto](#4-poinput)
5. [PoSelect — seleção simples](#5-poselect)
6. [PoSwitch — toggle](#6-poswitch-toggle)
7. [PoCheckbox / PoCheckboxGroup — checkbox](#7-pocheckbox--pocheckboxgroup)
8. [PoRadioGroup — grupo de rádio](#8-poradiogroup)
9. [PoDatepicker — data e datetime](#9-podatepicker)
10. [PoRichText — editor rico](#10-porichtext)
11. [PoUpload — anexo / foto](#11-poupload)
12. [PoInfo — exibição de dado](#12-poinfo)
13. [PoDynamicField — interface base](#13-podynamicfield-interface-base)
14. [PoDynamicFormField — interface dos campos do Dynamic Form](#14-podynamicformfield)
15. [PoTableColumn — interface das colunas do PoTable](#15-potablecolumn)
16. [Componentes sem suporte nativo no PO-UI](#16-componentes-sem-suporte-nativo)
17. [Mapeamento de tipos DyfField → PO-UI](#17-mapeamento-de-tipos)

---

## 1. PoDynamicForm

**Selector:** `<po-dynamic-form>`
**Import:** `PoDynamicModule` ou `PoDynamicFormComponent`
**Propósito:** Renderiza um formulário completo a partir de um array de objetos `PoDynamicFormField[]`. É o coração do `dyf-form`.

### Como funciona

- Recebe `p-fields` (array de `PoDynamicFormField`) e `p-value` (objeto com os dados iniciais).
- Determina o componente a renderizar com base no `type` e nas propriedades do campo:
  - `boolean` → `po-switch` (ou `po-checkbox` se `forceBooleanComponentType`)
  - `currency` / `number` → `po-decimal` ou `po-input` (com máscara)
  - `date` / `dateTime` → `po-datepicker` / `po-datepicker-range`
  - `options` com ≤ 3 itens → `po-radio-group` / `po-checkbox-group`
  - `options` com > 3 itens → `po-select` / `po-multiselect`
  - `optionsService` → `po-combo`
  - `searchService` → `po-lookup`
  - `url` (upload) → `po-upload`
  - demais → `po-input` / `po-textarea` / `po-password`

### Acessar o valor via `@ViewChild`

```typescript
@ViewChild('dynamicForm') dynamicForm!: PoDynamicFormComponent;

// acessar valor atual
const value = this.dynamicForm.value;
```

### Inputs

| Propriedade | Tipo | Padrão | Descrição |
|---|---|---|---|
| `p-fields` | `PoDynamicFormField[]` | `[]` | Definição dos campos |
| `p-value` | `any` | — | Objeto com os valores iniciais |
| `p-auto-focus` | `string` | — | `property` do campo que recebe foco ao iniciar |
| `p-load` | `string \| Function` | — | Função/endpoint chamado na inicialização; pode retornar atualizações de campos |
| `p-validate` | `string \| Function` | — | Função/endpoint chamado ao mudar campos listados em `p-validate-fields` |
| `p-validate-fields` | `string[]` | — | Campos que disparam o `p-validate` |
| `p-components-size` | `'small' \| 'medium'` | `'medium'` | Tamanho dos componentes do formulário |
| `p-group-form` | `boolean` | `false` | Usa o `FormGroup` do componente pai |
| `p-validate-on-input` | `boolean` | `false` | Emite valores a cada caractere digitado |

### Outputs

| Evento | Tipo | Descrição |
|---|---|---|
| `p-form` | `NgForm` | Emite a instância `NgForm` ao inicializar |

---

## 2. PoDynamicView

**Selector:** `<po-dynamic-view>`
**Import:** `PoDynamicModule` ou `PoDynamicViewComponent`
**Propósito:** Renderiza dados em modo **somente leitura** usando `po-info` como base. Usado no `dyf-detail`.

### Inputs

| Propriedade | Tipo | Padrão | Descrição |
|---|---|---|---|
| `p-fields` | `PoDynamicViewField[]` | `[]` | Definição dos campos a exibir |
| `p-value` | `object` | — | Objeto com os dados a exibir |
| `p-show-all-value` | `boolean` | `false` | Exibe todas as propriedades do objeto, mesmo sem campo definido |
| `p-text-wrap` | `boolean` | `false` | Habilita quebras de linha com `\n` |
| `p-load` | `string \| Function` | — | Função/endpoint chamada na inicialização |
| `p-components-size` | `'small' \| 'medium'` | `'medium'` | Tamanho dos componentes |

### PoDynamicViewField — propriedades relevantes

Estende `PoDynamicField` (ver [seção 6](#6-podynamicfield-interface-base)). Propriedades adicionais:

| Propriedade | Tipo | Descrição |
|---|---|---|
| `tag` | `boolean` | Renderiza o valor como tag em vez de po-info |
| `format` | `string` | Formatação customizada (datas, números) |
| `searchService` | `string \| PoLookupFilter` | Serviço para buscar o label a partir do valor |
| `optionsService` | `string \| PoComboFilter` | Serviço para resolver options |
| `optionsMulti` | `boolean` | Permite múltiplos valores |
| `fieldLabel` | `string` | Propriedade usada como label (padrão: `"label"`) |
| `fieldValue` | `string` | Propriedade usada como valor (padrão: `"value"`) |
| `concatLabelValue` | `boolean` | Exibe `"label - value"` |
| `isArrayOrObject` | `boolean` | Lida com dados complexos (arrays/objetos) |
| `container` | `string` | Título do grupo/seção |
| `params` | `any` | Parâmetros extras para o serviço |

---

## 3. PoTable

**Selector:** `<po-table>`
**Import:** `PoTableModule`
**Propósito:** Grid/tabela de dados. Usado no `dyf-grid`.

### Inputs principais

| Propriedade | Tipo | Padrão | Descrição |
|---|---|---|---|
| `p-items` | `any[]` | `[]` | Array de dados a exibir |
| `p-columns` | `PoTableColumn[]` | — | Definição das colunas; padrão: chaves do primeiro item |
| `p-actions` | `PoTableAction[]` | — | Ações contextuais por linha (menu ou botões) |
| `p-loading` | `boolean` | `false` | Estado de carregamento |
| `p-selectable` | `boolean` | `false` | Habilita seleção de linhas |
| `p-single-select` | `boolean` | `false` | Limita a uma seleção por vez |
| `p-sort` | `boolean` | `false` | Habilita ordenação por coluna |
| `p-striped` | `boolean` | `false` | Linhas alternadas com cor de fundo |
| `p-height` | `number` | — | Altura fixa em px (ativa scroll virtual) |
| `p-virtual-scroll` | `boolean` | `true` | Scroll virtual para performance |
| `p-service-api` | `string` | — | Endpoint para busca paginada de dados |
| `p-infinite-scroll` | `boolean` | `false` | Carrega mais ao rolar |
| `p-draggable` | `boolean` | `false` | Reordenação de colunas por drag-and-drop |
| `p-hide-columns-manager` | `boolean` | `false` | Esconde o gerenciador de colunas |
| `p-spacing` | `PoTableColumnSpacing` | `'medium'` | Espaçamento das células (`small \| medium \| large`) |
| `p-literals` | `PoTableLiterals` | — | Textos customizáveis (multi-idioma) |

### Outputs

| Evento | Payload | Descrição |
|---|---|---|
| `p-selected` | `any` | Linha selecionada |
| `p-unselected` | `any` | Linha desselecionada |
| `p-all-selected` | `any[]` | Todas as linhas selecionadas |
| `p-sort-by` | `PoTableColumnSort` | Coluna e direção de ordenação |
| `p-show-more` | `PoTableColumnSort` | Paginação / scroll infinito |
| `p-expanded` | `any` | Linha de detalhe expandida |
| `p-collapsed` | `any` | Linha de detalhe recolhida |
| `p-delete-items` | `any[]` | Itens deletados |
| `p-change-visible-columns` | `string[]` | Colunas com visibilidade alterada |

---

## 4. PoInput

**Selector:** `<po-input>`
**Import:** `PoFieldModule` ou `PoInputComponent`
**Propósito:** Campo de texto genérico — base para entender os demais campos PO-UI.

### Inputs principais

| Propriedade | Tipo | Padrão | Descrição |
|---|---|---|---|
| `name` | `string` | Obrigatório | Identificador do campo |
| `p-label` | `string` | — | Rótulo visível |
| `p-placeholder` | `string` | `''` | Texto de placeholder |
| `p-help` | `string` | — | Texto de suporte abaixo do campo |
| `p-required` | `boolean` | `false` | Campo obrigatório |
| `p-disabled` | `boolean` | `false` | Desabilita o campo |
| `p-readonly` | `boolean` | `false` | Campo somente leitura |
| `p-mask` | `string` | `''` | Máscara (ex: `(99) 99999-9999`) |
| `p-mask-format-model` | `boolean` | `false` | Model recebe valor formatado |
| `p-pattern` | `string` | — | Regex de validação |
| `p-maxlength` | `number` | — | Máximo de caracteres |
| `p-minlength` | `number` | — | Mínimo de caracteres |
| `p-clean` | `boolean` | `false` | Botão para limpar o campo |
| `p-icon` | `string \| TemplateRef` | — | Ícone no início do campo |
| `p-loading` | `boolean` | `false` | Ícone de loading no campo |
| `p-no-autocomplete` | `boolean` | `false` | Desativa autocomplete nativo |
| `p-upper-case` | `boolean` | `false` | Converte para maiúsculas automaticamente |
| `p-size` | `'small' \| 'medium'` | `'medium'` | Altura do campo |
| `p-error-pattern` | `string` | `''` | Mensagem de erro de máscara/padrão |
| `p-optional` | `boolean` | — | Exibe indicador de campo opcional |
| `p-auto-focus` | `boolean` | `false` | Foco automático ao iniciar |

### Outputs

| Evento | Descrição |
|---|---|
| `p-blur` | Campo perde foco |
| `p-change` | Valor alterado + campo perde foco |
| `p-change-model` | Valor do model alterado |
| `p-enter` | Campo ganha foco |
| `p-keydown` | Tecla pressionada (retorna `KeyboardEvent`) |

---

## 5. PoSelect

**Selector:** `<po-select>`
**Import:** `PoFieldModule` ou `PoSelectComponent`
**Propósito:** Select simples com lista de opções estáticas. Para opções dinâmicas, usar `po-combo`.

### Inputs principais

| Propriedade | Tipo | Descrição |
|---|---|---|
| `p-options` | `PoSelectOption[]` | Array de opções `{ label, value }` |
| `p-placeholder` | `string` | Placeholder |
| `p-readonly` | `boolean` | Somente leitura |
| `p-loading` | `boolean` | Estado de carregamento |
| `p-disabled` | `boolean` | Desabilitado |
| `p-field-label` | `string` | Propriedade do objeto usada como label (padrão: `"label"`) |
| `p-field-value` | `string` | Propriedade do objeto usada como value (padrão: `"value"`) |
| `p-size` | `'small' \| 'medium'` | Tamanho |

### Outputs

| Evento | Descrição |
|---|---|
| `p-blur` | Campo perde foco |
| `ngModelChange` | Valor alterado |

---

## 6. PoSwitch (toggle)

**Selector:** `<po-switch>`
**Import:** `PoFieldModule` ou `PoSwitchComponent`
**Propósito:** Toggle on/off. Corresponde ao tipo `toggle` / `boolean`.

### Inputs principais

| Propriedade | Tipo | Padrão | Descrição |
|---|---|---|---|
| `p-label-on` | `string` | `'true'` | Texto exibido quando `true` |
| `p-label-off` | `string` | `'false'` | Texto exibido quando `false` |
| `p-label-position` | `PoSwitchLabelPosition` | `Right` | Posição do label (Left / Right) |
| `p-format-model` | `boolean` | `false` | Model recebe o texto do label em vez do boolean |
| `p-hide-label-status` | `boolean` | `false` | Esconde o indicador de estado |
| `p-disabled` | `boolean` | `false` | Desabilitado |
| `p-required` | `boolean` | `false` | Obrigatório |
| `p-size` | `'small' \| 'medium'` | `'medium'` | Tamanho |
| `p-loading` | `boolean` | `false` | Estado de carregamento |

### Outputs

| Evento | Descrição |
|---|---|
| `p-change` | Valor alterado |

---

## 7. PoCheckbox / PoCheckboxGroup

### PoCheckbox — checkbox individual

**Selector:** `<po-checkbox>`

| Propriedade | Tipo | Padrão | Descrição |
|---|---|---|---|
| `p-label` | `string` | — | Texto do checkbox |
| `p-disabled` | `boolean` | `false` | Desabilitado |
| `p-required` | `boolean` | `false` | Obrigatório |
| `p-size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Tamanho (small = 16px, medium = 24px, large = 32px) |
| `p-help` | `string` | — | Texto de suporte |
| `p-auto-focus` | `boolean` | `false` | Foco automático |

**Outputs:** `p-blur`, `p-change`, `p-keydown`

---

### PoCheckboxGroup — grupo de checkboxes

**Selector:** `<po-checkbox-group>`

| Propriedade | Tipo | Padrão | Descrição |
|---|---|---|---|
| `p-options` | `PoCheckboxGroupOption[]` | — | Opções `{ label, value, disabled? }` |
| `p-columns` | `number` | `2` | Colunas de exibição (1–4) |
| `p-disabled` | `boolean` | `false` | Desabilita todos os itens |
| `p-required` | `boolean` | `false` | Obrigatório |
| `p-indeterminate` | `boolean` | `false` | Permite valor `null` (indeterminado) |
| `p-size` | `'small' \| 'medium'` | `'medium'` | Tamanho |
| `p-label` | `string` | — | Rótulo do grupo |
| `p-help` | `string` | — | Texto de suporte |

**Outputs:** `p-change`, `p-keydown`

---

## 8. PoRadioGroup

**Selector:** `<po-radio-group>`
**Import:** `PoFieldModule` ou `PoRadioGroupComponent`
**Propósito:** Grupo de rádios para seleção exclusiva. Renderizado automaticamente pelo `PoDynamicForm` quando `options` tem ≤ 3 itens.

| Propriedade | Tipo | Padrão | Descrição |
|---|---|---|---|
| `p-options` | `PoRadioGroupOption[]` | — | Opções `{ label, value, disabled? }` |
| `p-columns` | `number` | `2` | Colunas de exibição (1–4; máx 1 em sm, 2 em md) |
| `p-disabled` | `boolean` | `false` | Desabilitado |
| `p-required` | `boolean` | `false` | Obrigatório |
| `p-size` | `'small' \| 'medium'` | `'medium'` | Tamanho (small = 16px AA only, medium = 24px) |
| `p-label` | `string` | — | Rótulo do grupo |
| `p-help` | `string` | — | Texto de suporte |

**Outputs:** `p-change`, `p-keydown`

---

## 9. PoDatepicker

**Selector:** `<po-datepicker>`
**Import:** `PoFieldModule` ou `PoDatepickerComponent`
**Propósito:** Seletor de data. Para `datetime` usar `po-datepicker` com `p-iso-format`. Para intervalo de datas usar `po-datepicker-range`.

| Propriedade | Tipo | Padrão | Descrição |
|---|---|---|---|
| `p-format` | `string` | `'dd/mm/yyyy'` | Formato de exibição (`dd/mm/yyyy`, `mm/dd/yyyy`, `yyyy/mm/dd`) |
| `p-iso-format` | `PoDatepickerIsoFormat` | — | Formato ISO do model de saída |
| `p-min-date` | `string \| Date` | — | Data mínima permitida |
| `p-max-date` | `string \| Date` | — | Data máxima permitida |
| `p-locale` | `string` | browser | Locale de exibição (pt, en, es) |
| `p-placeholder` | `string` | `''` | Placeholder |
| `p-required` | `boolean` | `false` | Obrigatório |
| `p-disabled` | `boolean` | `false` | Desabilitado |
| `p-readonly` | `boolean` | `false` | Somente leitura |
| `p-clean` | `boolean` | `false` | Botão para limpar o valor |
| `p-loading` | `boolean` | `false` | Estado de carregamento |
| `p-size` | `'small' \| 'medium'` | `'medium'` | Tamanho |
| `p-error-pattern` | `string` | `''` | Mensagem de data inválida ou fora do período |
| `p-append-in-body` | `boolean` | `false` | Calendário renderizado no body da página |

**Outputs:** `p-blur`, `p-change`, `p-keydown`

> Para `datetime` (data + hora), usar `type: 'dateTime'` no `PoDynamicFormField` — o Dynamic Form renderizará um datepicker com suporte a hora.

---

## 10. PoRichText

**Selector:** `<po-rich-text>`
**Import:** `PoFieldModule` ou `PoRichTextComponent`
**Propósito:** Editor de texto rico com toolbar (negrito, itálico, listas, alinhamento, links, imagens).

| Propriedade | Tipo | Padrão | Descrição |
|---|---|---|---|
| `p-label` | `string` | — | Rótulo |
| `p-placeholder` | `string` | `''` | Placeholder |
| `p-height` | `number` | — | Altura do editor (min 94px, max 262px) |
| `p-required` | `boolean` | `false` | Obrigatório |
| `p-readonly` | `boolean` | `false` | Somente leitura |
| `p-disabled-text-align` | `boolean` | `false` | Desabilita ações de alinhamento na toolbar |
| `p-hide-toolbar-actions` | `PoRichTextToolbarActions[]` | `[]` | Esconde ações específicas da toolbar |
| `p-error-message` | `string` | `''` | Mensagem de erro quando campo obrigatório está vazio |
| `p-size` | `'small' \| 'medium'` | `'medium'` | Tamanho |
| `p-help` | `string` | — | Texto de suporte |
| `p-optional` | `boolean` | `false` | Exibe indicador de opcional |

**Outputs:** `p-change`, `p-change-model`, `p-keydown`

> ⚠️ `po-rich-text` **não** é suportado como `type` pelo `PoDynamicFormField`. Para usar em formulários dinâmicos, é necessário um `cellTemplate` ou componente customizado.

---

## 11. PoUpload

**Selector:** `<po-upload>`
**Import:** `PoFieldModule` ou `PoUploadComponent`
**Propósito:** Upload de arquivos. Cobre os tipos `attachment` e `photo` (com restrição de imagem).

| Propriedade | Tipo | Padrão | Descrição |
|---|---|---|---|
| `p-url` | `string` | — | Endpoint de envio (obrigatório por padrão) |
| `p-auto-upload` | `boolean` | `false` | Envia automaticamente ao selecionar |
| `p-multiple` | `boolean` | `false` | Permite múltiplos arquivos |
| `p-drag-drop` | `boolean` | `false` | Área de drag-and-drop |
| `p-drag-drop-height` | `number` | `320` | Altura da área de drag-drop (mín: 160px) |
| `p-directory` | `boolean` | `false` | Permite selecionar diretório |
| `p-restrictions` | `PoUploadFileRestrictions` | — | Restrições: `allowedExtensions`, `maxFileSize`, `minFileSize`, `maxFiles` |
| `p-form-field` | `string` | `'files'` | Nome do campo no FormData enviado |
| `p-headers` | `object` | — | Headers HTTP customizados |
| `p-show-thumbnail` | `boolean` | `true` | Preview de imagens ao anexar |
| `p-hide-select-button` | `boolean` | `false` | Esconde botão de seleção |
| `p-hide-send-button` | `boolean` | `false` | Esconde botão de envio |
| `p-hide-restrictions-info` | `boolean` | `false` | Esconde informações de restrições |
| `p-disabled-remove-file` | `boolean` | `false` | Desabilita remoção de arquivo |
| `p-required-url` | `boolean` | `true` | Torna `p-url` obrigatória |
| `p-required` | `boolean` | `false` | Campo obrigatório |
| `p-disabled` | `boolean` | `false` | Desabilitado |
| `p-size` | `'small' \| 'medium'` | `'medium'` | Tamanho |

**Outputs:** `p-upload`, `p-success`, `p-error`, `p-cancel`, `p-remove`, `p-open-modal-preview`, `p-custom-action-click`

> Para `photo`: usar `p-restrictions: { allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'] }` + `p-show-thumbnail: true`.

---

## 12. PoInfo

**Selector:** `<po-info>`
**Import:** `PoInfoModule` ou `PoInfoComponent`
**Propósito:** Exibição de um par label/valor em modo somente leitura. Componente base do `PoDynamicView`.

| Propriedade | Tipo | Padrão | Descrição |
|---|---|---|---|
| `p-label` | `string` | — | Rótulo |
| `p-value` | `string` | — | Valor a exibir |
| `p-url` | `string` | — | Se informado, exibe o valor como link |
| `p-orientation` | `PoInfoOrientation` | `'vertical'` | Orientação: `vertical` ou `horizontal` |
| `p-label-size` | `number` | — | Colunas usadas pelo label (1–11) na orientação horizontal |
| `p-size` | `'small' \| 'medium'` | `'medium'` | Tamanho |

---

## 13. PoDynamicField (interface base)

Interface base estendida por `PoDynamicFormField` e `PoDynamicViewField`.

| Propriedade | Tipo | Padrão | Descrição |
|---|---|---|---|
| `property` | `string` | Obrigatório | Nome da propriedade mapeada ao objeto de dados |
| `label` | `string` | Nome capitalizado | Rótulo exibido |
| `type` | `string \| PoDynamicFieldType` | `'string'` | Tipo do dado/componente |
| `visible` | `boolean` | `true` | Exibição do campo |
| `divider` | `string` | — | Título de divisor exibido acima do campo |
| `container` | `string` | — | Agrupa campos num container com título |
| `gridColumns` | `number` | — | Largura genérica em colunas (1–12) |
| `gridSmColumns` | `number` | `12` | Largura em telas pequenas |
| `gridMdColumns` | `number` | `6` | Largura em telas médias |
| `gridLgColumns` | `number` | `4` | Largura em telas grandes |
| `gridXlColumns` | `number` | `3` | Largura em telas extra-grandes |
| `offsetColumns` | `number` | — | Offset genérico (1–12) |
| `offsetSmColumns` | `number` | — | Offset em telas pequenas |
| `offsetMdColumns` | `number` | — | Offset em telas médias |
| `offsetLgColumns` | `number` | — | Offset em telas grandes |
| `offsetXlColumns` | `number` | — | Offset em telas extra-grandes |
| `key` | `boolean` | — | Marca o campo como chave identificadora |

---

## 14. PoDynamicFormField

Estende `PoDynamicField`. Todas as propriedades abaixo são **adicionais** à base.

### Validação e restrições

| Propriedade | Tipo | Descrição |
|---|---|---|
| `required` | `boolean` | Campo obrigatório |
| `optional` | `boolean` | Exibe indicador de opcional |
| `disabled` | `boolean` | Desabilita o campo |
| `readonly` | `boolean` | Somente leitura |
| `pattern` | `string` | Regex de validação |
| `minLength` | `number` | Mínimo de caracteres |
| `maxLength` | `number` | Máximo de caracteres |
| `minValue` | `string \| number` | Valor mínimo (número/data) |
| `maxValue` | `string \| number` | Valor máximo (número/data) |
| `errorMessage` | `string` | Mensagem quando inválido |
| `errorLimit` | `boolean` | Limita a mensagem de erro a duas linhas |
| `errorAsyncFunction` | `(value) => Observable<boolean>` | Validação assíncrona |
| `requiredFieldErrorMessage` | `boolean` | Exibe mensagem de erro em campo vazio obrigatório |
| `validate` | `string \| Function` | Função/endpoint chamado ao mudar o campo |

### Display e UX

| Propriedade | Tipo | Descrição |
|---|---|---|
| `placeholder` | `string` | Placeholder |
| `help` | `string` | Texto de suporte |
| `helper` | `string \| PoHelperOptions` | Componente de ajuda ao lado do label |
| `icon` | `string \| TemplateRef<void>` | Ícone no início do campo |
| `clean` | `boolean` | Botão para limpar valor |
| `noAutocomplete` | `boolean` | Desativa autocomplete nativo |
| `order` | `number` | Ordem de exibição (inteiro positivo) |
| `showRequired` | `boolean` | Exibe indicador de obrigatório |
| `size` | `string` | Tamanho: `small \| medium` |
| `compactLabel` | `boolean` | Layout compacto do label |

### Máscara e formatação

| Propriedade | Tipo | Descrição |
|---|---|---|
| `mask` | `string` | Máscara de entrada (ex: `(99) 99999-9999`) |
| `maskFormatModel` | `boolean` | Model recebe valor formatado pela máscara |
| `maskNoLengthValidation` | `boolean` | Conta apenas alfanuméricos na validação de tamanho |
| `decimalsLength` | `number` | Casas decimais para `currency`/`decimal` |
| `thousandMaxlength` | `number` | Dígitos máximos antes do separador decimal (máx: 13) |
| `format` | `string \| string[]` | Formato de exibição ou propriedades a concatenar |
| `isoFormat` | `PoDatepickerIsoFormat` | Formato ISO de saída do datepicker |

### Select / Combo / Multiselect

| Propriedade | Tipo | Descrição |
|---|---|---|
| `options` | `Array<PoSelectOption \| any>` | Lista estática de opções `{ label, value }` |
| `optionsMulti` | `boolean` | Múltipla seleção |
| `optionsService` | `string \| PoComboFilter \| PoMultiselectFilter` | Serviço dinâmico de opções (usa `po-combo`) |
| `fieldLabel` | `string` | Propriedade do objeto usada como label (padrão: `"label"`) |
| `fieldValue` | `string` | Propriedade do objeto usada como value (padrão: `"value"`) |
| `filterMode` | `PoMultiselectFilterMode` | Modo de busca: `startsWith \| contains \| endsWith` |
| `filterMinlength` | `number` | Mínimo de caracteres para filtrar no combo |
| `debounceTime` | `number` | Delay em ms para disparar o filtro |
| `sort` | `boolean` | Ordena a lista de opções |
| `forceOptionsComponentType` | `ForceOptionComponentEnum` | Força `select` ou `radio-group` |
| `infiniteScroll` | `boolean` | Scroll infinito no combo/lookup |
| `infiniteScrollDistance` | `number` | % do scroll que dispara carregamento |
| `changeOnEnter` | `boolean` | Dispara `p-change` só ao pressionar Enter |
| `disabledInitFilter` | `boolean` | Desabilita filtro inicial no combo |
| `placeholderSearch` | `string` | Placeholder da busca no multiselect |
| `hideSearch` | `boolean` | Esconde campo de busca no multiselect |
| `hideSelectAll` | `boolean` | Esconde "Selecionar tudo" no multiselect |

### Lookup (busca avançada)

| Propriedade | Tipo | Descrição |
|---|---|---|
| `searchService` | `string \| PoLookupFilter` | Serviço para o `po-lookup` |
| `columns` | `PoLookupColumn[] \| number` | Colunas exibidas na busca avançada |
| `advancedFilters` | `PoLookupAdvancedFilter[]` | Filtros da busca avançada |
| `multiple` | `boolean` | Seleção múltipla no lookup |
| `params` | `any` | Parâmetros extras enviados ao serviço |

### Boolean / Switch

| Propriedade | Tipo | Descrição |
|---|---|---|
| `booleanTrue` | `string` | Texto exibido quando `true` |
| `booleanFalse` | `string` | Texto exibido quando `false` |
| `hideLabelStatus` | `boolean` | Esconde o indicador de estado no switch |
| `formatModel` | `boolean` | Model recebe o texto do label (booleanTrue/booleanFalse) |
| `forceBooleanComponentType` | `ForceBooleanComponentEnum` | Força `switch` ou `checkbox` |
| `labelPosition` | `PoSwitchLabelPosition` | Posição do label no switch |

### Datepicker / Range

| Propriedade | Tipo | Descrição |
|---|---|---|
| `range` | `boolean` | Ativa seleção de intervalo de datas |

### Textarea / Password

| Propriedade | Tipo | Descrição |
|---|---|---|
| `rows` | `number` | Número de linhas visíveis no textarea |
| `secret` | `boolean` | Esconde o conteúdo (modo senha) |
| `hidePasswordPeek` | `boolean` | Esconde o toggle de visibilidade em `po-password` |

### Upload

| Propriedade | Tipo | Descrição |
|---|---|---|
| `url` | `string` | Endpoint para envio do arquivo |
| `autoUpload` | `boolean` | Envia automaticamente ao selecionar |
| `dragDrop` | `boolean` | Área de drag-and-drop |
| `dragDropHeight` | `number` | Altura da área de drag-drop (mín: 160px) |
| `directory` | `boolean` | Permite selecionar diretório |
| `multiple` | `boolean` | Múltiplos arquivos |
| `restrictions` | `PoUploadFileRestrictions` | Restrições de tamanho/extensão |
| `formField` | `string` | Nome do campo no form enviado (padrão: `"files"`) |
| `headers` | `{ [name: string]: string \| string[] }` | Headers HTTP do upload |
| `autoHeight` | `boolean` | Altura automática |
| `showThumbnail` | `boolean` | Preview da imagem selecionada |
| `onError` | `Function` | Callback de erro |
| `onSuccess` | `Function` | Callback de sucesso |
| `onUpload` | `Function` | Executado durante o upload (pode adicionar dados) |

---

## 15. PoTableColumn

Interface que define cada coluna do `po-table`.

| Propriedade | Tipo | Descrição |
|---|---|---|
| `property` | `string` | Nome da propriedade do objeto (suporta notação de ponto) |
| `label` | `string` | Cabeçalho; padrão: `property` capitalizado |
| `type` | `string` | Tipo: `boolean \| currency \| date \| dateTime \| detail \| icon \| label \| link \| number \| string \| subtitle \| time \| cellTemplate \| columnTemplate`. Padrão: `'string'` |
| `visible` | `boolean` | Visibilidade da coluna (padrão: `true`) |
| `sortable` | `boolean` | Permite ordenar a coluna (padrão: `true`) |
| `width` | `string` | Largura (ex: `'150px'`); mínimo 32px |
| `fixed` | `boolean` | Coluna fixa (não rola horizontalmente) |
| `format` | `string` | Formatação para `currency`, `date`, `time`, `number` |
| `color` | `string \| Function` | Cor do conteúdo (`color-01` … `color-12` ou função) |
| `action` | `Function` | Ação ao clicar (para tipos `link` ou `icon`) |
| `disabled` | `Function` | Retorna `boolean` para habilitar/desabilitar link |
| `boolean` | `PoTableBoolean` | Labels para colunas booleanas (padrão: "Sim" / "Não") |
| `icons` | `PoTableColumnIcon[]` | Ícones com ação e cor por valor |
| `labels` | `PoTableColumnLabel[]` | Labels visuais por valor específico |
| `subtitles` | `PoTableSubtitleColumn[]` | Legenda com subtítulos |
| `detail` | `PoTableDetail` | Configuração de detalhe expansível (master-detail) |
| `link` | `string` | Propriedade do objeto contendo a URL de redirect |
| `tooltip` | `string` | Tooltip ao passar o mouse (apenas para `link`) |

### PoTableAction (para `p-actions`)

```typescript
interface PoTableAction {
  label: string;           // texto do item
  action: (row: any) => void; // callback ao clicar
  disabled?: boolean | ((row: any) => boolean);
  icon?: string;           // ícone PO-UI
  type?: 'danger';         // estilo destrutivo
  separator?: boolean;     // linha separadora antes
  visible?: boolean | ((row: any) => boolean);
}
```

---

## 16. Componentes sem suporte nativo no PO-UI

Os três tipos abaixo **não existem** no PO-UI e precisarão de implementação customizada no DynaForm.

### `formula`
Campo calculado a partir de outros campos do formulário. Sugestão:
- Componente Angular standalone `dyf-formula` com `ngModel`
- Recebe expressão (ex: `"fieldA * fieldB"`) e campos de dependência
- Recalcula ao detectar mudanças nos campos dependentes via `p-validate`

### `photo`
Captura/upload de foto. Sugestão:
- Reutilizar `po-upload` com restrições de extensão de imagem
- Adicionar preview usando `po-image` ou tag `<img>`
- Opcionalmente, acesso à câmera via `navigator.mediaDevices` (campo extra fora do PO-UI)

### `qrcode`
Geração ou leitura de QR Code. Sugestão:
- Exibição: biblioteca `qrcode` (npm) renderizando em `<canvas>`
- Leitura: biblioteca `jsQR` ou `@zxing/browser`
- Componente standalone `dyf-qrcode` com `@Input() value`

### `signature`
Assinatura digital em canvas. Sugestão:
- Biblioteca `signature_pad` (npm)
- Componente standalone `dyf-signature` que exporta a assinatura como PNG base64

---

## 17. Mapeamento de tipos

### DyfFieldType → PoDynamicFormField.type

Tipos cobertos pelo `PoDynamicForm` nativamente:

| DyfFieldType | PoDynamicFormField.type | Componente renderizado |
|---|---|---|
| `input` / `text` | `string` | `po-input` |
| `number` | `number` | `po-decimal` / `po-input` |
| `currency` | `currency` | `po-decimal` |
| `date` | `date` | `po-datepicker` |
| `datetime` | `dateTime` | `po-datepicker` (com hora) |
| `toggle` / `boolean` | `boolean` | `po-switch` (ou `po-checkbox` via `forceBooleanComponentType`) |
| `checkbox` | `boolean` + `forceBooleanComponentType: checkbox` | `po-checkbox-group` |
| `radiogroup` / `select` (≤ 3 opts) | `string` + `options` ≤ 3 | `po-radio-group` |
| `select` (> 3 opts) | `string` + `options` > 3 | `po-select` |
| `select` (dinâmico) | `string` + `optionsService` | `po-combo` |
| `multiselect` | `string` + `optionsMulti: true` | `po-multiselect` |
| `textarea` | `string` + `rows > 1` | `po-textarea` |
| `password` | `string` + `secret: true` | `po-password` |
| `email` | `string` + `pattern` de e-mail | `po-input` |
| `phone` | `string` + `mask` de telefone | `po-input` |
| `cpf` | `string` + `mask: '999.999.999-99'` | `po-input` |
| `cnpj` | `string` + `mask: '99.999.999/9999-99'` | `po-input` |
| `lookup` | `string` + `searchService` | `po-lookup` |
| `attachment` | `string` + `url` | `po-upload` |

Tipos que **não** são cobertos pelo `PoDynamicForm` e precisam de componente customizado:

| DyfFieldType | Estratégia |
|---|---|
| `richtext` | Componente standalone `dyf-richtext` wrapper do `po-rich-text` |
| `photo` | `po-upload` com restrições de imagem + `po-image` para preview |
| `info` | `po-info` standalone (read-only, sem binding de formulário) |
| `formula` | Componente customizado `dyf-formula` |
| `qrcode` | Componente customizado `dyf-qrcode` |
| `signature` | Componente customizado `dyf-signature` (canvas) |

---

### DyfFieldType → PoTableColumn.type

| DyfFieldType | PoTableColumn.type |
|---|---|
| `toggle` / `boolean` / `checkbox` | `'boolean'` |
| `date` / `datetime` | `'date'` |
| `currency` | `'currency'` |
| `number` | `'number'` |
| `attachment` / `photo` | `'link'` (URL do arquivo) |
| demais | `'string'` |
