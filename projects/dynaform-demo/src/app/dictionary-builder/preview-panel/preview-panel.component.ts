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
        case 'date': {
          const today = new Date().toISOString().split('T')[0];
          data[field.property] = today;
          break;
        }
        case 'dateTime': {
          data[field.property] = new Date().toISOString().slice(0, 19);
          break;
        }
        case 'time':     data[field.property] = '10:00:00'; break;
        default: data[field.property] = null; break;
      }
    }
    return data;
  }
}
