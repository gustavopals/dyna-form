import { PoDynamicFormField } from '@po-ui/ng-components';

export type DyfFieldType =
  | 'string'    // po-input | po-textarea (rows>1) | po-password (secret) | po-combo (optionsService)
  | 'number'    // po-number | po-decimal
  | 'currency'  // po-decimal (mode currency)
  | 'boolean'   // po-switch | po-checkbox (forceBooleanComponentType)
  | 'date'      // po-datepicker
  | 'dateTime'  // po-datepicker com hora
  | 'time';     // po-input time

export interface DyfFieldOption {
  label: string;
  value: any;
}

export interface DyfField {
  // identidade
  fieldName: string;
  property: string;
  label: string;
  type: DyfFieldType;

  // layout
  order?: number;
  gridColumns?: number;
  folderId?: string;

  // visibilidade por contexto (default: true)
  visibleOnGrid?: boolean;
  visibleOnForm?: boolean;
  visibleOnDetail?: boolean;
  key?: boolean;

  // core
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  placeholder?: string;
  clean?: boolean;

  // string
  mask?: string;
  maxLength?: number;
  minLength?: number;
  rows?: number;
  secret?: boolean;

  // select / combo / multiselect / radiogroup / checkbox
  options?: DyfFieldOption[];
  optionsMulti?: boolean;
  optionsService?: string;

  // lookup
  searchService?: string;

  // date / number / currency
  format?: string;
  decimalsLength?: number;

  // escape hatch — mergeado ao PoDynamicFormField ao renderizar
  poConfig?: Partial<PoDynamicFormField>;
}
