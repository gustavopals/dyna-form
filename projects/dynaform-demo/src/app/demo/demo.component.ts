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
