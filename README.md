# Vivian Sibanda Tutoring Management Platform

This project is a responsive full-stack tutoring management system designed for Vivian Sibanda and includes:

- Public website and booking flow
- Student, tutor, and super-admin roles
- SQLite-backed database with role-aware access control
- Dashboard views for different user roles
- Assessment and progress recording
- Message and notification basics
- Secure session-based authentication

## Project structure

- `server.js` – main Express application
- `db.js` – database creation and schema setup
- `views/` – EJS templates for homepage, dashboards, booking, and auth pages
- `public/` – CSS and JavaScript assets
- `data/` – SQLite database files
- `.env.example` – environment configuration template

## Local setup

1. Install Node.js 18+ on your machine.
2. From this folder, run:

```bash
npm install
cp .env.example .env
```

3. Update the values in `.env` before starting the app.
4. Start the development server:

```bash
npm run dev
```

5. Open http://localhost:3000

## Demo access

- Admin: `viviansb3@gmail.com` / `ChangeMe123!`
- Tutor: `tutor@example.com` / `Tutor123!`
- Student: `student@example.com` / `Student123!`

## Notes

This version is structured as a real backend application, but the environment in this workspace does not currently have Node/NPM available, so I could not run the app here. The code is prepared for local deployment once Node is installed.
