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
  value: string | number | boolean;
}

export interface DyfField {
  // identidade
  /** Identificador único do campo dentro do dicionário (chave no schema DYF_FIELDS). */
  fieldName: string;
  /** Nome da propriedade no objeto de dados em runtime (ex: 'customerName'). */
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
  /** Marca este campo como chave primária da entidade. Usado pelo dyf-grid para identificar linhas nas ações. */
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
  // Componente renderizado depende da combinação de type + estas props:
  // - options (≤3 items) → po-radio-group | options (>3) → po-select
  // - optionsService → po-combo
  // - optionsMulti: true → po-multiselect
  // - type: 'boolean' → po-switch | po-checkbox
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
