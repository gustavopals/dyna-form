import { Injectable } from '@angular/core';
import { DyfField, DyfFieldType } from '../models/dyf-field.interface';
import { DyfTable } from '../models/dyf-table.interface';
import { PoTableColumn } from '@po-ui/ng-components';

@Injectable({ providedIn: 'root' })
export class DyfFormBuilderService {

  /** Returns only the fields visible in forms, sorted by order */
  getFormFields(table: DyfTable): DyfField[] {
    return table.fields
      .filter(f => f.visibleOnForm !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  /** Returns only the fields visible in the grid, sorted by order */
  getGridFields(table: DyfTable): DyfField[] {
    return table.fields
      .filter(f => f.visibleOnGrid !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  /** Returns only the fields visible in the detail view, sorted by order */
  getDetailFields(table: DyfTable): DyfField[] {
    return table.fields
      .filter(f => f.visibleOnDetail !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  /** Maps DyfField type to a PO-UI table column type */
  mapToPoColumnType(type: DyfFieldType): string {
    const typeMap: Partial<Record<DyfFieldType, string>> = {
      boolean: 'boolean',
      date: 'date',
      currency: 'currency',
      number: 'number',
    };
    return typeMap[type] ?? 'string';
  }

  /** Builds PO-UI PoTableColumn array from a DyfTable */
  buildPoTableColumns(table: DyfTable): PoTableColumn[] {
    return this.getGridFields(table).map(field => ({
      property: field.property,
      label: field.label,
      type: this.mapToPoColumnType(field.type) as any,
    }));
  }
}
