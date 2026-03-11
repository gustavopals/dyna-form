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
