import { TestBed } from '@angular/core/testing';
import { DyfFormBuilderService } from './dyf-form-builder.service';
import { DyfTable } from '../models/dyf-table.interface';

const BASE_TABLE: DyfTable = {
  tableName: 'test',
  revision: 1,
  label: 'Test',
  fields: [],
};

describe('DyfFormBuilderService', () => {
  let service: DyfFormBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DyfFormBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('buildFormFields', () => {
    it('should include fields where visibleOnForm is not false', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [
          { fieldName: 'f1', property: 'a', label: 'A', type: 'string', order: 1 },
          { fieldName: 'f2', property: 'b', label: 'B', type: 'string', order: 2, visibleOnForm: true },
        ],
      };
      const result = service.buildFormFields(table);
      expect(result.length).toBe(2);
    });

    it('should exclude fields with visibleOnForm = false', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [
          { fieldName: 'f1', property: 'a', label: 'A', type: 'string', order: 1 },
          { fieldName: 'f2', property: 'b', label: 'B', type: 'string', order: 2, visibleOnForm: false },
        ],
      };
      const result = service.buildFormFields(table);
      expect(result.length).toBe(1);
      expect(result[0].property).toBe('a');
    });

    it('should sort fields by order ascending', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [
          { fieldName: 'f2', property: 'b', label: 'B', type: 'string', order: 2 },
          { fieldName: 'f1', property: 'a', label: 'A', type: 'string', order: 1 },
        ],
      };
      const result = service.buildFormFields(table);
      expect(result[0].property).toBe('a');
      expect(result[1].property).toBe('b');
    });

    it('should inject divider label on the first field of each folder', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [
          { fieldName: 'f1', property: 'a', label: 'A', type: 'string', order: 1, folderId: 'sec1' },
          { fieldName: 'f2', property: 'b', label: 'B', type: 'string', order: 2, folderId: 'sec1' },
          { fieldName: 'f3', property: 'c', label: 'C', type: 'string', order: 3, folderId: 'sec2' },
        ],
        folders: [
          { folderId: 'sec1', label: 'Seção 1', order: 1 },
          { folderId: 'sec2', label: 'Seção 2', order: 2 },
        ],
      };
      const result = service.buildFormFields(table);
      expect(result[0].divider).toBe('Seção 1');
      expect(result[1].divider).toBeUndefined();
      expect(result[2].divider).toBe('Seção 2');
    });

    it('should not inject divider when field has no folderId', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [
          { fieldName: 'f1', property: 'a', label: 'A', type: 'string', order: 1 },
        ],
      };
      const result = service.buildFormFields(table);
      expect(result[0].divider).toBeUndefined();
    });

    it('should merge poConfig over base properties', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [
          {
            fieldName: 'f1', property: 'a', label: 'Original', type: 'string', order: 1,
            poConfig: { label: 'Overridden', rows: 5 },
          },
        ],
      };
      const result = service.buildFormFields(table);
      expect(result[0].label).toBe('Overridden');
      expect(result[0].rows).toBe(5);
    });

    it('should map core properties to PoDynamicFormField', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [
          {
            fieldName: 'f1', property: 'name', label: 'Nome', type: 'string', order: 1,
            required: true, placeholder: 'Digite', maxLength: 50, gridColumns: 6,
          },
        ],
      };
      const result = service.buildFormFields(table);
      expect(result[0].required).toBeTrue();
      expect(result[0].placeholder).toBe('Digite');
      expect(result[0].maxLength).toBe(50);
      expect(result[0].gridColumns).toBe(6);
    });
  });

  describe('buildGridColumns', () => {
    it('should include fields where visibleOnGrid is not false', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [
          { fieldName: 'f1', property: 'a', label: 'A', type: 'string', order: 1 },
          { fieldName: 'f2', property: 'b', label: 'B', type: 'string', order: 2, visibleOnGrid: false },
        ],
      };
      const result = service.buildGridColumns(table);
      expect(result.length).toBe(1);
      expect(result[0].property).toBe('a');
    });

    it('should map boolean type to "boolean" PoTableColumn type', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [{ fieldName: 'f1', property: 'active', label: 'Ativo', type: 'boolean', order: 1 }],
      };
      expect(service.buildGridColumns(table)[0].type).toBe('boolean');
    });

    it('should map date type to "date" PoTableColumn type', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [{ fieldName: 'f1', property: 'dt', label: 'Data', type: 'date', order: 1 }],
      };
      expect(service.buildGridColumns(table)[0].type).toBe('date');
    });

    it('should map currency type to "currency" PoTableColumn type', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [{ fieldName: 'f1', property: 'val', label: 'Valor', type: 'currency', order: 1 }],
      };
      expect(service.buildGridColumns(table)[0].type).toBe('currency');
    });

    it('should map number type to "number" PoTableColumn type', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [{ fieldName: 'f1', property: 'qty', label: 'Qtd', type: 'number', order: 1 }],
      };
      expect(service.buildGridColumns(table)[0].type).toBe('number');
    });

    it('should map all other types to "string" PoTableColumn type', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [{ fieldName: 'f1', property: 'name', label: 'Nome', type: 'string', order: 1 }],
      };
      expect(service.buildGridColumns(table)[0].type).toBe('string');
    });
  });

  describe('buildDetailFields', () => {
    it('should include fields where visibleOnDetail is not false', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [
          { fieldName: 'f1', property: 'a', label: 'A', type: 'string', order: 1 },
          { fieldName: 'f2', property: 'b', label: 'B', type: 'string', order: 2, visibleOnDetail: false },
        ],
      };
      const result = service.buildDetailFields(table);
      expect(result.length).toBe(1);
      expect(result[0].property).toBe('a');
    });

    it('should sort fields by order', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [
          { fieldName: 'f2', property: 'b', label: 'B', type: 'string', order: 2 },
          { fieldName: 'f1', property: 'a', label: 'A', type: 'string', order: 1 },
        ],
      };
      const result = service.buildDetailFields(table);
      expect(result[0].property).toBe('a');
    });
  });

  describe('getKeyField', () => {
    it('should return the field marked with key: true', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [
          { fieldName: 'id', property: 'id', label: 'ID', type: 'number', order: 1, key: true },
          { fieldName: 'name', property: 'name', label: 'Nome', type: 'string', order: 2 },
        ],
      };
      expect(service.getKeyField(table)?.fieldName).toBe('id');
    });

    it('should return undefined when no field has key: true', () => {
      const table: DyfTable = {
        ...BASE_TABLE,
        fields: [
          { fieldName: 'name', property: 'name', label: 'Nome', type: 'string', order: 1 },
        ],
      };
      expect(service.getKeyField(table)).toBeUndefined();
    });
  });
});
