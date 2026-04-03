# Hackathon Gandhi Nagar - Full-Stack Monorepo

A modern, scalable full-stack monorepo built with pnpm workspaces, Next.js, Express, and MongoDB.

## Tech Stack
- **Package Manager:** [pnpm](https://pnpm.io/)
- **Frontend:** Next.js 15 (App Router), Tailwind CSS, shadcn/ui
- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB (via Mongoose)
- **Shared:** Zod (Single Source of Truth for schemas & types)
- **API Docs:** Swagger UI (auto-generated from Zod schemas)

## Project Structure
- `/frontend`: Next.js application
- `/backend`: Express API server
- `/shared`: Shared Zod schemas and TypeScript types

## Setup & Installation

### 1. Prerequisites
Ensure you have Node.js (>=20.0.0) and pnpm (>=9.0.0) installed.

### 2. Install Dependencies
Run from the root directory:
```bash
pnpm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` in the root directory (already done for you if using the provided setup):
```bash
cp .env.example .env
```
Update the `MONGODB_URI` with your connection string.

### 4. Running the Project

#### Run all services in development mode:
```bash
pnpm dev
```

#### Run services individually:
- **Backend:** `cd backend && pnpm dev` (Runs at http://localhost:5000)
- **Frontend:** `cd frontend && pnpm dev` (Runs at http://localhost:3000)
- **Shared:** `cd shared && pnpm dev` (Watches for changes and compiles TS)

### 5. API Documentation
The Swagger UI is available at:
[http://localhost:5000/api-docs](http://localhost:5000/api-docs)

## Features
- **Shared Types:** Frontend and Backend share the exact same Zod schemas for validation and TypeScript interfaces.
- **Auto-generated Docs:** API documentation is automatically generated based on the Zod schemas in `@shared`.
- **Axios Configuration:** Centralized Axios instance in the frontend with environment-aware base URL.
- **Modular Backend:** Clean structure in the backend with modular controllers and routes.
- **Premium UI:** Custom-built UI components following shadcn design patterns for a premium look.

## Database Information
- **Database Name:** `hackathon_gandhinagar_testing`
- **URI:** Provided in the request and configured in `.env`
