# NLW Agents – AI Q&A from Recorded Classes

An end-to-end app to record short audio snippets from a class, transcribe them with Google Gemini, store embeddings in Postgres with pgvector, and answer users’ questions grounded by the recorded content.

## Tech Stack

- Server
  - Fastify (TypeScript with native `--experimental-strip-types` via tsx)
  - Drizzle ORM (Postgres)
  - Postgres + pgvector extension
  - Zod (validation)
  - Google Gemini SDK (`@google/generative-ai`)
- Web
  - React + Vite
  - React Router
  - React Hook Form + Zod
  - TanStack Query
  - Tailwind CSS

## Architecture Overview

- Users create “rooms” for a class.
- Audio is recorded in the browser in 5s chunks and uploaded to the API.
- The API transcribes audio with Gemini and stores: transcription and vector embedding.
- When a question is asked, the API embeds the question, retrieves top similar chunks by vector similarity, and asks Gemini to answer using only those chunks as context.

## Monorepo Structure

```
NLW/
  server/  # Fastify API + Postgres (Drizzle ORM)
  web/     # React app (Vite)
```

## Prerequisites

- Node.js 20+
- Docker + Docker Compose (for Postgres + pgvector)
- A Google AI Studio API key with access to `gemini-2.5-flash` and `text-embedding-004`

## 1) Backend (server)

Path: `server/`

### Environment

Create `server/.env`:

```
PORT=3333
DATABASE_URL=postgresql://docker:docker@localhost:5432/agents
GOOGLE_API_KEY=your_google_api_key
```

### Start Database

```
cd server
docker compose up -d
```

If Docker isn’t running, start it first (Docker Desktop or your distro’s service).

### Install deps and run migrations

```
npm install
npm run db:migrate
# optional
npm run db:seed
```

### Run the API

```
npm run dev
```

The API will be available at `http://localhost:3333`.

### Main Endpoints

- GET `/health` → health check
- GET `/rooms` → list rooms with `questionsCount`
- POST `/rooms` → create room
  - body: `{ name: string, description?: string }`
  - returns: `{ roomId: string }`
- GET `/rooms/:roomId/questions` → list questions for a room
- POST `/rooms/:roomId/questions` → ask a question
  - body: `{ question: string }`
  - returns: `{ questionId: string, answer: string | null }`
- POST `/rooms/:roomId/audio` → upload audio chunk (multipart/form-data, field `file`)
  - returns: `{ chunkId: string }`

## 2) Frontend (web)

Path: `web/`

```
cd web
npm install
npm run dev
```

The app runs on `http://localhost:5173` and talks to the API at `http://localhost:3333`.

### Key Screens

- Create Room: create a new class room.
- Record Audio: records and uploads 5s audio snippets to the server.
- Room Q&A: ask questions; answers are generated from your recorded content.

## How It Works (AI)

Server uses `@google/generative-ai`:

- Transcription: `gemini-2.5-flash` with inline audio data.
- Embeddings: `text-embedding-004` for pgvector storage (dim=768).
- Answering: prompt constrained to retrieved transcriptions.

## Common Issues

- Docker daemon not running → start Docker before `docker compose up -d`.
- Missing `GOOGLE_API_KEY` → create `.env` as above.
- Model access → ensure your key is allowed to use the listed models.

## Scripts

In `server/`:

- `npm run dev` → start Fastify in dev mode
- `npm run db:migrate` → apply migrations
- `npm run db:seed` → seed sample data (optional)

In `web/`:

- `npm run dev` → start Vite dev server
- `npm run build` → build for production
- `npm run preview` → preview production build

---

⭐ **Star this repository if you found it helpful!**

###### Built with ❤️ by Ana - 2025