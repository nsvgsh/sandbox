# LEADERBOARD-META — Add me rank and active players

## WHAT
Enhance leaderboard endpoint to return the requesting user's rank and a count of active players in a recent window.

## WHY
- Provide player context and scale without exposing PII

## ACCEPTANCE
- `GET /api/v1/leaderboard?top=K` returns `{ top, me: { userId, level, rank }, activePlayers }`.
