# EchoMind — AI-Powered Digital Legacy Platform

Preserve memories. Share wisdom. Keep your story alive.

EchoMind is a hackathon prototype: a secure digital legacy vault where people
preserve memories, stories, and life lessons, control exactly who can access
them, and let authorized people interact with what's preserved through a
keyword-driven "EchoMind AI" assistant — clearly labeled as a reconstruction,
never a claim to be the actual person.

## What's public vs. private

- **Before login (landing page):** only aggregate, anonymized counters
  (e.g. "memories preserved") and static marketing content are shown. No
  memory content, profile data, or account information is ever exposed.
- **After login:** the Memory Vault, Timeline, EchoMind AI, Legacy Access,
  Audit Log, Legacy Profile, Export, and Settings — all scoped to the signed-in
  user's own data via JWT-protected API routes.

## Tech stack

- **Client:** React 18 + Vite, React Router, Tailwind CSS, Lucide icons, axios
- **Server:** Node.js + Express, JWT auth, bcrypt password hashing
- **Data:** in-memory store (`server/data/store.js`), seeded with a demo
  account and ~12 demo memories — structured so it can be swapped for
  MongoDB/Postgres later with minimal route changes
- **AI:** local keyword-based retrieval (`server/services/memorySearch.js`) —
  no external/paid API required, and the interface is designed so a real LLM
  call can be dropped in later without touching the routes

## Running locally / on Replit

```bash
npm run install:all   # installs server + client dependencies
npm run dev            # runs API on :5000 and Vite dev server on :5173 together
```

Vite proxies `/api/*` to the Express server (see `client/vite.config.js`), so
the client can be opened directly at the Vite dev URL.

Optionally copy `server/.env.example` to `server/.env` to set a custom
`JWT_SECRET`; a development default is used if you skip this.

## Demo account

Click **Explore Demo** on the landing page (or log in directly) with:

- Email: `demo@echomind.app`
- Password: `demo1234`

The demo account is pre-populated with 12 memories across every category and
media type, three Legacy Access grants (active, scheduled, and revoked), and
a running audit log.

## Suggested judge demo flow

Landing → Explore Demo → Dashboard → Memory Vault (try search/filter, switch
to Timeline view) → open a memory → EchoMind AI (ask a suggested question,
note the sources + disclosure) → Legacy Access (add/revoke a trusted person)
→ Audit Log → Export Legacy Archive.

## Important prototype disclosures

- EchoMind AI answers are explicitly labeled **"AI Reconstruction"** and the
  app always states: *"EchoMind AI is generating a reconstruction from
  preserved memories. It is not the actual person."*
- Event-based release conditions in Legacy Access are **simulated** — this
  prototype does not perform any real-world event or death verification.
