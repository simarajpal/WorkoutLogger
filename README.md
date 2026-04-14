# WorkoutLogger

A beginner-friendly full-stack workout tracker project.

This repository is set up for:

- `frontend`: React app
- `backend`: Node.js + Express API
- `supabase`: database and auth-related files

Right now, this project is only focused on **Step 1: folder structure**.
There is no app logic yet on purpose.

## Why This Structure?

In a full-stack app, the frontend and backend usually grow in different ways:

- The frontend handles screens, buttons, forms, and user interactions.
- The backend handles API routes, server logic, and communication with the database.
- Supabase handles your hosted database and authentication, but it still helps to keep related project files organized locally.

Keeping these parts separated early makes the project easier to understand, debug, and expand later.

## Project Tree

```text
WorkoutLogger/
├── README.md
├── .gitignore
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── services/
│   └── tests/
├── docs/
│   └── PROJECT_STRUCTURE.md
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── features/
│       ├── hooks/
│       ├── lib/
│       ├── pages/
│       └── services/
└── supabase/
    └── migrations/
```

## What Each Top-Level Folder Does

### `frontend/`

This is where your React app will live.

You can think of it as the part users actually see and click on in the browser.

### `backend/`

This is where your Express server will live.

Its job will be to receive requests, run server-side logic, and send data back to the frontend.

### `supabase/`

This folder is for local project files related to Supabase, especially database changes like SQL migrations.

Even though Supabase is cloud-hosted, keeping related files in your repo helps you stay organized.

### `docs/`

This is a simple place for notes and project explanations.

As a beginner, having a docs folder is useful because you can write down decisions, questions, and setup steps as you learn.

## What To Read Next

Open [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) for a step-by-step explanation of every folder.

## Step 1 Status

The folder structure is now ready.

The next session can be about scaffolding the React app and Express server inside these folders, but we are intentionally not doing that yet.
