import { Component } from '@angular/core';
import { PoButtonModule } from '@po-ui/ng-components';
import { DyfFormComponent, DyfGridComponent, DyfDetailComponent, DyfTable } from 'dynaform';

const SAMPLE_TABLE: DyfTable = {
  tableName: 'funcionarios',
  revision: 1,
  label: 'Funcionários',
  endpoint: '/api/funcionarios',
  folders: [
    { folderId: 'dados_pessoais',  label: 'Dados Pessoais',  order: 1 },
    { folderId: 'dados_cargo',     label: 'Cargo e Salário', order: 2 },
    { folderId: 'datas',           label: 'Datas',           order: 3 },
  ],
  fields: [
    // Chave
    { fieldName: 'id',           property: 'id',           label: 'ID',                type: 'number',   order:  1, key: true, visibleOnForm: false, gridColumns: 2 },

    // Dados Pessoais
    { fieldName: 'nome',         property: 'nome',         label: 'Nome Completo',     type: 'string',   order:  2, required: true, gridColumns: 8, folderId: 'dados_pessoais' },
    { fieldName: 'cpf',          property: 'cpf',          label: 'CPF',               type: 'string',   order:  3, required: true, gridColumns: 4, mask: '999.999.999-99', folderId: 'dados_pessoais', visibleOnGrid: false },
    { fieldName: 'email',        property: 'email',        label: 'E-mail',            type: 'string',   order:  4, required: true, gridColumns: 6, folderId: 'dados_pessoais' },
    { fieldName: 'telefone',     property: 'telefone',     label: 'Telefone',          type: 'string',   order:  5, gridColumns: 4, mask: '(99) 99999-9999', folderId: 'dados_pessoais' },
    { fieldName: 'ativo',        property: 'ativo',        label: 'Ativo',             type: 'boolean',  order:  6, gridColumns: 2, folderId: 'dados_pessoais' },

    // Cargo e Salário
    { fieldName: 'departamento', property: 'departamento', label: 'Departamento',      type: 'string',   order:  7, required: true, gridColumns: 6, folderId: 'dados_cargo',
      options: [
        { label: 'Engenharia',  value: 'eng' },
        { label: 'Produto',     value: 'prod' },
        { label: 'Comercial',   value: 'com' },
        { label: 'Financeiro',  value: 'fin' },
        { label: 'RH',          value: 'rh' },
      ]
    },
    { fieldName: 'cargo',        property: 'cargo',        label: 'Cargo',             type: 'string',   order:  8, required: true, gridColumns: 6, folderId: 'dados_cargo' },
    { fieldName: 'salario',      property: 'salario',      label: 'Salário',           type: 'currency', order:  9, gridColumns: 4, visibleOnGrid: false, folderId: 'dados_cargo' },
    { fieldName: 'carga_hr',     property: 'carga_hr',     label: 'Carga Horária (h)', type: 'number',   order: 10, gridColumns: 4, decimalsLength: 0, folderId: 'dados_cargo' },
    { fieldName: 'remoto',       property: 'remoto',       label: 'Trabalho Remoto',   type: 'boolean',  order: 11, gridColumns: 4, folderId: 'dados_cargo' },
    { fieldName: 'obs',          property: 'obs',          label: 'Observações',       type: 'string',   order: 12, gridColumns: 12, rows: 3, visibleOnGrid: false, folderId: 'dados_cargo' },

    // Datas
    { fieldName: 'dt_admissao',  property: 'dt_admissao',  label: 'Admissão',          type: 'date',     order: 13, required: true, gridColumns: 4, folderId: 'datas' },
    { fieldName: 'dt_nascimento',property: 'dt_nascimento',label: 'Nascimento',        type: 'date',     order: 14, gridColumns: 4, visibleOnGrid: false, folderId: 'datas' },
    { fieldName: 'hr_entrada',   property: 'hr_entrada',   label: 'Horário Entrada',   type: 'time',     order: 15, gridColumns: 4, visibleOnGrid: false, folderId: 'datas' },
    { fieldName: 'criado_em',    property: 'criado_em',    label: 'Criado em',         type: 'dateTime', order: 16, visibleOnForm: false, gridColumns: 6, folderId: 'datas' },
  ],
};

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [PoButtonModule, DyfFormComponent, DyfGridComponent, DyfDetailComponent],
  templateUrl: './demo.component.html',
})
export class DemoComponent {
  table = SAMPLE_TABLE;
  view: 'grid' | 'form' | 'detail' = 'grid';
  selectedItem: any = null;

  items = [
    { id: 1, nome: 'Maria Silva',    cpf: '12345678901', email: 'maria@email.com',  telefone: '11999990001', ativo: true,  departamento: 'eng',  cargo: 'Desenvolvedora Senior', salario: 12500,  carga_hr: 40, remoto: true,  obs: '',                         dt_admissao: '2022-03-01', dt_nascimento: '1990-05-14', hr_entrada: '09:00:00', criado_em: '2022-03-01T10:00:00' },
    { id: 2, nome: 'João Souza',     cpf: '98765432100', email: 'joao@email.com',   telefone: '11988880002', ativo: true,  departamento: 'prod', cargo: 'Product Manager',       salario: 15000,  carga_hr: 40, remoto: false, obs: 'Líder do squad Alpha',     dt_admissao: '2021-07-15', dt_nascimento: '1985-11-30', hr_entrada: '08:00:00', criado_em: '2021-07-15T08:30:00' },
    { id: 3, nome: 'Ana Pereira',    cpf: '11122233344', email: 'ana@email.com',    telefone: '11977770003', ativo: true,  departamento: 'fin',  cargo: 'Analista Financeira',   salario: 8500,   carga_hr: 44, remoto: false, obs: '',                         dt_admissao: '2023-01-10', dt_nascimento: '1995-02-20', hr_entrada: '08:00:00', criado_em: '2023-01-10T09:00:00' },
    { id: 4, nome: 'Carlos Mendes',  cpf: '55566677788', email: 'carlos@email.com', telefone: '11966660004', ativo: false, departamento: 'com',  cargo: 'Executivo de Contas',   salario: 9000,   carga_hr: 40, remoto: true,  obs: 'Afastado desde março/2025', dt_admissao: '2020-05-20', dt_nascimento: '1988-08-10', hr_entrada: '09:00:00', criado_em: '2020-05-20T14:00:00' },
    { id: 5, nome: 'Bruna Alves',    cpf: '99988877766', email: 'bruna@email.com',  telefone: '11955550005', ativo: true,  departamento: 'rh',   cargo: 'Coordenadora de RH',    salario: 10000,  carga_hr: 40, remoto: false, obs: '',                         dt_admissao: '2019-09-01', dt_nascimento: '1992-04-25', hr_entrada: '08:30:00', criado_em: '2019-09-01T08:00:00' },
  ];

  onEdit(row: any): void { this.selectedItem = { ...row }; this.view = 'form'; }
  onViewDetail(row: any): void { this.selectedItem = row; this.view = 'detail'; }
  onDelete(row: any): void { this.items = this.items.filter(i => i.id !== row.id); }

  onSave(value: any): void {
    const idx = this.items.findIndex(i => i.id === value.id);
    this.items = idx >= 0
      ? this.items.map(i => (i.id === value.id ? value : i))
      : [...this.items, { ...value, id: Date.now() }];
    this.view = 'grid';
  }

  newRecord(): void { this.selectedItem = {}; this.view = 'form'; }
  back(): void { this.view = 'grid'; }
}
