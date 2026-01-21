# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production (outputs to `dist/`)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Architecture

This is a Vite + React 19 project using JavaScript (JSX).

### Component Structure

Components follow a folder-per-component pattern:
```
src/components/ComponentName/
├── ComponentName.jsx  # Component logic
├── ComponentName.css  # Component styles
└── index.js           # Re-export for clean imports
```

Import components via the folder path: `import HelloWorld from './components/HelloWorld'`
