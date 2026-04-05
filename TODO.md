# Web Calendar TODO

## Current focus
Shared calendar polished toward a clean Toss-inspired UI, with Apple-like typography and visible sync readiness for two users.

## Done in this pass
- [x] Add a dedicated project checklist file (`TODO.md`) for ongoing implementation tracking.
- [x] Surface visible sync status in the left sidebar and right detail panel.
- [x] Show recent save/update timing so two users can understand whether todo check states were recently changed.
- [x] Improve sidebar visual hierarchy and typography for a cleaner, more product-like feel.
- [x] Keep build/tests green after UI and storage hook changes.

## Remaining high-value work
### Sync / shared usage
- [ ] Add real authenticated Supabase session flow instead of local-only fallback auth.
- [ ] Implement merge/conflict handling for simultaneous edits by two users on the same day.
- [ ] Add realtime subscription updates so remote changes appear without refresh.
- [ ] Track editor identity on todos/events (name/avatar), not only timestamps.
- [ ] Add explicit offline / retry / last remote sync indicators separate from local save state.

### Product polish
- [ ] Replace placeholder weather card with real weather data or hide when unavailable.
- [ ] Polish month cell density for heavy schedule days (chips, overflow drawer, better truncation).
- [ ] Add onboarding copy for shared calendar setup and invite flow.
- [ ] Improve mobile sheet transitions and right panel empty state.

### Quality
- [ ] Add tests for save-state UI and sync status rendering.
- [ ] Add tests around todo toggle timestamps and shared storage behavior.
- [ ] Add e2e coverage for login → create todo → toggle completion → create/edit event.
