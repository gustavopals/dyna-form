import { Component } from '@angular/core';
import { PoButtonModule, PoToolbarModule } from '@po-ui/ng-components';
import { DyfFormComponent, DyfGridComponent, DyfDetailComponent, DyfTable } from 'dynaform';

const SAMPLE_TABLE: DyfTable = {
  id: 'customers',
  label: 'Clientes',
  endpoint: '/api/customers',
  fields: [
    { property: 'id', label: 'ID', type: 'number', order: 1, visibleOnForm: false, visibleOnDetail: true, visibleOnGrid: true, gridColumns: 2 },
    { property: 'name', label: 'Nome', type: 'text', order: 2, required: true, gridColumns: 6 },
    { property: 'email', label: 'E-mail', type: 'email', order: 3, required: true, gridColumns: 6 },
    { property: 'phone', label: 'Telefone', type: 'phone', order: 4, gridColumns: 4 },
    { property: 'active', label: 'Ativo', type: 'boolean', order: 5, gridColumns: 2 },
    { property: 'createdAt', label: 'Data de Cadastro', type: 'date', order: 6, visibleOnForm: false, gridColumns: 4 },
  ]
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PoToolbarModule, PoButtonModule, DyfFormComponent, DyfGridComponent, DyfDetailComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  table = SAMPLE_TABLE;
  view: 'grid' | 'form' | 'detail' = 'grid';
  selectedItem: any = null;

  items = [
    { id: 1, name: 'Maria Silva', email: 'maria@email.com', phone: '11999990000', active: true, createdAt: '2025-01-15' },
    { id: 2, name: 'João Souza', email: 'joao@email.com', phone: '11988880000', active: false, createdAt: '2025-03-22' },
  ];

  onEdit(row: any): void {
    this.selectedItem = { ...row };
    this.view = 'form';
  }

  onViewDetail(row: any): void {
    this.selectedItem = row;
    this.view = 'detail';
  }

  onDelete(row: any): void {
    this.items = this.items.filter(i => i.id !== row.id);
  }

  onSave(value: any): void {
    const idx = this.items.findIndex(i => i.id === value.id);
    if (idx >= 0) {
      this.items = this.items.map(i => (i.id === value.id ? value : i));
    } else {
      this.items = [...this.items, { ...value, id: Date.now() }];
    }
    this.view = 'grid';
  }

  newRecord(): void {
    this.selectedItem = {};
    this.view = 'form';
  }

  back(): void {
    this.view = 'grid';
  }
}

