# Deploy Checklist

## Before deploy

- [ ] Copy `.env.example` to `.env.local` for local verification
- [ ] Confirm the intended production mode:
  - local-first only: no backend secrets required
  - Supabase sync: set `VITE_SYNC_PROVIDER=supabase` and fill the Supabase env values
  - Google Calendar: set `VITE_ENABLE_GOOGLE_CALENDAR=true` and provide `VITE_GOOGLE_CLIENT_ID`
- [ ] Run `npm run build`
- [ ] Run `npm run test -- --run`
- [ ] Review `SECURITY.md` and confirm the chosen auth/sync mode matches the deployment risk level

## Vercel

- [ ] Import the repo into Vercel
- [ ] Confirm framework/build settings:
  - framework preset: `Vite`
  - build command: `npm run build`
  - output directory: `dist`
- [ ] Add only the production env vars you need
- [ ] Deploy over HTTPS
- [ ] Do not commit or expose `.env.local` values through preview logs or screenshots

## PWA / iPhone checks

- [ ] Verify `manifest.json`, icons, and theme color load on the deployed site
- [ ] Open the deployed site in Safari on iPhone and test `Add to Home Screen`
- [ ] Launch from the home screen and confirm standalone presentation, safe-area spacing, and viewport behavior
- [ ] Verify notifications on target devices if you plan to advertise reminders
- [ ] Replace the current app icons with final brand assets before a public launch if needed

## Optional integration checks

- [ ] If Google Calendar is enabled, add the production domain to Google OAuth authorized origins
- [ ] If Google Calendar is enabled, verify disconnect/logout behavior on shared devices
- [ ] If Supabase is enabled, confirm the SQL schema/policies from `SUPABASE_SETUP.md` are applied
- [ ] If Supabase is enabled, verify a write on one device appears after refresh on another device
- [ ] If Supabase is enabled without Supabase Auth, confirm the deployment is still acceptable for personal MVP use only

## Known limitation

- [ ] Offline-first behavior is not implemented yet because the repo does not include a service worker
