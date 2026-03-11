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
