import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DyfGridComponent } from './dyf-grid.component';
import { DyfFormBuilderService } from '../../services/dyf-form-builder.service';
import { DyfTable } from '../../models/dyf-table.interface';

const MOCK_TABLE: DyfTable = {
  tableName: 'test',
  revision: 1,
  label: 'Test',
  fields: [
    { fieldName: 'id', property: 'id', label: 'ID', type: 'number', order: 1, key: true },
    { fieldName: 'name', property: 'name', label: 'Nome', type: 'string', order: 2 },
  ],
};

describe('DyfGridComponent', () => {
  let fixture: ComponentFixture<DyfGridComponent>;
  let component: DyfGridComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DyfGridComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DyfGridComponent);
    component = fixture.componentInstance;
    component.table = MOCK_TABLE;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate columns using buildGridColumns on init', () => {
    const builder = TestBed.inject(DyfFormBuilderService);
    spyOn(builder, 'buildGridColumns').and.callThrough();
    fixture.detectChanges();
    expect(builder.buildGridColumns).toHaveBeenCalledWith(MOCK_TABLE);
    expect(component.columns.length).toBe(2);
  });

  it('should create 3 row actions (Visualizar, Editar, Excluir)', () => {
    fixture.detectChanges();
    expect(component.actions.length).toBe(3);
    expect(component.actions.map(a => a.label)).toEqual(['Visualizar', 'Editar', 'Excluir']);
  });

  it('should emit view with row data when Visualizar action fires', () => {
    fixture.detectChanges();
    const row = { id: 1, name: 'Maria' };
    let emitted: any;
    component.view.subscribe((v: any) => (emitted = v));
    component.actions[0].action(row);
    expect(emitted).toEqual(row);
  });

  it('should emit edit with row data when Editar action fires', () => {
    fixture.detectChanges();
    const row = { id: 1, name: 'Maria' };
    let emitted: any;
    component.edit.subscribe((v: any) => (emitted = v));
    component.actions[1].action(row);
    expect(emitted).toEqual(row);
  });

  it('should emit delete with row data when Excluir action fires', () => {
    fixture.detectChanges();
    const row = { id: 1, name: 'Maria' };
    let emitted: any;
    component.delete.subscribe((v: any) => (emitted = v));
    component.actions[2].action(row);
    expect(emitted).toEqual(row);
  });
});
