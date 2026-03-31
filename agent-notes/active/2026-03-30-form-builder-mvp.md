# Form Builder MVP

## Session Metadata
- **Date:** 2026-03-30
- **Branch:** feat/form-builder-mvp
- **Base branch:** main
- **Status:** Pivoted from paid SurveyJS Creator to custom builder

## Objective and Scope

**Requested:** Build an MVP form builder app using SurveyJS in the monorepo at `apps/form-builder`.

**In scope:**
- Visual form builder/designer (SurveyJS Creator)
- Form preview/runner (SurveyJS form library)
- Save/load form definitions (localStorage)
- Dashboard listing saved forms
- Response collection and viewing

**Out of scope:** Server-side persistence, authentication, deployment, testing

## Implementation Log

### New app: `apps/form-builder`
- **Stack:** Next.js 15.4.11, React 19.2.1, TypeScript 5.7.3, SurveyJS 2.5.x
- **Port:** 3002 (avoids conflicts with track-record:3000, website)

### Initial MVP (commit 118bc20)
- Files created: package.json, next.config.mjs, tsconfig.json, storage.ts, layout, dashboard, builder, fill, responses pages
- Used `survey-creator-react` / `survey-creator-core` (paid license required)

### Pivot: Replace paid SurveyJS Creator with custom builder

**Reason:** `survey-creator-react` and `survey-creator-core` require a paid license (EUR500/year). Replaced with a custom-built form builder UI using only the free MIT-licensed `survey-core` and `survey-react-ui`.

**Removed packages:**
- `survey-creator-core`
- `survey-creator-react`

**Added packages:**
- `@dnd-kit/core@6.3.1` — drag-and-drop primitives
- `@dnd-kit/sortable@10.0.0` — sortable list support
- `@dnd-kit/utilities@3.2.2` — CSS transform utilities

**New files created:**
- `src/lib/question-types.ts` — registry of 12 supported question types with icons, labels, default props
- `src/lib/survey-schema.ts` — SurveyJS JSON schema helpers (create/parse/normalize)
- `src/components/FormBuilder.tsx` — main orchestrator: 3-column layout (palette | questions+properties | preview/JSON)
- `src/components/QuestionPalette.tsx` — sidebar with clickable question type buttons
- `src/components/QuestionList.tsx` — sortable question list with page tabs (add/delete pages)
- `src/components/SortableQuestion.tsx` — individual draggable question card with drag handle
- `src/components/PropertyEditor.tsx` — context-sensitive property panel (title, name, required, choices, input type, rating range, matrix rows/columns, HTML content, etc.)
- `src/components/FormPreview.tsx` — live preview using free `survey-react-ui` (read-only display mode)
- `src/components/JsonEditor.tsx` — raw JSON editor with apply/reset and error display

**Modified files:**
- `src/app/builder/[id]/page.tsx` — rewired to use custom FormBuilder instead of SurveyCreator
- `next.config.mjs` — removed creator transpile entries
- `package.json` — swapped paid deps for dnd-kit

**Supported question types:**
Text input, Long text, Radio group, Checkboxes, Dropdown, Yes/No (boolean), Rating, Ranking, Image picker, Matrix, Multiple text, HTML block

**Key decisions:**
- Three-panel layout: palette (left) | question list + property editor (center) | preview/JSON (right)
- Property editor is type-aware — shows relevant fields per question type (choices for multi-option, rows for textarea, rating range, matrix columns/rows, etc.)
- Preview uses `survey.mode = "display"` so respondents' view is shown without interactivity
- JSON tab allows direct schema editing with validation
- Multi-page support with tab-based page navigation

### Unchanged files:
- `src/app/page.tsx` (dashboard) — no changes needed
- `src/app/fill/[id]/page.tsx` (form runner) — already uses free `survey-react-ui`
- `src/app/responses/[id]/page.tsx` (response viewer) — no SurveyJS dependency
- `src/lib/storage.ts` — no changes needed

## Validation Log
- `pnpm install` — success (packages -2 net)
- `tsc --noEmit` — clean, no type errors
- `next build` — success, all routes compile

## Handoff

### Potential next steps:
- Add Tailwind CSS for better styling (could use `@repo/tailwind-config`)
- Server-side persistence (database or file-based)
- Form sharing via URL
- Export/import form definitions as JSON
- Unit tests with Vitest
- E2E tests with Playwright
- CLAUDE.md for the app
- Question duplication / copy-paste support
- Conditional logic (show/hide questions based on answers)
- Form theming / CSS customization
