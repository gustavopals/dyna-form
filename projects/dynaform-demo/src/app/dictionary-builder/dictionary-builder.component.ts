import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PoButtonModule,
  PoDividerModule,
  PoFieldModule,
  PoModalAction,
  PoModalComponent,
  PoModalModule,
  PoNotificationService,
  PoTableAction,
  PoTableColumn,
  PoTableModule,
} from '@po-ui/ng-components';
import { DyfField, DyfFolder, DyfTable } from 'dynaform';
import { DictionaryBuilderService } from './dictionary-builder.service';
import { FieldEditorModalComponent } from './field-editor-modal/field-editor-modal.component';
import { PreviewPanelComponent } from './preview-panel/preview-panel.component';

@Component({
  selector: 'app-dictionary-builder',
  standalone: true,
  imports: [
    FormsModule,
    PoButtonModule,
    PoDividerModule,
    PoFieldModule,
    PoModalModule,
    PoTableModule,
    FieldEditorModalComponent,
    PreviewPanelComponent,
  ],
  templateUrl: './dictionary-builder.component.html',
  styleUrl: './dictionary-builder.component.scss',
})
export class DictionaryBuilderComponent {
  @ViewChild('fieldModal') fieldModal!: FieldEditorModalComponent;
  @ViewChild('folderModal') folderModal!: PoModalComponent;

  // --- State ---
  tableForm = { tableName: '', revision: 1, label: '', description: '', endpoint: '' };
  fields: DyfField[] = [];
  folders: DyfFolder[] = [];
  showPreview = false;
  showFolders = false;

  // --- Folder modal state ---
  editingFolder: Partial<DyfFolder> = {};
  editingFolderOriginalId: string | null = null;
  private editingFieldOriginalName: string | null = null;

  readonly folderPrimaryAction: PoModalAction = {
    label: 'Salvar',
    action: () => this.saveFolder(),
  };
  readonly folderSecondaryAction: PoModalAction = {
    label: 'Cancelar',
    action: () => this.folderModal.close(),
  };

  // --- Table columns ---
  readonly fieldColumns: PoTableColumn[] = [
    { property: 'order', label: 'Ordem', width: '80px' },
    { property: 'fieldName', label: 'Campo' },
    { property: 'label', label: 'Label' },
    { property: 'type', label: 'Tipo', width: '100px' },
    { property: 'key', label: 'Chave', type: 'boolean', width: '80px' },
  ];

  readonly fieldActions: PoTableAction[] = [
    { label: 'Editar', icon: 'po-icon-edit', action: (row: DyfField) => this.openEditField(row) },
    { label: 'Excluir', icon: 'po-icon-delete', action: (row: DyfField) => this.deleteField(row) },
  ];

  readonly folderColumns: PoTableColumn[] = [
    { property: 'folderId', label: 'ID' },
    { property: 'label', label: 'Label' },
    { property: 'order', label: 'Ordem', width: '80px' },
  ];

  readonly folderTableActions: PoTableAction[] = [
    { label: 'Editar', icon: 'po-icon-edit', action: (row: DyfFolder) => this.openEditFolder(row) },
    { label: 'Excluir', icon: 'po-icon-delete', action: (row: DyfFolder) => this.deleteFolder(row) },
  ];

  constructor(
    private builderService: DictionaryBuilderService,
    private notification: PoNotificationService,
  ) {}

  // --- Computed ---
  get currentTable(): DyfTable {
    return {
      tableName: this.tableForm.tableName,
      revision: this.tableForm.revision,
      label: this.tableForm.label,
      description: this.tableForm.description || undefined,
      endpoint: this.tableForm.endpoint || undefined,
      fields: [...this.fields],
      folders: this.folders.length > 0 ? [...this.folders] : undefined,
    };
  }

  get hasKeyField(): boolean {
    return this.fields.some(f => f.key);
  }

  get canSave(): boolean {
    const SNAKE = /^[a-z][a-z0-9_]*$/;
    return (
      !!this.tableForm.tableName &&
      SNAKE.test(this.tableForm.tableName) &&
      this.tableForm.revision >= 1 &&
      !!this.tableForm.label &&
      this.fields.length > 0 &&
      this.hasKeyField
    );
  }

  get folderSelectOptions(): { label: string; value: string }[] {
    return this.folders.map(f => ({ label: f.label, value: f.folderId }));
  }

  // --- Fields ---
  openAddField(): void {
    this.editingFieldOriginalName = null;
    const existing = this.fields.map(f => f.fieldName);
    this.fieldModal.open(undefined, existing, this.folderSelectOptions, this.hasKeyField);
  }

  openEditField(field: DyfField): void {
    this.editingFieldOriginalName = field.fieldName;
    const existing = this.fields.filter(f => f.fieldName !== field.fieldName).map(f => f.fieldName);
    this.fieldModal.open({ ...field }, existing, this.folderSelectOptions, this.hasKeyField && !field.key);
  }

  onFieldSaved(field: DyfField): void {
    const lookupName = this.editingFieldOriginalName ?? field.fieldName;
    const idx = this.fields.findIndex(f => f.fieldName === lookupName);
    if (idx >= 0) {
      this.fields = this.fields.map((f, i) => (i === idx ? field : f));
    } else {
      this.fields = [...this.fields, field];
    }
    this.editingFieldOriginalName = null;
    // Only one key field allowed
    if (field.key) {
      this.fields = this.fields.map(f => f.fieldName === field.fieldName ? f : { ...f, key: undefined });
    }
  }

  deleteField(field: DyfField): void {
    this.fields = this.fields.filter(f => f.fieldName !== field.fieldName);
  }

  // --- Folders ---
  openAddFolder(): void {
    this.editingFolder = {};
    this.editingFolderOriginalId = null;
    this.folderModal.open();
  }

  openEditFolder(folder: DyfFolder): void {
    this.editingFolder = { ...folder };
    this.editingFolderOriginalId = folder.folderId;
    this.folderModal.open();
  }

  saveFolder(): void {
    const SNAKE_CASE = /^[a-z][a-z0-9_]*$/;
    if (!this.editingFolder.folderId?.trim() || !this.editingFolder.label?.trim()) {
      this.notification.warning({ message: 'ID e Label do folder são obrigatórios.' });
      return;
    }
    if (!SNAKE_CASE.test(this.editingFolder.folderId!)) {
      this.notification.warning({ message: 'folderId deve ser snake_case (ex: dados_pessoais).' });
      return;
    }

    if (this.editingFolderOriginalId) {
      const collides = this.folders.some(
        f => f.folderId === this.editingFolder.folderId && f.folderId !== this.editingFolderOriginalId
      );
      if (collides) {
        this.notification.warning({ message: `folderId "${this.editingFolder.folderId}" já existe.` });
        return;
      }
      this.folders = this.folders.map(f =>
        f.folderId === this.editingFolderOriginalId
          ? { folderId: this.editingFolder.folderId!, label: this.editingFolder.label!, order: this.editingFolder.order }
          : f
      );
    } else {
      const exists = this.folders.some(f => f.folderId === this.editingFolder.folderId);
      if (exists) {
        this.notification.warning({ message: `folderId "${this.editingFolder.folderId}" já existe.` });
        return;
      }
      this.folders = [...this.folders, {
        folderId: this.editingFolder.folderId!,
        label: this.editingFolder.label!,
        order: this.editingFolder.order,
      }];
    }

    this.folderModal.close();
  }

  deleteFolder(folder: DyfFolder): void {
    this.folders = this.folders.filter(f => f.folderId !== folder.folderId);
    // Remove folderId reference from fields
    this.fields = this.fields.map(f =>
      f.folderId === folder.folderId ? { ...f, folderId: undefined } : f
    );
  }

  // --- Actions ---
  save(): void {
    if (!this.canSave) return;

    this.builderService.save(this.currentTable);
    this.notification.success({ message: `Dicionário "${this.tableForm.tableName}" salvo com sucesso!` });
  }

  async copyJson(): Promise<void> {
    if (this.fields.length === 0) {
      this.notification.warning({ message: 'Adicione campos antes de exportar o JSON.' });
      return;
    }
    try {
      await this.builderService.copyToClipboard(this.currentTable);
      this.notification.success({ message: 'JSON copiado para o clipboard!' });
    } catch {
      this.notification.error({ message: 'Não foi possível copiar. Use HTTPS ou permita acesso ao clipboard.' });
    }
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  toggleFolders(): void {
    this.showFolders = !this.showFolders;
  }
}
