# DynaForm

## Visão Geral

DynaForm é uma ferramenta low-code/no-code para geração automática de interfaces CRUD a partir de dicionários JSON. A ferramenta interpreta definições de campos e monta automaticamente telas de listagem, edição e visualização.

## Stack Tecnológica

- **Framework:** Angular
- **UI Library:** [PO-UI](https://po-ui.io/)
- **Inspiração:** [PO-UI Dynamic Form](https://po-ui.io/tools/dynamic-form)

## Conceito Principal

A aplicação recebe um dicionário de campos (JSON) — seja de um backend ou hardcoded — e renderiza automaticamente:

- Tela de **listagem** (grid/tabela)
- Tela de **edição** (formulário)
- Tela de **visualização** (detalhes)

## Estrutura de Dados

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `DYF_TABLES` | Cadastro das tabelas/entidades gerenciadas |
| `DYF_FOLDER` | Agrupamento/organização de campos (abas, seções) |
| `DYF_FIELDS` | Definição dos campos com todas as propriedades |

### Propriedades Configuráveis

- Ordem dos campos
- Tamanho e layout (grid system)
- Tipo de componente (input, select, date, etc.)
- Validações
- Máscaras
- Visibilidade condicional
- E demais recursos do PO-UI

## Distribuição

### Formato: Angular Library

```
dynaform/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   ├── services/
│   │   └── models/
│   └── public-api.ts
├── package.json
└── ng-package.json
```

### Publicação

- **npm público** — para projetos open-source
- **npm privado** — para uso interno corporativo
- **npm link** — para desenvolvimento local

### Uso em Projetos

```bash
npm install dynaform
# ou
npm install @sua-org/dynaform
```

```typescript
import { DynaFormModule } from 'dynaform';

@NgModule({
  imports: [DynaFormModule]
})
export class AppModule { }
```

## Vantagens

- **Reutilização real** entre múltiplos projetos
- **Versionamento independente** da lib
- **Padronização** de interfaces CRUD
- **Produtividade** — menos código repetitivo
- **Manutenibilidade** — correções e melhorias centralizadas

## Roadmap

1. [x] Definir estrutura completa das tabelas DYF_*
2. [x] Criar componentes base da library
3. [x] Implementar renderização dinâmica de formulários
4. [x] Implementar tela de listagem dinâmica
5. [x] Implementar tela de visualização dinâmica
6. [x] Criar interface de cadastro do dicionário
7. [ ] Publicar primeira versão no npm
8. [x] Documentação e exemplos de uso
