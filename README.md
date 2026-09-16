# QueueLess — Healthcare Navigation Platform

Simple frontend demo for healthcare navigation with a beginner-friendly login flow.

## Run locally

```bash
npm install
npm start
```

Open: `http://localhost:3000`

## Demo login credentials

- Username: `demo`
- Email alternative: `demo@queueless.com`
- Password: `demo123`

## What the demo includes

- Login screen with client-side validation and error messages
- Protected main experience (hospital listing shown only after login)
- Searchable list of hospitals with specialist, availability, location, and consultation cost
- Logout support
- Login state persisted in `localStorage`

## Important security note

This authentication is **demo/prototype only**. It uses `localStorage` and client-side checks, which are **not secure for production**. Replace this with secure backend authentication, server-side session/token validation, and proper password handling before real deployment.
