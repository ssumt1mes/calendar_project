# iOS Release Checklist

This project is already wired for Capacitor iOS. The goal now is to ship it like a real iPhone app, not just a web deploy.

## What is already done in the repo

- Capacitor iOS project exists under `ios/`
- viewport-fit and safe-area CSS are enabled
- the app now uses native-shell CSS hooks when running inside Capacitor
- mobile layouts reserve space for the iPhone home-indicator area and dock
- iPhone orientation is restricted to portrait in `Info.plist`
- iOS UI is locked to light mode to match the app design
- README is now iOS-first instead of backend-migration-first

## Minimal human actions in Xcode

Do these in order.

### 1) Sync the web build into the native shell

```bash
npm install
npm run build
npm run cap:sync
npm run cap:open:ios
```

### 2) Open the `App` target in Xcode and set identity

In **Signing & Capabilities**:
- select your Apple Team
- confirm or change the Bundle Identifier
- enable **Automatically manage signing**

In **General**:
- set **Display Name** if you want something shorter on the home screen
- confirm **Version** and **Build**
- set deployment target appropriate for your device/testers

### 3) Add real app icons

In `Assets.xcassets > AppIcon`:
- replace the default/generated icons with a real iPhone app icon set
- use a clean square icon with enough padding so it looks native on iOS

### 4) Review launch/splash appearance

Open `LaunchScreen.storyboard` and verify:
- background color matches the app
- app name / logo looks correct
- no placeholder branding remains

### 5) Privacy manifest and App Store metadata readiness

Before TestFlight / App Store submission, confirm:
- privacy answers in App Store Connect match actual behavior
- if you add new native SDKs later, review whether a `PrivacyInfo.xcprivacy` file is required
- if notifications are shipped, describe their purpose clearly in review notes

### 6) Test on a real iPhone

Verify these exact items:
- launch screen appears correctly
- status bar area is clean and not clipped
- bottom dock clears the home indicator
- left/right drawers animate correctly
- keyboard does not hide critical inputs on login/forms
- scrolling feels stable with no white gaps or bounce glitches
- local notifications permission prompt works if used
- app resumes correctly after backgrounding

### 7) Archive and distribute

In Xcode:
- select a physical device or Any iOS Device
- **Product > Archive**
- open Organizer
- **Distribute App > TestFlight**

## Recommended but optional Xcode polish

These are not required for first TestFlight, but recommended:

- rename the displayed app from `Liquid Glass Calendar` to a shorter home-screen label if needed
- add alternate app accent color / branding assets
- add a privacy manifest file explicitly, even if minimal
- add push notification capability only if you really plan to ship push
- review supported iPad behavior if you want universal layout later

## What not to focus on right now

Not required for the current iPhone-native goal:

- Supabase migration
- multi-user sync architecture
- public web deployment polish
- shared-backend collaboration features

## If you only want the absolute minimum

Do just this:

1. `npm run cap:sync`
2. `npm run cap:open:ios`
3. set signing team
4. add proper app icon
5. verify version/build
6. run on iPhone
7. archive to TestFlight
