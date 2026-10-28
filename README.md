# LearnPath — AI-Powered Personalized Learning Platform

B.Tech IT major project (Group 2023-27/CSIT/2/29), AKGEC Ghaziabad.
Navya Mittal · Sakshi Shukla · Sarvesh Singh — guide: Ms. Ayushi.
The synopsis is in [docs/](docs/Personalized_Learning_Synopsis_v2.pdf).

| Part | Stack |
|---|---|
| `backend/` | FastAPI, SQLAlchemy 2, Alembic, PostgreSQL (SQLite for quick local runs) |
| `frontend/` | React 18, Vite, TypeScript, Tailwind, TanStack Query |

## Run everything with Docker

```bash
docker compose up --build
```

- Web app: http://localhost:5173
- API docs (Swagger): http://localhost:8000/docs

The API container applies migrations and loads the DSA seed content on start.

## Run without Docker

Backend (needs [uv](https://docs.astral.sh/uv/)); uses a local SQLite file by default:

```bash
cd backend
uv sync
uv run alembic upgrade head
uv run python -m app.seed
uv run uvicorn app.main:app --reload
```

Frontend (needs Node 20+), in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

## Tests

```bash
cd backend && uv run pytest
cd frontend && npm test
```

## Adding content

Subject content lives in `backend/app/seed/*.yaml`: topics, their prerequisites, resources and
questions. Write each question as one `correct` answer plus three `wrong` options; the loader
shuffles them. Run `uv run python -m app.seed` again after editing. It updates the existing rows
and rejects prerequisite cycles.

## Database changes

After changing a model in `backend/app/models/`:

```bash
uv run alembic revision --autogenerate -m "describe the change"
uv run alembic upgrade head
```

## Status

- [x] Repo skeleton, Docker Compose, CI
- [x] Auth (register / login / refresh / me) with student, instructor and admin roles
- [x] Subjects, topics with a prerequisite DAG, resources, question bank, and the DSA seed (16 topics, 48 questions)
- [x] React shell: login, register, protected home page with the topic roadmap
- [x] Onboarding wizard (goals, availability, formats, self-rating), diagnostic quiz with resume, level classification, initial topic mastery with explanations
- [x] Learning-event log, quiz and response storage (inputs for the ML layer)
- [ ] Learner model, path builder, recommender, scheduler
- [ ] Quizzes, gamification, dashboards
- [ ] ML layer, evaluation
