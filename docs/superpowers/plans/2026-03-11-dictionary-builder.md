# Dictionary Builder Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar uma interface visual na demo app para montar dicionários `DyfTable`, com formulário de campos, preview ao vivo e persistência em localStorage.

**Architecture:** Módulo dedicado `dictionary-builder/` dentro de `dynaform-demo`, com 3 componentes standalone (FieldEditorModal, PreviewPanel, DictionaryBuilderComponent), 1 serviço de persistência, e rota `/builder` adicionada ao roteador existente. O `AppComponent` é refatorado para shell com `<router-outlet>`; o conteúdo atual da demo é movido para um novo `DemoComponent`.

**Tech Stack:** Angular 19 standalone components, PO-UI 19 (`PoModalModule`, `PoTableModule`, `PoFieldModule`, `PoButtonModule`, `PoTabsModule`, `PoNotificationService`), FormsModule (ngModel), localStorage API.

---

## Chunk 1: Service + Routing Setup

### Task 1: DictionaryBuilderService

**Files:**
- Create: `projects/dynaform-demo/src/app/dictionary-builder/dictionary-builder.service.ts`
- Create: `projects/dynaform-demo/src/app/dictionary-builder/dictionary-builder.service.spec.ts`

- [ ] **Step 1: Criar o serviço**

```typescript
// projects/dynaform-demo/src/app/dictionary-builder/dictionary-builder.service.ts
import { Injectable } from '@angular/core';
import { DyfTable } from 'dynaform';

const KEY_PREFIX = 'dyf_table_';

@Injectable({ providedIn: 'root' })
export class DictionaryBuilderService {
  private storageKey(tableName: string, revision: number): string {
    return `${KEY_PREFIX}${tableName}_${revision}`;
  }

  save(table: DyfTable): void {
    localStorage.setItem(this.storageKey(table.tableName, table.revision), JSON.stringify(table));
  }

  load(tableName: string, revision: number): DyfTable | null {
    const raw = localStorage.getItem(this.storageKey(tableName, revision));
    return raw ? (JSON.parse(raw) as DyfTable) : null;
  }

  loadAll(): DyfTable[] {
    const tables: DyfTable[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(KEY_PREFIX)) {
        const raw = localStorage.getItem(k);
        if (raw) {
          try { tables.push(JSON.parse(raw) as DyfTable); } catch { /* skip corrupt entries */ }
        }
      }
    }
    return tables;
  }

  delete(tableName: string, revision: number): void {
    localStorage.removeItem(this.storageKey(tableName, revision));
  }

  exportJson(table: DyfTable): string {
    return JSON.stringify(table, null, 2);
  }

  async copyToClipboard(table: DyfTable): Promise<void> {
    await navigator.clipboard.writeText(this.exportJson(table));
  }
}
```

- [ ] **Step 2: Criar o spec**

```typescript
// projects/dynaform-demo/src/app/dictionary-builder/dictionary-builder.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { DictionaryBuilderService } from './dictionary-builder.service';
import { DyfTable } from 'dynaform';

const MOCK_TABLE: DyfTable = {
  tableName: 'test_table',
  revision: 1,
  label: 'Test',
  fields: [{ fieldName: 'id', property: 'id', label: 'ID', type: 'number', key: true }],
};

describe('DictionaryBuilderService', () => {
  let service: DictionaryBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DictionaryBuilderService);
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  it('should save and load a table', () => {
    service.save(MOCK_TABLE);
    expect(service.load('test_table', 1)).toEqual(MOCK_TABLE);
  });

  it('should return null for non-existent table', () => {
    expect(service.load('nonexistent', 1)).toBeNull();
  });

  it('should load all saved tables', () => {
    service.save(MOCK_TABLE);
    service.save({ ...MOCK_TABLE, tableName: 'other' });
    expect(service.loadAll().length).toBe(2);
  });

  it('should delete a table', () => {
    service.save(MOCK_TABLE);
    service.delete('test_table', 1);
    expect(service.load('test_table', 1)).toBeNull();
  });

  it('should export JSON with 2-space indent', () => {
    expect(service.exportJson(MOCK_TABLE)).toBe(JSON.stringify(MOCK_TABLE, null, 2));
  });
});
```

- [ ] **Step 3: Commit**

```bash
git add projects/dynaform-demo/src/app/dictionary-builder/
git commit -m "feat: add DictionaryBuilderService with localStorage persistence"
```

---

### Task 2: Routing — Shell + DemoComponent

Refatorar `AppComponent` para shell com `<router-outlet>`. Mover o conteúdo atual da demo para `DemoComponent`. Adicionar rotas `''` e `'builder'`.

**Files:**
- Create: `projects/dynaform-demo/src/app/demo/demo.component.ts`
- Create: `projects/dynaform-demo/src/app/demo/demo.component.html`
- Modify: `projects/dynaform-demo/src/app/app.component.ts`
- Modify: `projects/dynaform-demo/src/app/app.component.html`
- Modify: `projects/dynaform-demo/src/app/app.routes.ts`

- [ ] **Step 1: Criar DemoComponent (conteúdo atual do AppComponent)**

```typescript
// projects/dynaform-demo/src/app/demo/demo.component.ts
import { Component } from '@angular/core';
import { PoButtonModule } from '@po-ui/ng-components';
import { DyfFormComponent, DyfGridComponent, DyfDetailComponent, DyfTable } from 'dynaform';

const SAMPLE_TABLE: DyfTable = {
  tableName: 'customers',
  revision: 1,
  label: 'Clientes',
  endpoint: '/api/customers',
  fields: [
    { fieldName: 'id',        property: 'id',        label: 'ID',               type: 'number',  order: 1, key: true,  visibleOnForm: false, gridColumns: 2 },
    { fieldName: 'name',      property: 'name',      label: 'Nome',             type: 'string',  order: 2, required: true, gridColumns: 6 },
    { fieldName: 'email',     property: 'email',     label: 'E-mail',           type: 'string',  order: 3, required: true, gridColumns: 6 },
    { fieldName: 'phone',     property: 'phone',     label: 'Telefone',         type: 'string',  order: 4, mask: '(99) 99999-9999', gridColumns: 4 },
    { fieldName: 'active',    property: 'active',    label: 'Ativo',            type: 'boolean', order: 5, gridColumns: 2 },
    { fieldName: 'createdAt', property: 'createdAt', label: 'Data de Cadastro', type: 'date',    order: 6, visibleOnForm: false, gridColumns: 4 },
  ],
};

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [PoButtonModule, DyfFormComponent, DyfGridComponent, DyfDetailComponent],
  templateUrl: './demo.component.html',
})
export class DemoComponent {
  table = SAMPLE_TABLE;
  view: 'grid' | 'form' | 'detail' = 'grid';
  selectedItem: any = null;

  items = [
    { id: 1, name: 'Maria Silva', email: 'maria@email.com', phone: '11999990000', active: true, createdAt: '2025-01-15' },
    { id: 2, name: 'João Souza', email: 'joao@email.com', phone: '11988880000', active: false, createdAt: '2025-03-22' },
  ];

  onEdit(row: any): void { this.selectedItem = { ...row }; this.view = 'form'; }
  onViewDetail(row: any): void { this.selectedItem = row; this.view = 'detail'; }
  onDelete(row: any): void { this.items = this.items.filter(i => i.id !== row.id); }

  onSave(value: any): void {
    const idx = this.items.findIndex(i => i.id === value.id);
    this.items = idx >= 0
      ? this.items.map(i => (i.id === value.id ? value : i))
      : [...this.items, { ...value, id: Date.now() }];
    this.view = 'grid';
  }

  newRecord(): void { this.selectedItem = {}; this.view = 'form'; }
  back(): void { this.view = 'grid'; }
}
```

- [ ] **Step 2: Criar template do DemoComponent**

```html
<!-- projects/dynaform-demo/src/app/demo/demo.component.html -->
<div class="po-wrapper">
  <div class="po-p-4">

    @if (view === 'grid') {
      <div class="po-mb-3 po-d-flex po-row po-justify-content-between po-align-items-center">
        <h2 class="po-title">{{ table.label }}</h2>
        <po-button p-label="Novo" p-kind="primary" p-icon="po-icon-plus" (p-click)="newRecord()"></po-button>
      </div>
      <dyf-grid [table]="table" [items]="items"
        (view)="onViewDetail($event)" (edit)="onEdit($event)" (delete)="onDelete($event)">
      </dyf-grid>
    }

    @if (view === 'form') {
      <div class="po-mb-3">
        <po-button p-label="Voltar" p-kind="tertiary" p-icon="po-icon-arrow-left" (p-click)="back()"></po-button>
        <h2 class="po-title po-mt-2">{{ selectedItem?.id ? 'Editar' : 'Novo' }} registro</h2>
      </div>
      <dyf-form [table]="table" [value]="selectedItem" (save)="onSave($event)" (cancel)="back()"></dyf-form>
    }

    @if (view === 'detail') {
      <div class="po-mb-3">
        <po-button p-label="Voltar" p-kind="tertiary" p-icon="po-icon-arrow-left" (p-click)="back()"></po-button>
        <h2 class="po-title po-mt-2">Detalhes</h2>
      </div>
      <dyf-detail [table]="table" [value]="selectedItem"></dyf-detail>
    }

  </div>
</div>
```

- [ ] **Step 3: Refatorar AppComponent para shell**

```typescript
// projects/dynaform-demo/src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PoButtonModule, PoToolbarModule } from '@po-ui/ng-components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, PoToolbarModule, PoButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {}
```

- [ ] **Step 4: Atualizar template do AppComponent**

```html
<!-- projects/dynaform-demo/src/app/app.component.html -->
<po-toolbar p-title="DynaForm Demo">
  <ng-template poToolbarContent>
    <po-button
      p-label="Demo"
      p-kind="tertiary"
      p-icon="po-icon-home"
      p-router-link="/">
    </po-button>
    <po-button
      p-label="Builder"
      p-kind="tertiary"
      p-icon="po-icon-edit"
      p-router-link="/builder">
    </po-button>
  </ng-template>
</po-toolbar>

<router-outlet></router-outlet>
```

- [ ] **Step 5: Configurar rotas**

```typescript
// projects/dynaform-demo/src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./demo/demo.component').then(m => m.DemoComponent),
  },
  {
    path: 'builder',
    loadComponent: () =>
      import('./dictionary-builder/dictionary-builder.component').then(
        m => m.DictionaryBuilderComponent
      ),
  },
];
```

- [ ] **Step 6: Commit**

```bash
git add projects/dynaform-demo/src/app/app.component.ts \
        projects/dynaform-demo/src/app/app.component.html \
        projects/dynaform-demo/src/app/app.routes.ts \
        projects/dynaform-demo/src/app/demo/
git commit -m "feat: refactor AppComponent to shell with router-outlet; add DemoComponent"
```

> **Nota:** O build completo só funcionará após o Task 5 (DictionaryBuilderComponent), pois a rota `/builder` referencia esse componente via lazy import. Não execute `ng build` antes disso.

---

## Chunk 2: FieldEditorModalComponent

### Task 3: FieldEditorModalComponent

**Files:**
- Create: `projects/dynaform-demo/src/app/dictionary-builder/field-editor-modal/field-editor-modal.component.ts`
- Create: `projects/dynaform-demo/src/app/dictionary-builder/field-editor-modal/field-editor-modal.component.html`

- [ ] **Step 1: Criar o componente**

```typescript
// projects/dynaform-demo/src/app/dictionary-builder/field-editor-modal/field-editor-modal.component.ts
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PoButtonModule,
  PoFieldModule,
  PoModalAction,
  PoModalComponent,
  PoModalModule,
} from '@po-ui/ng-components';
import { DyfField, DyfFieldOption, DyfFieldType } from 'dynaform';

@Component({
  selector: 'app-field-editor-modal',
  standalone: true,
  imports: [FormsModule, PoModalModule, PoFieldModule, PoButtonModule],
  templateUrl: './field-editor-modal.component.html',
})
export class FieldEditorModalComponent {
  @Output() fieldSaved = new EventEmitter<DyfField>();
  @ViewChild('modal') modal!: PoModalComponent;

  field: Partial<DyfField> & { options: DyfFieldOption[] } = this.defaultField();
  existingFieldNames: string[] = [];
  folderOptions: { label: string; value: string }[] = [];
  hasKeyField = false;
  validationErrors: string[] = [];

  readonly typeOptions: { label: string; value: DyfFieldType }[] = [
    { label: 'Texto (string)', value: 'string' },
    { label: 'Número (number)', value: 'number' },
    { label: 'Moeda (currency)', value: 'currency' },
    { label: 'Booleano (boolean)', value: 'boolean' },
    { label: 'Data (date)', value: 'date' },
    { label: 'Data e Hora (dateTime)', value: 'dateTime' },
    { label: 'Hora (time)', value: 'time' },
  ];

  readonly primaryAction: PoModalAction = {
    label: 'Salvar',
    action: () => this.save(),
  };

  readonly secondaryAction: PoModalAction = {
    label: 'Cancelar',
    action: () => this.modal.close(),
  };

  get isString(): boolean { return this.field.type === 'string'; }
  get isNumeric(): boolean { return this.field.type === 'number' || this.field.type === 'currency'; }
  get keyToggleDisabled(): boolean { return this.hasKeyField && !this.field.key; }

  open(field?: DyfField, existingFieldNames: string[] = [], folderOptions: { label: string; value: string }[] = [], hasKeyField = false): void {
    this.existingFieldNames = existingFieldNames;
    this.folderOptions = folderOptions;
    this.hasKeyField = hasKeyField;
    this.validationErrors = [];

    if (field) {
      this.field = {
        ...field,
        options: field.options ? field.options.map(o => ({ ...o })) : [],
      };
    } else {
      this.field = this.defaultField();
    }

    this.modal.open();
  }

  addOption(): void {
    this.field.options!.push({ label: '', value: '' });
  }

  removeOption(index: number): void {
    this.field.options!.splice(index, 1);
  }

  private save(): void {
    this.validationErrors = this.validate();
    if (this.validationErrors.length > 0) return;

    const result: DyfField = {
      fieldName: this.field.fieldName!,
      property: this.field.property!,
      label: this.field.label!,
      type: this.field.type!,
    };

    // layout
    if (this.field.order !== undefined) result.order = this.field.order;
    if (this.field.gridColumns !== undefined) result.gridColumns = this.field.gridColumns;
    if (this.field.folderId) result.folderId = this.field.folderId;

    // visibilidade
    if (this.field.visibleOnForm !== undefined) result.visibleOnForm = this.field.visibleOnForm;
    if (this.field.visibleOnGrid !== undefined) result.visibleOnGrid = this.field.visibleOnGrid;
    if (this.field.visibleOnDetail !== undefined) result.visibleOnDetail = this.field.visibleOnDetail;

    // core
    if (this.field.key) result.key = this.field.key;
    if (this.field.required) result.required = this.field.required;
    if (this.field.disabled) result.disabled = this.field.disabled;
    if (this.field.readonly) result.readonly = this.field.readonly;
    if (this.field.clean) result.clean = this.field.clean;
    if (this.field.placeholder) result.placeholder = this.field.placeholder;

    // string-specific
    if (this.isString) {
      if (this.field.mask) result.mask = this.field.mask;
      if (this.field.maxLength) result.maxLength = this.field.maxLength;
      if (this.field.minLength) result.minLength = this.field.minLength;
      if (this.field.rows && this.field.rows > 1) result.rows = this.field.rows;
      if (this.field.secret) result.secret = this.field.secret;
    }

    // numeric-specific
    if (this.isNumeric) {
      if (this.field.decimalsLength !== undefined) result.decimalsLength = this.field.decimalsLength;
      if (this.field.format) result.format = this.field.format;
    }

    // options
    const validOptions = (this.field.options ?? []).filter(o => o.label.trim());
    if (validOptions.length > 0) {
      result.options = validOptions.map(o => ({
        label: o.label,
        value: this.parseOptionValue(String(o.value)),
      }));
    }
    if (this.field.optionsMulti) result.optionsMulti = this.field.optionsMulti;
    if (this.field.optionsService) result.optionsService = this.field.optionsService;
    if (this.field.searchService) result.searchService = this.field.searchService;

    this.fieldSaved.emit(result);
    this.modal.close();
  }

  private validate(): string[] {
    const errors: string[] = [];
    const SNAKE_CASE = /^[a-z][a-z0-9_]*$/;

    if (!this.field.fieldName?.trim()) {
      errors.push('fieldName é obrigatório');
    } else if (!SNAKE_CASE.test(this.field.fieldName)) {
      errors.push('fieldName deve ser snake_case (ex: meu_campo)');
    } else if (this.existingFieldNames.includes(this.field.fieldName)) {
      errors.push(`fieldName "${this.field.fieldName}" já existe na tabela`);
    }

    if (!this.field.property?.trim()) {
      errors.push('property é obrigatória');
    } else if (!SNAKE_CASE.test(this.field.property)) {
      errors.push('property deve ser snake_case');
    }

    if (!this.field.label?.trim()) errors.push('label é obrigatório');
    if (!this.field.type) errors.push('type é obrigatório');

    if (this.field.gridColumns !== undefined && this.field.gridColumns !== null) {
      const gc = Number(this.field.gridColumns);
      if (!Number.isInteger(gc) || gc < 1 || gc > 12) {
        errors.push('gridColumns deve ser um inteiro entre 1 e 12');
      }
    }

    return errors;
  }

  private parseOptionValue(v: string): string | number | boolean {
    if (v === 'true') return true;
    if (v === 'false') return false;
    const n = Number(v);
    if (!isNaN(n) && v.trim() !== '') return n;
    return v;
  }

  private defaultField(): Partial<DyfField> & { options: DyfFieldOption[] } {
    return {
      visibleOnForm: true,
      visibleOnGrid: true,
      visibleOnDetail: true,
      options: [],
    };
  }
}
```

- [ ] **Step 2: Criar o template**

```html
<!-- projects/dynaform-demo/src/app/dictionary-builder/field-editor-modal/field-editor-modal.component.html -->
<po-modal
  #modal
  p-title="Campo"
  [p-primary-action]="primaryAction"
  [p-secondary-action]="secondaryAction">

  <!-- Erros de validação -->
  @if (validationErrors.length > 0) {
    <div class="po-mb-3" style="color: #c64840; background: #fde8e7; border-radius: 4px; padding: 8px 12px;">
      <strong>Erros de validação:</strong>
      <ul style="margin: 4px 0 0 16px; padding: 0;">
        @for (err of validationErrors; track err) {
          <li>{{ err }}</li>
        }
      </ul>
    </div>
  }

  <div class="po-row">

    <!-- IDENTIDADE -->
    <po-divider p-label="Identidade" class="po-xl-12 po-lg-12"></po-divider>

    <po-input
      class="po-xl-6 po-lg-6 po-md-6 po-sm-12"
      name="fieldName"
      p-label="fieldName *"
      p-placeholder="ex: customer_name"
      [(ngModel)]="field.fieldName">
    </po-input>

    <po-input
      class="po-xl-6 po-lg-6 po-md-6 po-sm-12"
      name="property"
      p-label="property *"
      p-placeholder="ex: customer_name"
      [(ngModel)]="field.property">
    </po-input>

    <po-input
      class="po-xl-8 po-lg-8 po-md-8 po-sm-12"
      name="label"
      p-label="Label *"
      p-placeholder="ex: Nome do Cliente"
      [(ngModel)]="field.label">
    </po-input>

    <po-select
      class="po-xl-4 po-lg-4 po-md-4 po-sm-12"
      name="type"
      p-label="Tipo *"
      [p-options]="typeOptions"
      [(ngModel)]="field.type">
    </po-select>

    <po-switch
      class="po-xl-4 po-lg-4 po-md-4 po-sm-12"
      name="key"
      p-label="Chave primária"
      [p-disabled]="keyToggleDisabled"
      [(ngModel)]="field.key">
    </po-switch>

    <!-- LAYOUT -->
    <po-divider p-label="Layout" class="po-xl-12 po-lg-12"></po-divider>

    <po-number
      class="po-xl-3 po-lg-3 po-md-3 po-sm-6"
      name="order"
      p-label="Ordem"
      [(ngModel)]="field.order">
    </po-number>

    <po-number
      class="po-xl-3 po-lg-3 po-md-3 po-sm-6"
      name="gridColumns"
      p-label="Grid Columns (1–12)"
      p-min="1"
      p-max="12"
      [(ngModel)]="field.gridColumns">
    </po-number>

    @if (folderOptions.length > 0) {
      <po-select
        class="po-xl-6 po-lg-6 po-md-6 po-sm-12"
        name="folderId"
        p-label="Folder"
        [p-options]="folderOptions"
        [(ngModel)]="field.folderId">
      </po-select>
    }

    <!-- VISIBILIDADE -->
    <po-divider p-label="Visibilidade" class="po-xl-12 po-lg-12"></po-divider>

    <po-switch
      class="po-xl-4 po-lg-4 po-md-4 po-sm-12"
      name="visibleOnForm"
      p-label="Visível no Form"
      [(ngModel)]="field.visibleOnForm">
    </po-switch>

    <po-switch
      class="po-xl-4 po-lg-4 po-md-4 po-sm-12"
      name="visibleOnGrid"
      p-label="Visível no Grid"
      [(ngModel)]="field.visibleOnGrid">
    </po-switch>

    <po-switch
      class="po-xl-4 po-lg-4 po-md-4 po-sm-12"
      name="visibleOnDetail"
      p-label="Visível no Detail"
      [(ngModel)]="field.visibleOnDetail">
    </po-switch>

    <!-- COMPORTAMENTO -->
    <po-divider p-label="Comportamento" class="po-xl-12 po-lg-12"></po-divider>

    <po-switch class="po-xl-3 po-lg-3 po-md-3 po-sm-6" name="required" p-label="Obrigatório" [(ngModel)]="field.required"></po-switch>
    <po-switch class="po-xl-3 po-lg-3 po-md-3 po-sm-6" name="disabled" p-label="Desabilitado" [(ngModel)]="field.disabled"></po-switch>
    <po-switch class="po-xl-3 po-lg-3 po-md-3 po-sm-6" name="readonly" p-label="Somente Leitura" [(ngModel)]="field.readonly"></po-switch>
    <po-switch class="po-xl-3 po-lg-3 po-md-3 po-sm-6" name="clean" p-label="Com Limpar" [(ngModel)]="field.clean"></po-switch>

    <po-input
      class="po-xl-12 po-lg-12"
      name="placeholder"
      p-label="Placeholder"
      [(ngModel)]="field.placeholder">
    </po-input>

    <!-- ESPECÍFICO POR TIPO: STRING -->
    @if (isString) {
      <po-divider p-label="String" class="po-xl-12 po-lg-12"></po-divider>

      <po-input class="po-xl-4 po-lg-4 po-md-4 po-sm-12" name="mask" p-label="Máscara" p-placeholder="(99) 99999-9999" [(ngModel)]="field.mask"></po-input>
      <po-number class="po-xl-4 po-lg-4 po-md-4 po-sm-12" name="maxLength" p-label="Máx. Caracteres" [(ngModel)]="field.maxLength"></po-number>
      <po-number class="po-xl-4 po-lg-4 po-md-4 po-sm-12" name="minLength" p-label="Mín. Caracteres" [(ngModel)]="field.minLength"></po-number>
      <po-number class="po-xl-4 po-lg-4 po-md-4 po-sm-12" name="rows" p-label="Linhas (>1 = textarea)" [(ngModel)]="field.rows"></po-number>
      <po-switch class="po-xl-4 po-lg-4 po-md-4 po-sm-12" name="secret" p-label="Campo Senha" [(ngModel)]="field.secret"></po-switch>
    }

    <!-- ESPECÍFICO POR TIPO: NUMÉRICO -->
    @if (isNumeric) {
      <po-divider p-label="Numérico" class="po-xl-12 po-lg-12"></po-divider>

      <po-number class="po-xl-6 po-lg-6 po-md-6 po-sm-12" name="decimalsLength" p-label="Casas Decimais" [(ngModel)]="field.decimalsLength"></po-number>
      <po-input class="po-xl-6 po-lg-6 po-md-6 po-sm-12" name="format" p-label="Formato" [(ngModel)]="field.format"></po-input>
    }

    <!-- OPÇÕES -->
    <po-divider p-label="Opções (select/radio)" class="po-xl-12 po-lg-12"></po-divider>

    @for (opt of field.options; track $index) {
      <po-input class="po-xl-5 po-lg-5 po-md-5 po-sm-5" [name]="'opt_label_' + $index" p-label="Label" [(ngModel)]="opt.label"></po-input>
      <po-input class="po-xl-5 po-lg-5 po-md-5 po-sm-5" [name]="'opt_value_' + $index" p-label="Value" [(ngModel)]="opt.value"></po-input>
      <div class="po-xl-2 po-lg-2 po-md-2 po-sm-2 po-d-flex po-align-items-end po-pb-1">
        <po-button p-icon="po-icon-delete" p-kind="danger" (p-click)="removeOption($index)"></po-button>
      </div>
    }

    <div class="po-xl-12 po-lg-12">
      <po-button p-label="Adicionar Opção" p-icon="po-icon-plus" p-kind="secondary" (p-click)="addOption()"></po-button>
    </div>

    <po-switch class="po-xl-4 po-lg-4 po-md-4 po-sm-12" name="optionsMulti" p-label="Multi-seleção" [(ngModel)]="field.optionsMulti"></po-switch>

    <!-- AVANÇADO -->
    <po-divider p-label="Avançado" class="po-xl-12 po-lg-12"></po-divider>

    <po-input class="po-xl-6 po-lg-6 po-md-6 po-sm-12" name="optionsService" p-label="Options Service URL" [(ngModel)]="field.optionsService"></po-input>
    <po-input class="po-xl-6 po-lg-6 po-md-6 po-sm-12" name="searchService" p-label="Search Service URL" [(ngModel)]="field.searchService"></po-input>

  </div>
</po-modal>
```

- [ ] **Step 3: Verificar compilação**

```bash
cd /opt/dyna-form
npx ng build dynaform-demo --configuration development 2>&1 | tail -20
```

Esperado: sem erros.

- [ ] **Step 4: Commit**

```bash
git add projects/dynaform-demo/src/app/dictionary-builder/field-editor-modal/
git commit -m "feat: add FieldEditorModalComponent with validation and conditional fields"
```

---

## Chunk 3: PreviewPanel + DictionaryBuilderComponent

### Task 4: PreviewPanelComponent

**Files:**
- Create: `projects/dynaform-demo/src/app/dictionary-builder/preview-panel/preview-panel.component.ts`
- Create: `projects/dynaform-demo/src/app/dictionary-builder/preview-panel/preview-panel.component.html`

- [ ] **Step 1: Criar o componente**

```typescript
// projects/dynaform-demo/src/app/dictionary-builder/preview-panel/preview-panel.component.ts
import { Component, Input } from '@angular/core';
import { PoTabsModule } from '@po-ui/ng-components';
import { DyfDetailComponent, DyfField, DyfFormComponent, DyfGridComponent, DyfTable } from 'dynaform';

@Component({
  selector: 'app-preview-panel',
  standalone: true,
  imports: [PoTabsModule, DyfFormComponent, DyfGridComponent, DyfDetailComponent],
  templateUrl: './preview-panel.component.html',
})
export class PreviewPanelComponent {
  @Input() set table(value: DyfTable) {
    if (!value) return;
    this._table = value;
    this.fakeData = this.generateFakeData(value.fields ?? []);
    this.fakeItems = [this.fakeData];
  }

  get table(): DyfTable { return this._table; }

  private _table!: DyfTable;
  fakeData: Record<string, any> = {};
  fakeItems: any[] = [];

  get hasFields(): boolean {
    return this._table?.fields?.length > 0;
  }

  private generateFakeData(fields: DyfField[]): Record<string, any> {
    const data: Record<string, any> = {};
    for (const field of fields) {
      switch (field.type) {
        case 'string':   data[field.property] = 'Exemplo'; break;
        case 'number':   data[field.property] = 42; break;
        case 'currency': data[field.property] = 99.90; break;
        case 'boolean':  data[field.property] = true; break;
        case 'date':     data[field.property] = '2026-03-11'; break;
        case 'dateTime': data[field.property] = '2026-03-11T10:00:00'; break;
        case 'time':     data[field.property] = '10:00:00'; break;
      }
    }
    return data;
  }
}
```

- [ ] **Step 2: Criar o template**

```html
<!-- projects/dynaform-demo/src/app/dictionary-builder/preview-panel/preview-panel.component.html -->
<div class="po-p-4" style="border: 1px solid #e0e0e0; border-radius: 4px; background: #fafafa;">

  @if (!hasFields) {
    <p class="po-text-center po-text-color-neutral-mid-40">
      Adicione campos para ver o preview.
    </p>
  } @else {
    <po-tabs>
      <po-tab p-label="Formulário">
        <dyf-form
          [table]="table"
          [value]="fakeData">
        </dyf-form>
      </po-tab>

      <po-tab p-label="Grid">
        <dyf-grid
          [table]="table"
          [items]="fakeItems">
        </dyf-grid>
      </po-tab>

      <po-tab p-label="Detalhes">
        <dyf-detail
          [table]="table"
          [value]="fakeData">
        </dyf-detail>
      </po-tab>
    </po-tabs>
  }

</div>
```

- [ ] **Step 3: Commit**

```bash
git add projects/dynaform-demo/src/app/dictionary-builder/preview-panel/
git commit -m "feat: add PreviewPanelComponent with live form/grid/detail preview"
```

---

### Task 5: DictionaryBuilderComponent

**Files:**
- Create: `projects/dynaform-demo/src/app/dictionary-builder/dictionary-builder.component.ts`
- Create: `projects/dynaform-demo/src/app/dictionary-builder/dictionary-builder.component.html`
- Create: `projects/dynaform-demo/src/app/dictionary-builder/dictionary-builder.component.scss`

- [ ] **Step 1: Criar o componente**

```typescript
// projects/dynaform-demo/src/app/dictionary-builder/dictionary-builder.component.ts
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PoButtonModule,
  PoDividerModule,
  PoFieldModule,
  PoModalAction,
  PoModalComponent,
  PoModalModule,
  PoNotificationService,
  PoTableAction,
  PoTableColumn,
  PoTableModule,
} from '@po-ui/ng-components';
import { DyfField, DyfFolder, DyfTable } from 'dynaform';
import { DictionaryBuilderService } from './dictionary-builder.service';
import { FieldEditorModalComponent } from './field-editor-modal/field-editor-modal.component';
import { PreviewPanelComponent } from './preview-panel/preview-panel.component';

@Component({
  selector: 'app-dictionary-builder',
  standalone: true,
  imports: [
    FormsModule,
    PoButtonModule,
    PoDividerModule,
    PoFieldModule,
    PoModalModule,
    PoTableModule,
    FieldEditorModalComponent,
    PreviewPanelComponent,
  ],
  templateUrl: './dictionary-builder.component.html',
  styleUrl: './dictionary-builder.component.scss',
})
export class DictionaryBuilderComponent {
  @ViewChild('fieldModal') fieldModal!: FieldEditorModalComponent;
  @ViewChild('folderModal') folderModal!: PoModalComponent;

  // --- State ---
  tableForm = { tableName: '', revision: 1, label: '', description: '', endpoint: '' };
  fields: DyfField[] = [];
  folders: DyfFolder[] = [];
  showPreview = false;
  showFolders = false;

  // --- Folder modal state ---
  editingFolder: Partial<DyfFolder> = {};
  editingFolderOriginalId: string | null = null;

  readonly folderPrimaryAction: PoModalAction = {
    label: 'Salvar',
    action: () => this.saveFolder(),
  };
  readonly folderSecondaryAction: PoModalAction = {
    label: 'Cancelar',
    action: () => this.folderModal.close(),
  };

  // --- Table columns ---
  readonly fieldColumns: PoTableColumn[] = [
    { property: 'order', label: 'Ordem', width: '80px' },
    { property: 'fieldName', label: 'Campo' },
    { property: 'label', label: 'Label' },
    { property: 'type', label: 'Tipo', width: '100px' },
    { property: 'key', label: 'Chave', type: 'boolean', width: '80px' },
  ];

  readonly fieldActions: PoTableAction[] = [
    { label: 'Editar', icon: 'po-icon-edit', action: (row: DyfField) => this.openEditField(row) },
    { label: 'Excluir', icon: 'po-icon-delete', action: (row: DyfField) => this.deleteField(row) },
  ];

  readonly folderColumns: PoTableColumn[] = [
    { property: 'folderId', label: 'ID' },
    { property: 'label', label: 'Label' },
    { property: 'order', label: 'Ordem', width: '80px' },
  ];

  readonly folderTableActions: PoTableAction[] = [
    { label: 'Editar', icon: 'po-icon-edit', action: (row: DyfFolder) => this.openEditFolder(row) },
    { label: 'Excluir', icon: 'po-icon-delete', action: (row: DyfFolder) => this.deleteFolder(row) },
  ];

  constructor(
    private builderService: DictionaryBuilderService,
    private notification: PoNotificationService,
  ) {}

  // --- Computed ---
  get currentTable(): DyfTable {
    return {
      tableName: this.tableForm.tableName,
      revision: this.tableForm.revision,
      label: this.tableForm.label,
      description: this.tableForm.description || undefined,
      endpoint: this.tableForm.endpoint || undefined,
      fields: [...this.fields],
      folders: this.folders.length > 0 ? [...this.folders] : undefined,
    };
  }

  get hasKeyField(): boolean {
    return this.fields.some(f => f.key);
  }

  get canSave(): boolean {
    const SNAKE = /^[a-z][a-z0-9_]*$/;
    return (
      !!this.tableForm.tableName &&
      SNAKE.test(this.tableForm.tableName) &&
      this.tableForm.revision >= 1 &&
      !!this.tableForm.label &&
      this.fields.length > 0
    );
  }

  get folderSelectOptions(): { label: string; value: string }[] {
    return this.folders.map(f => ({ label: f.label, value: f.folderId }));
  }

  // --- Fields ---
  openAddField(): void {
    const existing = this.fields.map(f => f.fieldName);
    this.fieldModal.open(undefined, existing, this.folderSelectOptions, this.hasKeyField);
  }

  openEditField(field: DyfField): void {
    const existing = this.fields.filter(f => f.fieldName !== field.fieldName).map(f => f.fieldName);
    this.fieldModal.open({ ...field }, existing, this.folderSelectOptions, this.hasKeyField && !field.key);
  }

  onFieldSaved(field: DyfField): void {
    const idx = this.fields.findIndex(f => f.fieldName === field.fieldName);
    if (idx >= 0) {
      this.fields = this.fields.map((f, i) => (i === idx ? field : f));
    } else {
      this.fields = [...this.fields, field];
    }
    // Only one key field allowed
    if (field.key) {
      this.fields = this.fields.map(f => f.fieldName === field.fieldName ? f : { ...f, key: undefined });
    }
  }

  deleteField(field: DyfField): void {
    this.fields = this.fields.filter(f => f.fieldName !== field.fieldName);
  }

  // --- Folders ---
  openAddFolder(): void {
    this.editingFolder = {};
    this.editingFolderOriginalId = null;
    this.folderModal.open();
  }

  openEditFolder(folder: DyfFolder): void {
    this.editingFolder = { ...folder };
    this.editingFolderOriginalId = folder.folderId;
    this.folderModal.open();
  }

  saveFolder(): void {
    if (!this.editingFolder.folderId?.trim() || !this.editingFolder.label?.trim()) {
      this.notification.warning({ message: 'ID e Label do folder são obrigatórios.' });
      return;
    }

    if (this.editingFolderOriginalId) {
      this.folders = this.folders.map(f =>
        f.folderId === this.editingFolderOriginalId
          ? { folderId: this.editingFolder.folderId!, label: this.editingFolder.label!, order: this.editingFolder.order }
          : f
      );
    } else {
      const exists = this.folders.some(f => f.folderId === this.editingFolder.folderId);
      if (exists) {
        this.notification.warning({ message: `folderId "${this.editingFolder.folderId}" já existe.` });
        return;
      }
      this.folders = [...this.folders, {
        folderId: this.editingFolder.folderId!,
        label: this.editingFolder.label!,
        order: this.editingFolder.order,
      }];
    }

    this.folderModal.close();
  }

  deleteFolder(folder: DyfFolder): void {
    this.folders = this.folders.filter(f => f.folderId !== folder.folderId);
    // Remove folderId reference from fields
    this.fields = this.fields.map(f =>
      f.folderId === folder.folderId ? { ...f, folderId: undefined } : f
    );
  }

  // --- Actions ---
  save(): void {
    if (!this.canSave) return;

    if (!this.hasKeyField) {
      this.notification.error({ message: 'É necessário pelo menos um campo com chave primária (key).' });
      return;
    }

    this.builderService.save(this.currentTable);
    this.notification.success({ message: `Dicionário "${this.tableForm.tableName}" salvo com sucesso!` });
  }

  async copyJson(): Promise<void> {
    if (this.fields.length === 0) {
      this.notification.warning({ message: 'Adicione campos antes de exportar o JSON.' });
      return;
    }
    try {
      await this.builderService.copyToClipboard(this.currentTable);
      this.notification.success({ message: 'JSON copiado para o clipboard!' });
    } catch {
      this.notification.error({ message: 'Não foi possível copiar. Use HTTPS ou permita acesso ao clipboard.' });
    }
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  toggleFolders(): void {
    this.showFolders = !this.showFolders;
  }
}
```

- [ ] **Step 2: Criar o template**

```html
<!-- projects/dynaform-demo/src/app/dictionary-builder/dictionary-builder.component.html -->
<div class="po-wrapper">
  <div class="po-p-4">

    <!-- Header -->
    <div class="po-mb-4 po-d-flex po-row po-justify-content-between po-align-items-center">
      <h2 class="po-title">Builder de Dicionário</h2>
      <div class="po-d-flex po-row" style="gap: 8px;">
        <po-button
          p-label="Preview"
          p-kind="secondary"
          p-icon="po-icon-eye"
          (p-click)="togglePreview()">
        </po-button>
        <po-button
          p-label="Copiar JSON"
          p-kind="secondary"
          p-icon="po-icon-copy"
          (p-click)="copyJson()">
        </po-button>
        <po-button
          p-label="Salvar"
          p-kind="primary"
          p-icon="po-icon-save"
          [p-disabled]="!canSave"
          (p-click)="save()">
        </po-button>
      </div>
    </div>

    <!-- BLOCO 1: Dados da Tabela -->
    <po-divider p-label="Dados da Tabela"></po-divider>
    <div class="po-row">
      <po-input
        class="po-xl-4 po-lg-4 po-md-4 po-sm-12"
        name="tableName"
        p-label="tableName *"
        p-placeholder="ex: customers"
        [(ngModel)]="tableForm.tableName">
      </po-input>

      <po-number
        class="po-xl-2 po-lg-2 po-md-2 po-sm-6"
        name="revision"
        p-label="Revision *"
        p-min="1"
        [(ngModel)]="tableForm.revision">
      </po-number>

      <po-input
        class="po-xl-6 po-lg-6 po-md-6 po-sm-12"
        name="label"
        p-label="Label *"
        p-placeholder="ex: Clientes"
        [(ngModel)]="tableForm.label">
      </po-input>

      <po-input
        class="po-xl-6 po-lg-6 po-md-6 po-sm-12"
        name="description"
        p-label="Descrição"
        [(ngModel)]="tableForm.description">
      </po-input>

      <po-input
        class="po-xl-6 po-lg-6 po-md-6 po-sm-12"
        name="endpoint"
        p-label="Endpoint"
        p-placeholder="/api/customers"
        [(ngModel)]="tableForm.endpoint">
      </po-input>
    </div>

    <!-- BLOCO 2: Campos -->
    <po-divider p-label="Campos"></po-divider>
    <div class="po-mt-2 po-mb-2 po-d-flex po-row po-justify-content-end">
      <po-button
        p-label="Adicionar Campo"
        p-kind="primary"
        p-icon="po-icon-plus"
        (p-click)="openAddField()">
      </po-button>
    </div>

    <po-table
      [p-columns]="fieldColumns"
      [p-items]="fields"
      [p-actions]="fieldActions"
      p-striped="true">
    </po-table>

    <!-- BLOCO 3: Folders -->
    <div class="po-mt-4">
      <div class="po-d-flex po-row po-justify-content-between po-align-items-center po-mb-2">
        <po-button
          [p-label]="showFolders ? 'Ocultar Folders' : 'Mostrar Folders'"
          p-kind="tertiary"
          [p-icon]="showFolders ? 'po-icon-arrow-up' : 'po-icon-arrow-down'"
          (p-click)="toggleFolders()">
        </po-button>
        @if (showFolders) {
          <po-button
            p-label="Adicionar Folder"
            p-kind="secondary"
            p-icon="po-icon-plus"
            (p-click)="openAddFolder()">
          </po-button>
        }
      </div>

      @if (showFolders) {
        <po-table
          [p-columns]="folderColumns"
          [p-items]="folders"
          [p-actions]="folderTableActions"
          p-striped="true">
        </po-table>
      }
    </div>

    <!-- PREVIEW -->
    @if (showPreview) {
      <div class="po-mt-4">
        <po-divider p-label="Preview ao Vivo"></po-divider>
        <app-preview-panel [table]="currentTable"></app-preview-panel>
      </div>
    }

  </div>
</div>

<!-- Modal: FieldEditor -->
<app-field-editor-modal #fieldModal (fieldSaved)="onFieldSaved($event)"></app-field-editor-modal>

<!-- Modal: Folder Editor -->
<po-modal
  #folderModal
  p-title="Folder"
  [p-primary-action]="folderPrimaryAction"
  [p-secondary-action]="folderSecondaryAction">
  <div class="po-row">
    <po-input
      class="po-xl-6 po-lg-6 po-sm-12"
      name="folderId"
      p-label="folderId *"
      p-placeholder="ex: dados_pessoais"
      [(ngModel)]="editingFolder.folderId">
    </po-input>
    <po-input
      class="po-xl-4 po-lg-4 po-sm-12"
      name="folderLabel"
      p-label="Label *"
      p-placeholder="ex: Dados Pessoais"
      [(ngModel)]="editingFolder.label">
    </po-input>
    <po-number
      class="po-xl-2 po-lg-2 po-sm-12"
      name="folderOrder"
      p-label="Ordem"
      [(ngModel)]="editingFolder.order">
    </po-number>
  </div>
</po-modal>
```

- [ ] **Step 3: Criar o SCSS**

```scss
// projects/dynaform-demo/src/app/dictionary-builder/dictionary-builder.component.scss
po-divider {
  width: 100%;
}
```

- [ ] **Step 4: Verificar compilação**

```bash
cd /opt/dyna-form
npx ng build dynaform-demo --configuration development 2>&1 | tail -20
```

Esperado: sem erros.

- [ ] **Step 5: Commit**

```bash
git add projects/dynaform-demo/src/app/dictionary-builder/
git commit -m "feat: add DictionaryBuilderComponent with fields/folders management and localStorage persistence"
```

---

## Chunk 4: Verificação Final

### Task 6: Smoke test manual + ajustes finais

- [ ] **Step 1: Build completo**

```bash
cd /opt/dyna-form
npx ng build dynaform --configuration production 2>&1 | tail -10
npx ng build dynaform-demo --configuration development 2>&1 | tail -20
```

Esperado: ambos sem erros.

- [ ] **Step 2: Serve da demo**

```bash
cd /opt/dyna-form
npx ng serve dynaform-demo --port 4200
```

Navegar para `http://localhost:4200/builder` e verificar:
- [ ] Formulário de dados da tabela renderiza
- [ ] "Adicionar Campo" abre modal com todos os campos
- [ ] Validação funciona (fieldName vazio → erro, duplicado → erro, snake_case errado → erro)
- [ ] Campos condicionais aparecem/somem conforme tipo selecionado
- [ ] Salvar campo adiciona à lista
- [ ] Preview ao vivo funciona com 3 abas
- [ ] Botão Salvar persiste no localStorage
- [ ] Botão Copiar JSON copia JSON para clipboard
- [ ] Folders funcionam (adicionar, editar, excluir, toggle de visibilidade)
- [ ] Navegação Toolbar: Demo ↔ Builder funciona

- [ ] **Step 3: Atualizar roadmap**

No arquivo `IDEA.MD`, marcar item 6 como `[x]`:
```
6. [x] Criar interface de cadastro do dicionário
```

- [ ] **Step 4: Commit final**

```bash
git add IDEA.MD
git commit -m "docs: mark roadmap item 6 as complete"
```
