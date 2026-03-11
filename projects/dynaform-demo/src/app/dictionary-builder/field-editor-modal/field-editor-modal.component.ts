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
