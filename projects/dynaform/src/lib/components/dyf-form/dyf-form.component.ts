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
  styles: []
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
    const fields = this.builder.getFormFields(this.table);
    this.poFields = fields.map(f => ({
      property: f.property,
      label: f.label,
      type: f.type as any,
      required: f.required,
      gridColumns: f.gridColumns,
      placeholder: f.placeholder,
      options: f.options,
      mask: f.mask,
      maxLength: f.maxLength,
    }));
    this.formValue = { ...this.value };
  }

  onSave(): void {
    this.save.emit(this.dynamicForm.value);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}

