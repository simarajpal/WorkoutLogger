# WorkoutLogger

A beginner-friendly full-stack workout tracker project.

This repository is set up for:

- `frontend`: React app
- `backend`: Node.js + Express API
- `supabase`: database and auth-related files

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

This project allows users to log in with their email accounts, track the number of sets and reps for each of their workouts, modify/create/delete workouts.
Later features will include a chart to show strength improvement in different areas, use of AI to prioritize certain body parts based on strength stagnation, and rewards
based on reaching a certain PR with your friends.
