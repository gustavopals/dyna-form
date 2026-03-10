import { DyfField } from './dyf-field.interface';

export interface DyfFolder {
  id: string;
  label: string;
  /** Display order among folders */
  order?: number;
  fields?: DyfField[];
}
