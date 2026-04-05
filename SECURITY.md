# Security Notes

## Current trust boundaries

- The current login/register flow is browser-local convenience auth, not a production account system.
- Passwords are PBKDF2-hashed in the browser, but both user records and session state still live in `localStorage`.
- Anyone with script access in the same browser origin can read or tamper with that data. Treat it as demo-grade auth only.

## Calendar app guidance

- Do not use the local auth flow on shared or untrusted devices.
- Google Calendar access tokens should stay in memory only. This app does not persist them to `localStorage`.
- If you enable Google Calendar in production, restrict authorized JavaScript origins to the exact deployed domains.
- If you enable Supabase sync without Supabase Auth, your calendar slug becomes the practical access boundary. That is fine for personal MVP testing, not for real shared-account security.

## Deployment guidance

- Prefer HTTPS-only deployments.
- Keep `VITE_SUPABASE_ANON_KEY` and `VITE_GOOGLE_CLIENT_ID` in deployment env vars, not in committed local files.
- For real multi-user deployment, move auth to Supabase Auth and enforce authenticated RLS policies instead of anonymous shared-table access.

## OpenClaw operational note

- No app-side OpenClaw integration was found in this repo.
- If you use `openclaw system event` or similar CLI notifications during development/deploys, keep the message text free of secrets, tokens, user emails, or private calendar details because shell history and logs may retain it.
