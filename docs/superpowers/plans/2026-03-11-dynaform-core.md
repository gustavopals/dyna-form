# DynaForm Core — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Atualizar o modelo de dados DYF_* e os três componentes (dyf-form, dyf-grid, dyf-detail) para seguir o design aprovado em `docs/superpowers/specs/2026-03-11-dynaform-core-design.md`.

**Architecture:** `DyfFormBuilderService` centraliza todo o mapeamento `DyfField[] → PO-UI`. Os três componentes standalone (`dyf-form`, `dyf-grid`, `dyf-detail`) consomem o service e delegam a renderização ao PO-UI (`PoDynamicFormComponent`, `PoTableComponent`, `PoDynamicViewComponent`). O estado de navegação e os dados ficam no app consumidor.

**Tech Stack:** Angular 19 (standalone), PO-UI 19, Karma + Jasmine, ng-packagr

---

## Mapa de arquivos

| Ação | Arquivo | Responsabilidade |
|------|---------|-----------------|
| Modify | `projects/dynaform/src/lib/models/dyf-field.interface.ts` | `DyfFieldType` + `DyfField` atualizados |
| Modify | `projects/dynaform/src/lib/models/dyf-table.interface.ts` | `DyfTable` com `tableName` + `revision` |
| Modify | `projects/dynaform/src/lib/models/dyf-folder.interface.ts` | `DyfFolder` com `folderId`, sem `fields[]` |
| Modify | `projects/dynaform/src/lib/services/dyf-form-builder.service.ts` | Novos métodos de build + merge poConfig |
| Create | `projects/dynaform/src/lib/services/dyf-form-builder.service.spec.ts` | Testes unitários do service |
| Modify | `projects/dynaform/src/lib/components/dyf-form/dyf-form.component.ts` | Usa `buildFormFields` |
| Create | `projects/dynaform/src/lib/components/dyf-form/dyf-form.component.spec.ts` | Testes do dyf-form |
| Modify | `projects/dynaform/src/lib/components/dyf-grid/dyf-grid.component.ts` | Usa `buildGridColumns` |
| Create | `projects/dynaform/src/lib/components/dyf-grid/dyf-grid.component.spec.ts` | Testes do dyf-grid |
| Modify | `projects/dynaform/src/lib/components/dyf-detail/dyf-detail.component.ts` | Usa `buildDetailFields` |
| Create | `projects/dynaform/src/lib/components/dyf-detail/dyf-detail.component.spec.ts` | Testes do dyf-detail |
| Modify | `projects/dynaform-demo/src/app/app.component.ts` | `SAMPLE_TABLE` atualizado para nova estrutura |

---

## Chunk 1: Atualizar modelo de dados (Item 1 do roadmap)

### Task 1: Atualizar interfaces DYF_*

**Files:**
- Modify: `projects/dynaform/src/lib/models/dyf-field.interface.ts`
- Modify: `projects/dynaform/src/lib/models/dyf-table.interface.ts`
- Modify: `projects/dynaform/src/lib/models/dyf-folder.interface.ts`

> Interfaces são verificadas pelo compilador TypeScript — o "teste" aqui é `ng build dynaform` sem erros.

- [ ] **Step 1: Atualizar `dyf-field.interface.ts`**

Substituir conteúdo completo do arquivo:

```typescript
import { PoDynamicFormField } from '@po-ui/ng-components';

export type DyfFieldType =
  | 'string'    // po-input | po-textarea (rows>1) | po-password (secret) | po-combo (optionsService)
  | 'number'    // po-number | po-decimal
  | 'currency'  // po-decimal (mode currency)
  | 'boolean'   // po-switch | po-checkbox (forceBooleanComponentType)
  | 'date'      // po-datepicker
  | 'dateTime'  // po-datepicker com hora
  | 'time';     // po-input time

export interface DyfFieldOption {
  label: string;
  value: any;
}

export interface DyfField {
  // identidade
  fieldName: string;
  property: string;
  label: string;
  type: DyfFieldType;

  // layout
  order?: number;
  gridColumns?: number;
  folderId?: string;

  // visibilidade por contexto (default: true)
  visibleOnGrid?: boolean;
  visibleOnForm?: boolean;
  visibleOnDetail?: boolean;
  key?: boolean;

  // core
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  placeholder?: string;
  clean?: boolean;

  // string
  mask?: string;
  maxLength?: number;
  minLength?: number;
  rows?: number;
  secret?: boolean;

  // select / combo / multiselect / radiogroup / checkbox
  options?: DyfFieldOption[];
  optionsMulti?: boolean;
  optionsService?: string;

  // lookup
  searchService?: string;

  // date / number / currency
  format?: string;
  decimalsLength?: number;

  // escape hatch — mergeado ao PoDynamicFormField ao renderizar
  poConfig?: Partial<PoDynamicFormField>;
}
```

- [ ] **Step 2: Atualizar `dyf-table.interface.ts`**

```typescript
import { DyfField } from './dyf-field.interface';
import { DyfFolder } from './dyf-folder.interface';

export interface DyfTable {
  tableName: string;
  revision: number;
  label: string;
  description?: string;
  endpoint?: string;
  fields: DyfField[];
  folders?: DyfFolder[];
}
```

- [ ] **Step 3: Atualizar `dyf-folder.interface.ts`**

```typescript
export interface DyfFolder {
  folderId: string;
  label: string;
  order?: number;
}
```

- [ ] **Step 4: Verificar compilação**

```bash
cd /opt/dyna-form && ng build dynaform 2>&1 | head -30
```

Esperado: erros de TypeScript em `dyf-form-builder.service.ts` e nos componentes (propriedades renomeadas) — **isso é esperado**, não significa problema nas interfaces.

- [ ] **Step 5: Commit**

```bash
git add projects/dynaform/src/lib/models/
git commit -m "feat(models): redesign DYF_* interfaces with tableName, revision and poConfig"
```

---

## Chunk 2: DyfFormBuilderService com TDD (Item 2 do roadmap)

### Task 2: Escrever os testes do service

**Files:**
- Create: `projects/dynaform/src/lib/services/dyf-form-builder.service.spec.ts`

- [ ] **Step 1: Criar o arquivo de teste**

```typescript
import { TestBed } from '@angular/core/testing';
import { DyfFormBuilderService } from './dyf-form-builder.service';
import { DyfTable } from '../models/dyf-table.interface';

const BASE_TABLE: DyfTable = {
  tableName: 'test',
  revision: 1,
  label: 'Test',
  fields: [],
};

describe('DyfFormBuilderService', () => {
  let service: DyfFormBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DyfFormBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // --- buildFormFields ---

  describe('buildFormFields', () => {
    it('should include fields where visibleOnForm is not false', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [
          { fieldName: 'f1', property: 'a', label: 'A', type: 'string', order: 1 },
          { fieldName: 'f2', property: 'b', label: 'B', type: 'string', order: 2, visibleOnForm: true },
        ],
      };
      const result = service.buildFormFields(table);
      expect(result.length).toBe(2);
    });

    it('should exclude fields with visibleOnForm = false', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [
          { fieldName: 'f1', property: 'a', label: 'A', type: 'string', order: 1 },
          { fieldName: 'f2', property: 'b', label: 'B', type: 'string', order: 2, visibleOnForm: false },
        ],
      };
      const result = service.buildFormFields(table);
      expect(result.length).toBe(1);
      expect(result[0].property).toBe('a');
    });

    it('should sort fields by order ascending', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [
          { fieldName: 'f2', property: 'b', label: 'B', type: 'string', order: 2 },
          { fieldName: 'f1', property: 'a', label: 'A', type: 'string', order: 1 },
        ],
      };
      const result = service.buildFormFields(table);
      expect(result[0].property).toBe('a');
      expect(result[1].property).toBe('b');
    });

    it('should inject divider label on the first field of each folder', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [
          { fieldName: 'f1', property: 'a', label: 'A', type: 'string', order: 1, folderId: 'sec1' },
          { fieldName: 'f2', property: 'b', label: 'B', type: 'string', order: 2, folderId: 'sec1' },
          { fieldName: 'f3', property: 'c', label: 'C', type: 'string', order: 3, folderId: 'sec2' },
        ],
        folders: [
          { folderId: 'sec1', label: 'Seção 1', order: 1 },
          { folderId: 'sec2', label: 'Seção 2', order: 2 },
        ],
      };
      const result = service.buildFormFields(table);
      expect(result[0].divider).toBe('Seção 1');
      expect(result[1].divider).toBeUndefined();
      expect(result[2].divider).toBe('Seção 2');
    });

    it('should not inject divider when field has no folderId', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [
          { fieldName: 'f1', property: 'a', label: 'A', type: 'string', order: 1 },
        ],
      };
      const result = service.buildFormFields(table);
      expect(result[0].divider).toBeUndefined();
    });

    it('should merge poConfig over base properties', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [
          {
            fieldName: 'f1', property: 'a', label: 'Original', type: 'string', order: 1,
            poConfig: { label: 'Overridden', rows: 5 },
          },
        ],
      };
      const result = service.buildFormFields(table);
      expect(result[0].label).toBe('Overridden');
      expect(result[0].rows).toBe(5);
    });

    it('should map core properties to PoDynamicFormField', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [
          {
            fieldName: 'f1', property: 'name', label: 'Nome', type: 'string', order: 1,
            required: true, placeholder: 'Digite', maxLength: 50, gridColumns: 6,
          },
        ],
      };
      const result = service.buildFormFields(table);
      expect(result[0].required).toBeTrue();
      expect(result[0].placeholder).toBe('Digite');
      expect(result[0].maxLength).toBe(50);
      expect(result[0].gridColumns).toBe(6);
    });
  });

  // --- buildGridColumns ---

  describe('buildGridColumns', () => {
    it('should include fields where visibleOnGrid is not false', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [
          { fieldName: 'f1', property: 'a', label: 'A', type: 'string', order: 1 },
          { fieldName: 'f2', property: 'b', label: 'B', type: 'string', order: 2, visibleOnGrid: false },
        ],
      };
      const result = service.buildGridColumns(table);
      expect(result.length).toBe(1);
      expect(result[0].property).toBe('a');
    });

    it('should map boolean type to "boolean" PoTableColumn type', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [{ fieldName: 'f1', property: 'active', label: 'Ativo', type: 'boolean', order: 1 }],
      };
      expect(service.buildGridColumns(table)[0].type).toBe('boolean');
    });

    it('should map date type to "date" PoTableColumn type', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [{ fieldName: 'f1', property: 'dt', label: 'Data', type: 'date', order: 1 }],
      };
      expect(service.buildGridColumns(table)[0].type).toBe('date');
    });

    it('should map currency type to "currency" PoTableColumn type', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [{ fieldName: 'f1', property: 'val', label: 'Valor', type: 'currency', order: 1 }],
      };
      expect(service.buildGridColumns(table)[0].type).toBe('currency');
    });

    it('should map number type to "number" PoTableColumn type', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [{ fieldName: 'f1', property: 'qty', label: 'Qtd', type: 'number', order: 1 }],
      };
      expect(service.buildGridColumns(table)[0].type).toBe('number');
    });

    it('should map all other types to "string" PoTableColumn type', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [{ fieldName: 'f1', property: 'name', label: 'Nome', type: 'string', order: 1 }],
      };
      expect(service.buildGridColumns(table)[0].type).toBe('string');
    });
  });

  // --- buildDetailFields ---

  describe('buildDetailFields', () => {
    it('should include fields where visibleOnDetail is not false', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [
          { fieldName: 'f1', property: 'a', label: 'A', type: 'string', order: 1 },
          { fieldName: 'f2', property: 'b', label: 'B', type: 'string', order: 2, visibleOnDetail: false },
        ],
      };
      const result = service.buildDetailFields(table);
      expect(result.length).toBe(1);
      expect(result[0].property).toBe('a');
    });

    it('should sort fields by order', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [
          { fieldName: 'f2', property: 'b', label: 'B', type: 'string', order: 2 },
          { fieldName: 'f1', property: 'a', label: 'A', type: 'string', order: 1 },
        ],
      };
      const result = service.buildDetailFields(table);
      expect(result[0].property).toBe('a');
    });
  });

  // --- getKeyField ---

  describe('getKeyField', () => {
    it('should return the field marked with key: true', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [
          { fieldName: 'id', property: 'id', label: 'ID', type: 'number', order: 1, key: true },
          { fieldName: 'name', property: 'name', label: 'Nome', type: 'string', order: 2 },
        ],
      };
      expect(service.getKeyField(table)?.fieldName).toBe('id');
    });

    it('should return undefined when no field has key: true', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [
          { fieldName: 'name', property: 'name', label: 'Nome', type: 'string', order: 1 },
        ],
      };
      expect(service.getKeyField(table)).toBeUndefined();
    });
  });
});
```

- [ ] **Step 2: Rodar os testes para confirmar que falham**

```bash
cd /opt/dyna-form && ng test dynaform --watch=false --include="**/dyf-form-builder.service.spec.ts" 2>&1 | tail -20
```

Esperado: erros de compilação ou falhas — o service ainda usa a API antiga.

### Task 3: Atualizar implementação do DyfFormBuilderService

**Files:**
- Modify: `projects/dynaform/src/lib/services/dyf-form-builder.service.ts`

- [ ] **Step 3: Substituir implementação do service**

```typescript
import { Injectable } from '@angular/core';
import {
  PoDynamicFormField,
  PoDynamicViewField,
  PoTableColumn,
} from '@po-ui/ng-components';
import { DyfField, DyfFieldType } from '../models/dyf-field.interface';
import { DyfTable } from '../models/dyf-table.interface';

@Injectable({ providedIn: 'root' })
export class DyfFormBuilderService {

  /** Campos visíveis no formulário, ordenados, com dividers de folder e poConfig mergeado */
  buildFormFields(table: DyfTable): PoDynamicFormField[] {
    const fields = table.fields
      .filter(f => f.visibleOnForm !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const folderLabels = new Map<string, string>();
    if (table.folders) {
      table.folders
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .forEach(folder => folderLabels.set(folder.folderId, folder.label));
    }

    const processedFolders = new Set<string>();

    return fields.map(f => {
      const base: PoDynamicFormField = {
        property: f.property,
        label: f.label,
        type: f.type as any,
        gridColumns: f.gridColumns,
        required: f.required,
        disabled: f.disabled,
        readonly: f.readonly,
        placeholder: f.placeholder,
        clean: f.clean,
        mask: f.mask,
        maxLength: f.maxLength,
        minLength: f.minLength,
        rows: f.rows,
        secret: f.secret,
        options: f.options as any,
        optionsMulti: f.optionsMulti,
        optionsService: f.optionsService as any,
        searchService: f.searchService as any,
        format: f.format,
        decimalsLength: f.decimalsLength,
      };

      if (f.folderId && !processedFolders.has(f.folderId)) {
        const dividerLabel = folderLabels.get(f.folderId);
        if (dividerLabel) {
          base.divider = dividerLabel;
        }
        processedFolders.add(f.folderId);
      }

      return f.poConfig ? { ...base, ...f.poConfig } : base;
    });
  }

  /** Colunas visíveis no grid, ordenadas */
  buildGridColumns(table: DyfTable): PoTableColumn[] {
    return table.fields
      .filter(f => f.visibleOnGrid !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(f => ({
        property: f.property,
        label: f.label,
        type: this.mapToPoColumnType(f.type) as any,
        width: f.gridColumns ? `${Math.round((f.gridColumns / 12) * 100)}%` : undefined,
      }));
  }

  /** Campos visíveis no detail, ordenados */
  buildDetailFields(table: DyfTable): PoDynamicViewField[] {
    return table.fields
      .filter(f => f.visibleOnDetail !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(f => ({
        property: f.property,
        label: f.label,
        type: f.type as any,
        gridColumns: f.gridColumns,
        format: f.format,
      }));
  }

  /** Campo marcado como chave primária */
  getKeyField(table: DyfTable): DyfField | undefined {
    return table.fields.find(f => f.key === true);
  }

  private mapToPoColumnType(type: DyfFieldType): string {
    const map: Partial<Record<DyfFieldType, string>> = {
      boolean: 'boolean',
      date: 'date',
      dateTime: 'date',
      currency: 'currency',
      number: 'number',
    };
    return map[type] ?? 'string';
  }
}
```

- [ ] **Step 4: Rodar os testes para confirmar que passam**

```bash
cd /opt/dyna-form && ng test dynaform --watch=false --include="**/dyf-form-builder.service.spec.ts" 2>&1 | tail -20
```

Esperado: `X specs, 0 failures`

- [ ] **Step 5: Commit**

```bash
git add projects/dynaform/src/lib/services/
git commit -m "feat(service): implement DyfFormBuilderService with folder dividers and poConfig merge"
```

---

## Chunk 3: Componentes com TDD + atualização do demo (Itens 3–5)

### Task 4: dyf-form

**Files:**
- Modify: `projects/dynaform/src/lib/components/dyf-form/dyf-form.component.ts`
- Create: `projects/dynaform/src/lib/components/dyf-form/dyf-form.component.spec.ts`

- [ ] **Step 1: Criar testes do dyf-form**

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DyfFormComponent } from './dyf-form.component';
import { DyfFormBuilderService } from '../../services/dyf-form-builder.service';
import { DyfTable } from '../../models/dyf-table.interface';

const MOCK_TABLE: DyfTable = {
  tableName: 'test',
  revision: 1,
  label: 'Test',
  fields: [
    { fieldName: 'name', property: 'name', label: 'Nome', type: 'string', order: 1 },
  ],
};

describe('DyfFormComponent', () => {
  let fixture: ComponentFixture<DyfFormComponent>;
  let component: DyfFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DyfFormComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DyfFormComponent);
    component = fixture.componentInstance;
    component.table = MOCK_TABLE;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate poFields using buildFormFields on init', () => {
    const builder = TestBed.inject(DyfFormBuilderService);
    spyOn(builder, 'buildFormFields').and.callThrough();

    fixture.detectChanges();

    expect(builder.buildFormFields).toHaveBeenCalledWith(MOCK_TABLE);
    expect(component.poFields.length).toBe(1);
    expect(component.poFields[0].property).toBe('name');
  });

  it('should copy the input value to formValue on init', () => {
    component.value = { name: 'Maria' };
    fixture.detectChanges();
    expect(component.formValue).toEqual({ name: 'Maria' });
  });

  it('should emit cancel when onCancel is called', () => {
    let emitted = false;
    component.cancel.subscribe(() => (emitted = true));
    component.onCancel();
    expect(emitted).toBeTrue();
  });
});
```

- [ ] **Step 2: Rodar testes para confirmar falhas**

```bash
cd /opt/dyna-form && ng test dynaform --watch=false --include="**/dyf-form.component.spec.ts" 2>&1 | tail -20
```

Esperado: erros de compilação — `buildFormFields` ainda não existe.

- [ ] **Step 3: Atualizar `dyf-form.component.ts`**

```typescript
import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PoButtonModule,
  PoDynamicModule,
  PoDynamicFormField,
  PoDynamicFormComponent,
} from '@po-ui/ng-components';
import { DyfTable } from '../../models/dyf-table.interface';
import { DyfFormBuilderService } from '../../services/dyf-form-builder.service';

@Component({
  selector: 'dyf-form',
  standalone: true,
  imports: [CommonModule, PoButtonModule, PoDynamicModule],
  templateUrl: './dyf-form.component.html',
  styles: [],
})
export class DyfFormComponent implements OnInit {
  @Input({ required: true }) table!: DyfTable;
  @Input() value: Record<string, any> = {};

  @Output() save = new EventEmitter<Record<string, any>>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('dynamicForm') dynamicForm!: PoDynamicFormComponent;

  poFields: PoDynamicFormField[] = [];
  formValue: Record<string, any> = {};

  constructor(private builder: DyfFormBuilderService) {}

  ngOnInit(): void {
    this.poFields = this.builder.buildFormFields(this.table);
    this.formValue = { ...this.value };
  }

  onSave(): void {
    this.save.emit(this.dynamicForm.value);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
```

- [ ] **Step 4: Rodar testes e confirmar que passam**

```bash
cd /opt/dyna-form && ng test dynaform --watch=false --include="**/dyf-form.component.spec.ts" 2>&1 | tail -20
```

Esperado: `X specs, 0 failures`

- [ ] **Step 5: Commit**

```bash
git add projects/dynaform/src/lib/components/dyf-form/
git commit -m "feat(dyf-form): use buildFormFields from DyfFormBuilderService"
```

---

### Task 5: dyf-grid

**Files:**
- Modify: `projects/dynaform/src/lib/components/dyf-grid/dyf-grid.component.ts`
- Create: `projects/dynaform/src/lib/components/dyf-grid/dyf-grid.component.spec.ts`

- [ ] **Step 1: Criar testes do dyf-grid**

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DyfGridComponent } from './dyf-grid.component';
import { DyfFormBuilderService } from '../../services/dyf-form-builder.service';
import { DyfTable } from '../../models/dyf-table.interface';

const MOCK_TABLE: DyfTable = {
  tableName: 'test',
  revision: 1,
  label: 'Test',
  fields: [
    { fieldName: 'id', property: 'id', label: 'ID', type: 'number', order: 1, key: true },
    { fieldName: 'name', property: 'name', label: 'Nome', type: 'string', order: 2 },
  ],
};

describe('DyfGridComponent', () => {
  let fixture: ComponentFixture<DyfGridComponent>;
  let component: DyfGridComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DyfGridComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DyfGridComponent);
    component = fixture.componentInstance;
    component.table = MOCK_TABLE;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate columns using buildGridColumns on init', () => {
    const builder = TestBed.inject(DyfFormBuilderService);
    spyOn(builder, 'buildGridColumns').and.callThrough();

    fixture.detectChanges();

    expect(builder.buildGridColumns).toHaveBeenCalledWith(MOCK_TABLE);
    expect(component.columns.length).toBe(2);
  });

  it('should create 3 row actions (Visualizar, Editar, Excluir)', () => {
    fixture.detectChanges();
    expect(component.actions.length).toBe(3);
    expect(component.actions.map(a => a.label)).toEqual(['Visualizar', 'Editar', 'Excluir']);
  });

  it('should emit view with row data when Visualizar action fires', () => {
    fixture.detectChanges();
    const row = { id: 1, name: 'Maria' };
    let emitted: any;
    component.view.subscribe((v: any) => (emitted = v));
    component.actions[0].action(row);
    expect(emitted).toEqual(row);
  });

  it('should emit edit with row data when Editar action fires', () => {
    fixture.detectChanges();
    const row = { id: 1, name: 'Maria' };
    let emitted: any;
    component.edit.subscribe((v: any) => (emitted = v));
    component.actions[1].action(row);
    expect(emitted).toEqual(row);
  });

  it('should emit delete with row data when Excluir action fires', () => {
    fixture.detectChanges();
    const row = { id: 1, name: 'Maria' };
    let emitted: any;
    component.delete.subscribe((v: any) => (emitted = v));
    component.actions[2].action(row);
    expect(emitted).toEqual(row);
  });
});
```

- [ ] **Step 2: Rodar testes para confirmar falhas**

```bash
cd /opt/dyna-form && ng test dynaform --watch=false --include="**/dyf-grid.component.spec.ts" 2>&1 | tail -20
```

Esperado: erros de compilação — `buildGridColumns` não existe ainda.

- [ ] **Step 3: Atualizar `dyf-grid.component.ts`**

```typescript
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PoTableModule, PoTableColumn, PoTableAction } from '@po-ui/ng-components';
import { DyfTable } from '../../models/dyf-table.interface';
import { DyfFormBuilderService } from '../../services/dyf-form-builder.service';

@Component({
  selector: 'dyf-grid',
  standalone: true,
  imports: [CommonModule, PoTableModule],
  templateUrl: './dyf-grid.component.html',
  styles: [],
})
export class DyfGridComponent implements OnInit {
  @Input({ required: true }) table!: DyfTable;
  @Input() items: any[] = [];
  @Input() loading = false;

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() view = new EventEmitter<any>();

  columns: PoTableColumn[] = [];
  actions: PoTableAction[] = [];

  constructor(private builder: DyfFormBuilderService) {}

  ngOnInit(): void {
    this.columns = this.builder.buildGridColumns(this.table);
    this.actions = [
      { label: 'Visualizar', action: (row: any) => this.view.emit(row) },
      { label: 'Editar', action: (row: any) => this.edit.emit(row) },
      { label: 'Excluir', action: (row: any) => this.delete.emit(row), type: 'danger' },
    ];
  }
}
```

- [ ] **Step 4: Rodar testes e confirmar que passam**

```bash
cd /opt/dyna-form && ng test dynaform --watch=false --include="**/dyf-grid.component.spec.ts" 2>&1 | tail -20
```

Esperado: `X specs, 0 failures`

- [ ] **Step 5: Commit**

```bash
git add projects/dynaform/src/lib/components/dyf-grid/
git commit -m "feat(dyf-grid): use buildGridColumns from DyfFormBuilderService"
```

---

### Task 6: dyf-detail

**Files:**
- Modify: `projects/dynaform/src/lib/components/dyf-detail/dyf-detail.component.ts`
- Create: `projects/dynaform/src/lib/components/dyf-detail/dyf-detail.component.spec.ts`

- [ ] **Step 1: Criar testes do dyf-detail**

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DyfDetailComponent } from './dyf-detail.component';
import { DyfFormBuilderService } from '../../services/dyf-form-builder.service';
import { DyfTable } from '../../models/dyf-table.interface';

const MOCK_TABLE: DyfTable = {
  tableName: 'test',
  revision: 1,
  label: 'Test',
  fields: [
    { fieldName: 'id', property: 'id', label: 'ID', type: 'number', order: 1 },
    { fieldName: 'name', property: 'name', label: 'Nome', type: 'string', order: 2 },
    { fieldName: 'secret', property: 'pass', label: 'Senha', type: 'string', order: 3, visibleOnDetail: false },
  ],
};

describe('DyfDetailComponent', () => {
  let fixture: ComponentFixture<DyfDetailComponent>;
  let component: DyfDetailComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DyfDetailComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DyfDetailComponent);
    component = fixture.componentInstance;
    component.table = MOCK_TABLE;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate poFields using buildDetailFields on init', () => {
    const builder = TestBed.inject(DyfFormBuilderService);
    spyOn(builder, 'buildDetailFields').and.callThrough();

    fixture.detectChanges();

    expect(builder.buildDetailFields).toHaveBeenCalledWith(MOCK_TABLE);
  });

  it('should exclude fields with visibleOnDetail = false', () => {
    fixture.detectChanges();
    expect(component.poFields.length).toBe(2);
    expect(component.poFields.find(f => f.property === 'pass')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Rodar testes para confirmar falhas**

```bash
cd /opt/dyna-form && ng test dynaform --watch=false --include="**/dyf-detail.component.spec.ts" 2>&1 | tail -20
```

Esperado: erros de compilação — `buildDetailFields` não existe ainda.

- [ ] **Step 3: Atualizar `dyf-detail.component.ts`**

```typescript
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PoDynamicModule, PoDynamicViewField } from '@po-ui/ng-components';
import { DyfTable } from '../../models/dyf-table.interface';
import { DyfFormBuilderService } from '../../services/dyf-form-builder.service';

@Component({
  selector: 'dyf-detail',
  standalone: true,
  imports: [CommonModule, PoDynamicModule],
  templateUrl: './dyf-detail.component.html',
  styles: [],
})
export class DyfDetailComponent implements OnInit {
  @Input({ required: true }) table!: DyfTable;
  @Input() value: Record<string, any> = {};

  poFields: PoDynamicViewField[] = [];

  constructor(private builder: DyfFormBuilderService) {}

  ngOnInit(): void {
    this.poFields = this.builder.buildDetailFields(this.table);
  }
}
```

- [ ] **Step 4: Rodar testes e confirmar que passam**

```bash
cd /opt/dyna-form && ng test dynaform --watch=false --include="**/dyf-detail.component.spec.ts" 2>&1 | tail -20
```

Esperado: `X specs, 0 failures`

- [ ] **Step 5: Commit**

```bash
git add projects/dynaform/src/lib/components/dyf-detail/
git commit -m "feat(dyf-detail): use buildDetailFields from DyfFormBuilderService"
```

---

### Task 7: Rodar todos os testes + atualizar demo

- [ ] **Step 1: Rodar suite completa da library**

```bash
cd /opt/dyna-form && ng test dynaform --watch=false 2>&1 | tail -20
```

Esperado: todos os specs passando, 0 failures.

- [ ] **Step 2: Atualizar `SAMPLE_TABLE` no demo**

Em `projects/dynaform-demo/src/app/app.component.ts`, substituir `SAMPLE_TABLE` para usar a nova estrutura:

```typescript
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
```

- [ ] **Step 3: Verificar build do demo**

```bash
cd /opt/dyna-form && ng build dynaform && ng serve dynaform-demo --watch=false 2>&1 | head -10
```

Esperado: build sem erros de compilação.

- [ ] **Step 4: Commit final**

```bash
git add projects/dynaform-demo/src/app/app.component.ts
git commit -m "chore(demo): update SAMPLE_TABLE to new DyfTable structure"
```

---

## Checklist de validação final

Antes de marcar o roadmap como completo, verificar:

- [ ] `ng build dynaform` sem erros
- [ ] `ng test dynaform --watch=false` → 0 failures
- [ ] `ng serve` → demo app abre, grid exibe clientes, form edita, detail exibe detalhes
- [ ] Campo com `visibleOnForm: false` não aparece no form mas aparece no grid/detail
- [ ] Campo com `folderId` recebe `divider` com o label correto da seção
- [ ] `poConfig` em um campo sobrescreve propriedades no form renderizado
