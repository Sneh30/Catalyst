<p align="center">
  <img src="docs/Logo.png" alt="Career OS Logo" width="220" />
</p>

<h1 align="center">Career OS</h1>

<p align="center">
  Your all-in-one career operating system — jobs, resume, content, and tracking in a single place.
</p>

## Features

- **Job Scanner** — search jobs across 15+ different job portals
- **Resume Auditor** — audit your resume against a target role
- **Resume Generator** — generate tailored resumes
- **Content Studio** — create career-related content
- **Weekly Tracker** — track your job-search progress week by week
- **Auth & Profiles** — register, log in, and manage your profile

## Screenshots

### Searching through 15 different job portals

![Working searching through 15 different job portals](docs/Working_searching_through_15_different_job_portals.png)

## Tech Stack

- **Frontend:** React (Vite), React Router, Axios
- **Backend:** FastAPI (Python), SQLite
- **Deployment:** Docker, Procfile

## Getting Started

```bash
# Backend (Python)
cd backend
python3 -m venv venv
venv/bin/pip install -r requirements.txt

# Frontend (Node)
cd ../frontend
npm install

# Run both
cd ..
./run.sh
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API docs: http://localhost:8000/docs
