import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DyfDetailComponent } from './dyf-detail.component';
import { DyfFormBuilderService } from '../../services/dyf-form-builder.service';
import { DyfTable } from '../../models/dyf-table.interface';

const MOCK_TABLE: DyfTable = {
  tableName: 'test',
  revision: 1,
  label: 'Test',
  fields: [
    { fieldName: 'id', property: 'id', label: 'ID', type: 'number', order: 1 },
    { fieldName: 'name', property: 'name', label: 'Nome', type: 'string', order: 2 },
    { fieldName: 'secret', property: 'pass', label: 'Senha', type: 'string', order: 3, visibleOnDetail: false },
  ],
};

describe('DyfDetailComponent', () => {
  let fixture: ComponentFixture<DyfDetailComponent>;
  let component: DyfDetailComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DyfDetailComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DyfDetailComponent);
    component = fixture.componentInstance;
    component.table = MOCK_TABLE;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate poFields using buildDetailFields on init', () => {
    const builder = TestBed.inject(DyfFormBuilderService);
    spyOn(builder, 'buildDetailFields').and.callThrough();
    fixture.detectChanges();
    expect(builder.buildDetailFields).toHaveBeenCalledWith(MOCK_TABLE);
  });

  it('should exclude fields with visibleOnDetail = false', () => {
    fixture.detectChanges();
    expect(component.poFields.length).toBe(2);
    expect(component.poFields.find(f => f.property === 'pass')).toBeUndefined();
  });
});
