# Project Structure Guide

This file explains what each folder is for in simple terms.

## Big Picture

Your app has three main parts:

1. `frontend` for the React user interface
2. `backend` for the Express server
3. `supabase` for database-related project files

If you remember just one idea, remember this:

- `frontend` shows things
- `backend` decides things
- `supabase` stores things

## Root Files

### `README.md`

This is the main overview of the whole project.

When someone opens your repo, this is the first file they should read.

### `.gitignore`

This tells Git which files and folders it should **not** track.

Examples:

- `node_modules/` because it is large and can be recreated
- `.env` because it usually contains private keys and secrets

## Frontend Folder

Path: `frontend/`

This folder will eventually contain your React app.

### `frontend/public/`

This is for static files that are served directly as-is.

Examples later:

- app icons
- images
- manifest files

### `frontend/src/`

This is the main working area of the React app.

Most of the code you write on the frontend will live here.

### `frontend/src/assets/`

This is for things like images, fonts, or other files used by the frontend.

### `frontend/src/components/`

This is for reusable UI pieces.

Examples later:

- navbar
- workout card
- form input

### `frontend/src/features/`

This is for code grouped by feature instead of by file type.

For example, one day you might have:

- `features/auth`
- `features/workouts`
- `features/profile`

This helps larger apps stay organized.

### `frontend/src/hooks/`

This is for custom React hooks.

Hooks are reusable functions that usually manage state or shared behavior.

### `frontend/src/lib/`

This is for small helper setup code used across the frontend.

Examples later:

- Supabase client setup
- utility helpers
- constants

### `frontend/src/pages/`

This is for full screen-level views.

Examples later:

- login page
- dashboard page
- workout history page

### `frontend/src/services/`

This is for code that talks to external systems.

Examples later:

- API calls to your backend
- auth-related request helpers

## Backend Folder

Path: `backend/`

This folder will eventually contain your Node.js + Express server.

### `backend/src/`

This is the main backend source code folder.

### `backend/src/config/`

This is for configuration code.

Examples later:

- environment variable setup
- app settings

### `backend/src/controllers/`

Controllers handle incoming requests and decide what response to send back.

A controller usually sits between the route and the deeper business logic.

### `backend/src/lib/`

This is for shared backend helpers.

Examples later:

- database clients
- utility functions

### `backend/src/middleware/`

Middleware runs in the middle of a request before it reaches the final controller.

Examples later:

- auth checks
- error handling
- logging

### `backend/src/routes/`

This is where API endpoints are grouped.

Examples later:

- workout routes
- auth routes
- user routes

### `backend/src/services/`

Services are where core business logic often lives.

Example idea:

- a service that calculates workout summaries
- a service that creates a workout record

This keeps routes and controllers cleaner.

### `backend/tests/`

This is for backend tests.

You may not use this right away, and that is okay. The folder is here so testing has a clear home later.

## Supabase Folder

Path: `supabase/`

This keeps Supabase-related project files organized in one place.

### `supabase/migrations/`

This is where database migration files can go later.

A migration is a saved change to your database structure, like:

- creating a `workouts` table
- adding a `profiles` table
- changing a column

## Why There Are Empty Folders

Some folders only contain `.gitkeep` right now.

That file exists for one simple reason:

- Git does not save empty folders by default

So `.gitkeep` is just a tiny placeholder that lets the folder exist in the repository until real files are added.

## What We Are Not Doing Yet

We are not yet:

- installing React
- creating Express routes
- connecting Supabase
- writing database tables
- building UI screens

That comes after the structure makes sense.

## Good Beginner Mental Model

When you are unsure where a file should go, ask:

1. Is this for what the user sees? Put it in `frontend`.
2. Is this for server logic or API behavior? Put it in `backend`.
3. Is this for database structure or Supabase setup? Put it in `supabase`.

That simple rule will carry you a long way.
