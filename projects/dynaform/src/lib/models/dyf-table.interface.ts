import { DyfField } from './dyf-field.interface';
import { DyfFolder } from './dyf-folder.interface';

export interface DyfTable {
  id: string;
  label: string;
  description?: string;
  /** Base REST endpoint for CRUD operations */
  endpoint?: string;
  fields: DyfField[];
  folders?: DyfFolder[];
}
