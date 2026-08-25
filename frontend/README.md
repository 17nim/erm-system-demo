# ERM System - Frontend

The frontend application for the Enterprise Risk Management (ERM) system, built with React, TypeScript, and Vite for high-performance development and production builds.

## Overview

This is a modern, type-safe React application that provides a user interface for managing enterprise risks, categories, divisions, and related metadata. It features real-time data visualization with heatmaps, risk management dashboards, and comprehensive settings management.

## Architecture & Tech Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite (for fast HMR and optimized builds)
- **Styling**: CSS with dark/light theme support
- **UI Components**: shadcn/ui (built on Radix UI)
- **State Management**: React Context API
- **HTTP Client**: Custom API layer for backend communication
- **Validation**: Zod schemas for form validation

### Directory Structure

```
src/
├── api/               # API endpoints and HTTP calls
├── components/        # React components
│   ├── layouts/      # Layout components
│   ├── routes/       # Route-specific components
│   ├── settings/     # Settings UI components
│   └── ui/           # Reusable UI elements
├── contexts/         # React Context for global state
├── lib/              # Utility libraries
├── pages/            # Page components
├── schemas/          # Zod validation schemas
└── utils/            # Helper functions
```

## Installation & Setup

### Prerequisites

- Bun 1.0+

### Install Dependencies

```bash
bun install
```

## Running the App

### Development Server

Start the development server with hot module replacement (HMR):

```bash
bun dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Build for Production

Create an optimized production build:

```bash
bun run build
```

The build output will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
bun run preview
```

### Linting & Type Checking

Run ESLint to check code quality:

```bash
bun run lint
```

## Component Naming Convention

We follow two naming conventions for components in this project:

- **kebab-case**: Used for components provided by shadcn/ui (which are built on top of Radix UI)
- **PascalCase**: Used for custom components that we create within the project

This helps distinguish between third-party UI primitives and our own higher-level or application-specific components.
