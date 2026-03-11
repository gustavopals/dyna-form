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
