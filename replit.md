# Workspace

## Overview

LandMate — AI-powered Ghana Lands Commission citizen guide. Helps Ghanaian citizens understand land documents, detect fraud risks, navigate GLC processes, and fill official forms. Powered by Claude AI.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 19 + TypeScript + Vite + React Router DOM + shadcn/ui + react-icons
- **API framework**: Express 5
- **AI**: Anthropic Claude (claude-sonnet-4-6) via Replit AI Integrations
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (ESM bundle)

## Color Theme

- **Primary**: Forest Green (#1B4F2A equivalent — HSL 137 49% 21%)
- **Secondary/Accent**: Gold (HSL 46 65% 52%)
- **Design**: Clean, professional, civic/government-grade

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── landmate/           # React + Vite frontend (LandMate app)
│   └── api-server/         # Express API server with Claude integration
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   └── integrations-anthropic-ai/  # Anthropic AI integration package
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## LandMate Features

### 4 Analysis Modes
1. **Explain My Document** (Template A) — Plain-language summary, key points, important dates, next steps
2. **Check for Red Flags** (Template B) — Fraud detection, risk assessment, severity-rated flags
3. **Guide Me Through a Process** (Template C) — Step-by-step GLC process guidance
4. **Help Me Fill a Form** (Template D) — Field-by-field form completion guidance

### Document Support
- PDF upload (text extraction via pdf-parse backend)
- Plain text paste
- Document type auto-detection (indenture, titleDeed, lease, glcForm, unknown)

### Results View (4 tabs)
- **Results**: Summary, Key Points, Important Dates
- **Red Flags**: Risk score, color-coded flag cards (HIGH/MEDIUM/LOW)
- **Next Steps**: Numbered guide with connecting timeline
- **Ask LandMate**: Multi-turn chat Q&A with document context

### Languages Supported
- English, Twi (Akan), Pidgin English

### GLC Process Selector
12 GLC processes in 4 categories: Ownership & Registration, Document & Stamping, Special Land Types, Disputes & Corrections

## API Endpoints

All at `/api/landmate/`:
- `POST /extract-text` — Upload PDF/file, get extracted text (uses multer + pdf-parse)
- `POST /analyze` — Document explanation or red flag detection
- `POST /process-guidance` — Step-by-step GLC process guide
- `POST /form-assistance` — GLC form field-by-field guidance
- `POST /chat` — Multi-turn Q&A chat with document context

## Claude Prompt Templates

Located in `artifacts/api-server/src/prompts/templates.ts`:
- Template A: Document explanation (XML-structured response)
- Template B: Red flag detection (XML-structured response)
- Template C: Process guidance (XML-structured response)
- Template D: Form assistance (XML-structured response)
- Template E: Contextual Q&A chat

## Session Management

- No login required (anonymous sessions)
- All data stored in React context (not persisted)
- "New Session" button clears all state

## Routing

Pages (React Router DOM):
- `/` — Home/Landing
- `/mode` — Mode Selector + Language picker
- `/upload` — Document Upload
- `/process` — Process Selector
- `/processing` — Loading/Processing screen
- `/results` — Results View with tabs

## Running

- Frontend: `pnpm --filter @workspace/landmate run dev`
- Backend: `pnpm --filter @workspace/api-server run dev`
- Codegen: `pnpm --filter @workspace/api-spec run codegen`
