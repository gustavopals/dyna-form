import { TestBed } from '@angular/core/testing';
import { DictionaryBuilderService } from './dictionary-builder.service';
import { DyfTable } from 'dynaform';

const MOCK_TABLE: DyfTable = {
  tableName: 'test_table',
  revision: 1,
  label: 'Test',
  fields: [{ fieldName: 'id', property: 'id', label: 'ID', type: 'number', key: true }],
};

describe('DictionaryBuilderService', () => {
  let service: DictionaryBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DictionaryBuilderService);
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  it('should save and load a table', () => {
    service.save(MOCK_TABLE);
    expect(service.load('test_table', 1)).toEqual(MOCK_TABLE);
  });

  it('should return null for non-existent table', () => {
    expect(service.load('nonexistent', 1)).toBeNull();
  });

  it('should load all saved tables', () => {
    service.save(MOCK_TABLE);
    service.save({ ...MOCK_TABLE, tableName: 'other' });
    expect(service.loadAll().length).toBe(2);
  });

  it('should delete a table', () => {
    service.save(MOCK_TABLE);
    service.delete('test_table', 1);
    expect(service.load('test_table', 1)).toBeNull();
  });

  it('should export JSON with 2-space indent', () => {
    expect(service.exportJson(MOCK_TABLE)).toBe(JSON.stringify(MOCK_TABLE, null, 2));
  });
});
