import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DyfFormComponent } from './dyf-form.component';
import { DyfFormBuilderService } from '../../services/dyf-form-builder.service';
import { DyfTable } from '../../models/dyf-table.interface';

const MOCK_TABLE: DyfTable = {
  tableName: 'test',
  revision: 1,
  label: 'Test',
  fields: [
    { fieldName: 'name', property: 'name', label: 'Nome', type: 'string', order: 1 },
  ],
};

describe('DyfFormComponent', () => {
  let fixture: ComponentFixture<DyfFormComponent>;
  let component: DyfFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DyfFormComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DyfFormComponent);
    component = fixture.componentInstance;
    component.table = MOCK_TABLE;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate poFields using buildFormFields on init', () => {
    const builder = TestBed.inject(DyfFormBuilderService);
    spyOn(builder, 'buildFormFields').and.callThrough();
    fixture.detectChanges();
    expect(builder.buildFormFields).toHaveBeenCalledWith(MOCK_TABLE);
    expect(component.poFields.length).toBe(1);
    expect(component.poFields[0].property).toBe('name');
  });

  it('should copy the input value to formValue on init', () => {
    component.value = { name: 'Maria' };
    fixture.detectChanges();
    expect(component.formValue).toEqual({ name: 'Maria' });
  });

  it('should emit cancel when onCancel is called', () => {
    let emitted = false;
    component.cancel.subscribe(() => (emitted = true));
    component.onCancel();
    expect(emitted).toBeTrue();
  });
});
