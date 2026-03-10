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
  styles: []
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
    this.columns = this.builder.buildPoTableColumns(this.table);
    this.actions = [
      { label: 'Visualizar', action: (row: any) => this.view.emit(row) },
      { label: 'Editar', action: (row: any) => this.edit.emit(row) },
      { label: 'Excluir', action: (row: any) => this.delete.emit(row), type: 'danger' },
    ];
  }
}
