# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DynaForm is an Angular **library** (`projects/dynaform`) that auto-generates CRUD interfaces (form, grid, detail) from a JSON field dictionary. It uses [PO-UI](https://po-ui.io/) as the UI component library. The repo also contains a demo app (`projects/dynaform-demo`) for local development and testing.

## Commands

```bash
# Dev server (runs the demo app)
ng serve
# or
npm start

# Build the library
ng build dynaform

# Build the demo app
ng build dynaform-demo

# Run tests
ng test               # all projects
ng test dynaform      # library only
ng test dynaform-demo # demo only

# Watch build
npm run watch

# Scaffold (use prefix dyf for library components)
ng generate component --project=dynaform components/my-component
```

## Architecture

### Workspace structure

This is an Angular CLI **multi-project workspace** with two projects:

| Project | Path | Purpose |
|---------|------|---------|
| `dynaform` | `projects/dynaform/` | The published Angular library (built with ng-packagr) |
| `dynaform-demo` | `projects/dynaform-demo/` | Standalone demo app that consumes the library |

### Core data model (`projects/dynaform/src/lib/models/`)

- **`DyfTable`** — root object; holds `id`, `label`, optional `endpoint`, `fields[]`, and optional `folders[]`
- **`DyfField`** — describes one field: `property`, `label`, `type` (`DyfFieldType`), `gridColumns`, visibility flags (`visibleOnGrid`, `visibleOnForm`, `visibleOnDetail`), validation, options, mask, etc.
- **`DyfFolder`** — grouping/tab container; fields reference their folder via `folderId`

### Components (`projects/dynaform/src/lib/components/`)

All three components are **standalone** and take a `DyfTable` as a required `@Input()`:

| Selector | Component | Purpose |
|----------|-----------|---------|
| `<dyf-form>` | `DyfFormComponent` | Edit/create form using `PoDynamicFormComponent` |
| `<dyf-grid>` | `DyfGridComponent` | Listing table using `PoTableModule` |
| `<dyf-detail>` | `DyfDetailComponent` | Read-only detail view |

- `DyfFormComponent` emits `save` (form value) and `cancel`
- `DyfGridComponent` emits `edit`, `delete`, and `view` (row object)

### Service (`DyfFormBuilderService`)

`providedIn: 'root'` service that:
- Filters and sorts fields by visibility flags (`getFormFields`, `getGridFields`, `getDetailFields`)
- Maps `DyfFieldType` → PO-UI column type (`mapToPoColumnType`)
- Builds `PoTableColumn[]` from a `DyfTable` (`buildPoTableColumns`)

### Public API

Everything exported from `projects/dynaform/src/public-api.ts` is the library's public surface: all models, the service, and the three components.

### Demo app conventions

- `app.component.ts` defines a `SAMPLE_TABLE` constant and manages `view: 'grid' | 'form' | 'detail'` state locally
- The demo app imports library components directly from the `dynaform` path alias (set up in tsconfig)
- PO-UI must be registered globally in `app.config.ts` via `importProvidersFrom(PoModule, PoTemplatesModule)`

## PO-UI integration notes

- Component prefix for the library is `dyf` (set in `angular.json`)
- PO-UI `gridColumns` uses a 1–12 column system matching Bootstrap-style layout
- `PoDynamicModule` / `PoDynamicFormComponent` is used in `dyf-form` to render fields dynamically from a `PoDynamicFormField[]` array
- Type mapping: `boolean → 'boolean'`, `date → 'date'`, `currency → 'currency'`, `number → 'number'`, everything else → `'string'`
