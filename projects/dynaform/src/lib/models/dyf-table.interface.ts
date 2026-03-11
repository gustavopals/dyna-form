import { DyfField } from './dyf-field.interface';
import { DyfFolder } from './dyf-folder.interface';

export interface DyfTable {
  tableName: string;
  revision: number;
  label: string;
  description?: string;
  endpoint?: string;
  fields: DyfField[];
  folders?: DyfFolder[];
}
