export type DyfFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'textarea'
  | 'password'
  | 'email'
  | 'phone'
  | 'cpf'
  | 'cnpj'
  | 'currency'
  | 'lookup';

export interface DyfFieldOption {
  label: string;
  value: any;
}

export interface DyfField {
  /** Property name mapped to the data object */
  property: string;
  label: string;
  type: DyfFieldType;

  /** Display order */
  order?: number;

  /** PO-UI grid columns (1–12) */
  gridColumns?: number;

  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  tooltip?: string;
  mask?: string;
  maxLength?: number;
  minLength?: number;

  /** For select / multiselect */
  options?: DyfFieldOption[];

  /** Folder/section this field belongs to */
  folderId?: string;

  /** Visibility flags */
  visibleOnGrid?: boolean;
  visibleOnForm?: boolean;
  visibleOnDetail?: boolean;
}
