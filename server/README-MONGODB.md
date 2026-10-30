# EchoMind backend — MongoDB Atlas edition

## What changed
- The server connects to MongoDB Atlas before it starts accepting requests.
- The existing API routes and response shapes are retained.
- Existing six data groups (`users`, `memories`, `accessGrants`, `auditLogs`, `chatMessages`, `passwordResetTokens`) are persisted in MongoDB.
- On a completely empty database, the existing demo account and demo memories are seeded once.
- The `.env` file is intentionally not included. Keep your own credentials private.

## Install and configure
1. Copy your existing `server/.env` into this folder (do not overwrite your working `.env` unless needed).
2. Confirm it contains `MONGODB_URI=...` and a strong `JWT_SECRET=...`.
3. From this folder run `npm install`.
4. Run `npm run dev` or `npm start`.
5. Wait for `MongoDB Atlas connected successfully!` and `EchoMind data loaded from MongoDB.` before opening the frontend.

## Demo login
Only when the Atlas database is completely empty, the seed data creates:
- Email: `demo@echomind.app`
- Password: `demo1234`

Use this only for local demonstration. Do not use the demo password for a real account.

## Important implementation note
This release uses a compatibility persistence layer to keep the current synchronous route logic/API compatible. It stores collection snapshots in MongoDB and waits for queued writes before sending API responses. It is suitable for the current single-instance prototype. Before deploying multiple backend instances or high concurrent traffic, replace it with direct asynchronous Mongoose model operations and add database indexes/transactions.

## Verify persistence
1. Register a test account in the app and create a test memory.
2. Stop the backend with Ctrl+C.
3. Start it again.
4. Log in with the same account; the test memory should still be present.

If MongoDB connection fails, check the private `.env` value, Atlas database user's password, and Atlas Network Access allowlist. Never paste your connection string or password into chat.
