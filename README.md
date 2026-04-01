# CodeClarity

CodeClarity is an AI-powered programming assignment evaluation platform built for academic use. It helps instructors create structured coding assignments and gives students detailed, requirement-based feedback instead of a simple pass/fail result.

## Live Demo

- Frontend: [https://code-clarity-six.vercel.app/login](https://code-clarity-six.vercel.app/login)
- Backend API: [https://codeclarity-api.onrender.com](https://codeclarity-api.onrender.com)

Note: The backend is deployed on Render free tier, so cold starts may cause the first request to take a little longer after inactivity.

## What It Does

### For Students
- View published programming assignments
- Solve problems in Python, JavaScript, Java, or C++
- Submit code and receive requirement-level evaluation
- See scores, test-case results, and requirement breakdowns
- Get AI-generated hints for failed requirements
- Track progress, submissions, leaderboard rank, and score trends

### For Instructors
- Create assignments with weighted requirements
- Add sample and hidden test cases
- Publish assignments to students
- Review student performance and analytics
- Inspect score distributions and common error patterns

## Key Features

- JWT authentication with role-based access control
- Multi-language code submission workflow
- Requirement-based scoring instead of binary verdicts
- AI-powered hint generation and code analysis
- Student analytics and instructor dashboards
- Asynchronous evaluation architecture for local development
- Free demo deployment using Vercel + Render

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Monaco Editor
- Recharts
- Axios

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- Redis / Key Value
- Celery
- bcrypt
- JWT auth

### AI / Evaluation
- Groq API for code analysis and hints in the current deployed version
- Docker-based local execution engine in development

## Architecture

The project uses a split frontend/backend deployment:

- `frontend/` is deployed on Vercel
- `backend/` is deployed on Render
- PostgreSQL is provisioned on Render
- Key Value storage is provisioned on Render

For free demo deployment, the backend supports a demo mode that can run without a dedicated Celery worker.

## Project Structure

```text
CodeClarity/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── workers/
│   ├── alembic/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
└── render.yaml
```

## Local Setup

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd CodeClarity
```

### 2. Backend setup

Create `backend/.env` from `backend/.env.example` and provide real values.

Example:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/codeclarity
SECRET_KEY=replace-with-a-strong-secret
REDIS_URL=redis://localhost:6379
GROQ_API_KEY=your_key_here
GROQ_MODEL=llama-3.1-8b-instant
DEMO_MODE=false
USE_CELERY=true
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Install dependencies and run:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Frontend setup

Create `frontend/.env` from `frontend/.env.example`.

Example:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Run:

```bash
cd frontend
npm install
npm run dev
```

### 4. Optional local infra

Use Docker Compose for local Postgres/Redis setup:

```bash
docker compose up -d
```

## Demo Deployment Notes

The deployed demo uses a simplified free-tier setup:

- Vercel for frontend hosting
- Render web service for FastAPI
- Render Postgres for database
- Render Key Value for cache/queue-compatible infrastructure
- `DEMO_MODE=true`
- `USE_CELERY=false`

This avoids needing a paid always-on worker service while still keeping the product usable for demonstrations.

## Why This Project Matters

Most coding platforms return only pass/fail results. CodeClarity is designed to be more educational:

- students see which requirements they met or missed
- instructors can define weighted expectations
- feedback is more actionable and closer to real academic evaluation

## Future Improvements

- stronger deployment hardening
- better accessibility polish
- exportable reports and analytics refinement
- cleaner production worker architecture
- optional local AI mode with Ollama

## Author

Nitya Thaker  
- LinkedIn: [https://linkedin.com/in/nityathaker](https://linkedin.com/in/nityathaker)
- GitHub: [https://github.com/NityaThaker](https://github.com/NityaThaker)
