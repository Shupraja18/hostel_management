# HostelCare — Hostel Complaint Management System

A full-stack hostel complaint management app with separate **Student** and
**Warden** portals. Students report issues and track their status; wardens
see every complaint in one place, update its status, and leave a note for
the student.

## Features

- Separate login/registration for students, separate login for wardens (a
  warden account can't be self-registered — see [Creating a warden](#creating-a-warden-account))
- JWT-based authentication, passwords hashed with bcrypt
- Students: submit complaints (category, priority, description), track
  status live, see the warden's reply
- Wardens: see every complaint, filter by status, update status, leave a
  note, delete a complaint
- Live stats (total / pending / in progress / completed) on both dashboards
- Toast notifications and confirm dialogs instead of browser `alert()`
- Responsive layout, animated transitions, one consistent design system

## Tech Stack

- **Backend:** Node.js, Express 5, MongoDB (Mongoose), JWT, bcryptjs
- **Frontend:** Plain HTML/CSS/JS (no build step) — served as static files
  by Express

## Project Structure

```
hostel_management/
├── server.js                 # Express app entry point
├── seed.js                   # Seeds demo student + warden + sample complaints
├── package.json
├── .env.example               # Copy to .env and fill in your own values
│
├── middleware/
│   ├── auth.js                # JWT verification
│   └── role.js                # Role-based access guards
│
├── models/
│   ├── User.js                 # Student / warden accounts
│   └── Complaint.js            # Complaints
│
├── routes/
│   ├── auth.js                 # /api/auth/*  (register, login, /me)
│   └── complaints.js           # /api/complaints/*
│
└── public/                     # Everything below is served statically
    ├── index.html               # Landing page
    ├── student/
    │   ├── login.html
    │   ├── register.html
    │   └── dashboard.html
    ├── warden/
    │   ├── login.html
    │   └── dashboard.html
    ├── css/
    │   ├── theme.css            # Shared design tokens, toasts, modals, animations
    │   ├── style.css            # Landing page
    │   ├── auth.css             # Login / register pages
    │   └── dashboard.css        # Both dashboards
    └── js/
        ├── api.js                # Fetch wrapper + token/user storage
        ├── auth.js                # Login/register helpers, redirect-if-logged-in
        ├── ui.js                  # Toast notifications, confirm modal, animation helpers
        ├── student.js              # Student dashboard logic
        └── warden.js                # Warden dashboard logic
```

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env` and adjust as needed:

   ```bash
   cp .env.example .env
   ```

   ```
   MONGO_URI=mongodb://127.0.0.1:27017/hostel_management
   PORT=5000
   JWT_SECRET=replace_this_with_a_long_random_string
   ```

   You need a running MongoDB instance — either locally or a free
   [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (update
   `MONGO_URI` to its connection string).

3. **Seed demo data (optional but recommended)**

   ```bash
   npm run seed
   ```

   This creates one demo student, one demo warden, and a few sample
   complaints. Credentials are printed to the console when it finishes —
   see below.

4. **Run the app**

   ```bash
   npm run dev     # with nodemon (auto-restart on changes)
   # or
   npm start       # plain node
   ```

   Then open **http://localhost:5000**.

## Demo Credentials (after seeding)

| Role    | Email                     | Password    |
|---------|---------------------------|-------------|
| Student | student@hostelcare.com    | student123  |
| Warden  | warden@hostelcare.com     | warden123   |

## Creating a Warden Account

There's intentionally no public "warden sign-up" page — a hostel doesn't
want random visitors registering themselves as staff. To add a warden,
either:

- Run `npm run seed` (creates the demo warden above), or
- Insert a user document directly with `role: 'warden'` and a bcrypt-hashed
  password (see `seed.js` for the exact pattern), or
- Add your own small admin script based on `seed.js` if you need this
  regularly.

## Notes on the Rebuild

This project was reviewed and repaired from an earlier version. The main
issues fixed:

- The student dashboard script referenced element IDs that didn't exist in
  the HTML, which threw an error on page load and silently broke the
  entire page (no complaints loaded, the form never worked).
- `showComplaintForm()` / `hideComplaintForm()` were called from the HTML
  but were never defined.
- The warden dashboard's HTML used classes (`.sidebar`, `.stats-grid`,
  `.warden-complaint-card`, etc.) that had no matching CSS at all.
- The landing page (`index.html`) used classes like `.nav-btn` and
  `.hero-buttons` that didn't exist in `style.css` — the stylesheet was
  written for a different, more elaborate layout that was never built.
- `seed.js` tried to create a complaint with `status: 'Resolved'`, which
  isn't a value the `Complaint` schema allows (`Pending` / `In Progress`
  / `Completed`) and would crash the seed script.
- `redirectLoggedInUser()` existed but was never called, so a logged-in
  user could still land back on the login page.

All of the above are fixed, and the whole frontend now shares one design
system (`theme.css`) with consistent colors, fonts, toast notifications,
and confirm dialogs in place of `alert()` / `confirm()`.
