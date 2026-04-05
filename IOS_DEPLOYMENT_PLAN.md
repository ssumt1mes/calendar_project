# iOS / TestFlight Conversion Plan

## Goal
Convert the existing React + Vite web calendar into an iOS app wrapper that can be built in Xcode and uploaded to TestFlight.

## Current status
- Web app builds successfully
- Unit tests pass
- PWA manifest exists
- No native iOS project existed before this plan

## Phase 1 - Enable native wrapper
- [x] Add Capacitor dependencies
- [x] Add `capacitor.config.ts`
- [ ] Generate iOS project
- [ ] Sync built web assets into iOS shell

## Phase 2 - Prepare app metadata
- [x] Ensure PWA icons exist
- [ ] Decide final bundle identifier
- [ ] Decide final app name / subtitle
- [ ] Prepare App Store icon set
- [ ] Add launch / splash assets if desired

## Phase 3 - Native behavior review
- [ ] Verify app opens correctly on iPhone simulator/device
- [ ] Check safe-area layout
- [ ] Replace browser-only notifications with native local notifications if needed
- [ ] Review Google auth flow on native iOS
- [ ] Add privacy strings / entitlements if native APIs are added

## Phase 4 - TestFlight release
- [ ] Open in Xcode
- [ ] Set team + signing
- [ ] Archive build
- [ ] Upload to App Store Connect
- [ ] Enable internal TestFlight testing

## Known risks
- Google OAuth may need native-compatible redirect handling depending on intended sign-in flow.
- Browser Notification API is not equivalent to native iOS notifications inside an app shell.
- LocalStorage works, but multi-device sync still does not exist.

## Recommended next engineering tasks
1. Add Capacitor iOS shell
2. Test launch on simulator
3. Evaluate Google login inside native WebView
4. Replace / augment notifications with Capacitor Local Notifications
5. Prepare signing and upload through Xcode
