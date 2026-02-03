# Liquid Glass Calendar - Development Log

## Project Goal

Create a visually stunning "Liquid Glass" 3D web calendar with a premium Apple-like aesthetic, now fully localized for Korean users.

## Version 1.1.0 - "Notification & Mobile" Update

**Focus:** Mobile Experience (PWA), System Notifications, and Glass UI Polish.

### 1. Notification System

- **Real-time Alerts:** Integrated browser `Notification API` to alert users of upcoming events.
- **Glass Modal:** Replaced native alerts with a beautiful custom **Glass Modal** for in-app notifications.
- **Smart Polling:** Checks for events every minute and triggers alerts 10 minutes before and at the exact time.

### 2. PWA (Mobile App)

- **App-like Experience:** users can now "Add to Home Screen" on iOS/Android.
- **Manifest:** configured `manifest.json` with icons and display settings.
- **Icon:** Added placeholder icons for home screen.

### 3. UI Polish (Glassmorphism 2.0)

- **Glass Time Picker:** Replaced ugly number inputs with a custom **Glass Time Picker** (Quick Presets + Scrollable Roller).
- **Event Modal:** Complete redesign with better spacing, liquid buttons, and animations.
- **Test Button:** Added a visible "Test" button in the sidebar to verify permissions.

## Version 5.2 - "Robust & Refined" Update

**Focus:** Stability (Navigation), UI Consistency, and Code Cleanup.

### 1. 3D Liquid Glass Design System

- **Core Aesthetic:** Thick, volumetric glass effect with `backdrop-filter: blur`.
- **Background:** Animated mesh gradient.
- **Glass Modal:** Now uses `React Portal` to float perfectly in the center of the screen (z-index 1000).

### 2. Critical Bug Fixes

- **Month Navigation:**
  - Fixed the "Double Month Skip" bug occurring at end-of-month dates.
  - Implemented robust `new Date(y, m, 1)` construction logic to guarantee month-by-month precision without day overflow.
- **Layout:**
  - Corrected grid cell content limits.
  - Fixed bottom layout breakage in Calendar.

### 3. Korean Localization (한국어 패치)

- **Holidays (New):** Integrated Korean holidays (e.g., 설날, 추석, 삼일절). Dates are marked in **Red**.
- **Formatted Dates:** YYYY년 MM월 format with correct Hangul suffixes.

### 4. Feature Summary

#### A. Global Navigation & Sidebar

- **To-Do List:** Left Sidebar now handles all Todo needs (Daily Todo removed from right panel for clarity).
- **Fixed Sidebar:** Stays consistent while calendar changes.

#### B. Event Management

- **Central Glass Modal:**
  - Opens in center of screen.
  - Fields: Title, Description, Time (Hour/Min), All-Day.
  - "Liquid Glass" styling.
- **Grid Display Logic:**
  - **Header:** Date + Holiday (Red).
  - **Body:** "Todo Count" (if any) -> "Event Titles" (Max 3).
  - **Footer:** "Plan N+" overflow indicator.

#### C. Interactive Elements

- **Mood Tracking:**
  - **Digital Slider:** Horizontal scrolling glass slider for emotions.
  - **Custom Input:** Add any emoji instantly.

---

## To-Do List (Future Roadmap)

### Feature Expansion

- [ ] **Drag & Drop:** Move events between days.
- [ ] **Multi-Day Events:** Visual strip spanning multiple days.
- [ ] **Data Persistence:** Switch from localStorage to backend.

### Visual Polish

- [ ] **Themes:** Dark Mode / Light Mode toggle.
- [ ] **Weather API:** Connect to real OpenWeatherMap API.

## Tech Stack

- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Pure CSS (CSS Variables, Glassmorphism)
- **State:** LocalStorage + Custom Hooks
