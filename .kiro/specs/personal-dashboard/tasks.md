# Implementation Plan: Personal Dashboard

## Overview

Build a single-page personal dashboard using HTML, CSS, and Vanilla JavaScript. All logic lives in `js/app.js`, all styles in `css/styles.css`, and the entry point is `index.html`. State is persisted exclusively via `localStorage` through a `StorageHelper` module.

## Tasks

- [x] 1. Scaffold project structure
  - Create `index.html` with semantic layout: header (theme toggle), main grid (greeting, timer, todo, quick links)
  - Create `css/styles.css` with CSS custom properties for light/dark theming (`data-theme` on `<html>`)
  - Create `js/app.js` with a `DOMContentLoaded` entry point and empty module stubs
  - _Requirements: 9.3_

- [x] 2. Implement StorageHelper
  - [x] 2.1 Write `StorageHelper` with `get(key, fallback)` and `set(key, value)` methods
    - `get`: `JSON.parse` wrapped in `try/catch`; returns `fallback` on any error
    - `set`: `JSON.stringify` wrapped in `try/catch`; logs `console.warn` and shows a non-blocking banner on failure
    - _Requirements: 8.1, 8.2, 8.3_
  - [ ]* 2.2 Write property test for StorageHelper round-trip
    - **Property 4 (partial): saveName round-trip — `StorageHelper.set` then `StorageHelper.get` returns same value**
    - **Validates: Requirements 8.1, 8.2**
  - [ ]* 2.3 Write unit test: StorageHelper returns fallback when localStorage throws
    - **Validates: Requirements 8.3**

- [x] 3. Implement ThemeManager
  - [x] 3.1 Write `ThemeManager` with `init()`, `toggle()`, `apply(theme)`, and `save(theme)` methods
    - `init`: reads `pd_theme` via `StorageHelper` (default `"light"`), calls `apply()`
    - `apply`: sets `document.documentElement.setAttribute("data-theme", theme)`
    - `toggle`: flips current theme, calls `apply()` and `save()`
    - Wire toggle button in `index.html` to `ThemeManager.toggle()`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  - [ ]* 3.2 Write property test for theme persistence round-trip
    - **Property 17: `fc.constantFrom("light","dark")` → `apply()` → storage and `data-theme` match**
    - **Validates: Requirements 7.3, 7.4**
  - [ ]* 3.3 Write unit tests for ThemeManager
    - Test: toggle applies correct `data-theme` attribute (Req 7.2)
    - Test: defaults to `"light"` with no stored preference (Req 7.5)

- [x] 4. Implement GreetingWidget
  - [x] 4.1 Write time and date formatting helpers
    - `formatTime(date)` → `HH:MM` string (zero-padded)
    - `formatDate(date)` → string containing day-of-week, month name, and day number
    - `getGreeting(hour)` → `"Good morning"` [5–11] | `"Good afternoon"` [12–17] | `"Good evening"` [18–23, 0–4]
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [ ]* 4.2 Write property test for time format
    - **Property 1: `fc.date()` → `formatTime()` → matches `/^\d{2}:\d{2}$/`**
    - **Validates: Requirements 1.1**
  - [ ]* 4.3 Write property test for date format
    - **Property 2: `fc.date()` → `formatDate()` → contains day name, month name, day number**
    - **Validates: Requirements 1.2**
  - [ ]* 4.4 Write property test for contextual greeting
    - **Property 3: `fc.integer({min:0, max:23})` → `getGreeting()` → correct string**
    - **Validates: Requirements 1.3, 1.4, 1.5**
  - [x] 4.5 Write `GreetingWidget` with `init()`, `render()`, and `saveName(name)` methods
    - `init`: reads `pd_name` from storage, calls `render()`, starts `setInterval(render, 60_000)`
    - `render`: updates time, date, and greeting text in DOM; appends name if non-empty
    - `saveName`: trims input, writes to `pd_name` via `StorageHelper`, calls `render()`
    - Wire name input and submit button in HTML
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_
  - [ ]* 4.6 Write property test for name persistence round-trip
    - **Property 4: `fc.string({minLength:1})` → `saveName()` → storage round-trip + greeting contains name**
    - **Validates: Requirements 2.2, 2.3, 2.4**

- [x] 5. Implement FocusTimer
  - [x] 5.1 Write `formatSeconds(s)` helper
    - Converts integer seconds [0, 5999] to `MM:SS` zero-padded string
    - _Requirements: 3.1_
  - [ ]* 5.2 Write property test for timer display format
    - **Property 5: `fc.integer({min:0, max:5999})` → `formatSeconds()` → matches `/^\d{2}:\d{2}$/`**
    - **Validates: Requirements 3.1**
  - [x] 5.3 Write `FocusTimer` with `init()`, `start()`, `stop()`, `reset()`, `tick()`, `complete()`, and `render()` methods
    - `init`: reads no persisted timer state (timer always resets on reload); defaults to 25 × 60 seconds; renders
    - `start`: sets `setInterval(tick, 1000)`; disables start button
    - `stop`: clears interval; preserves remaining time
    - `reset`: clears interval; restores `remaining` to session duration; renders
    - `tick`: decrements `remaining`; renders; calls `complete()` at 0; clamps to 0 to prevent negatives
    - `complete`: clears interval; shows notification banner "Session complete!"
    - Wire start/stop/reset buttons in HTML
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  - [ ]* 5.4 Write property test for timer reset
    - **Property 6: `fc.integer({min:60, max:5999})` → start + N ticks + reset → remaining === duration**
    - **Validates: Requirements 3.5**
  - [ ]* 5.5 Write unit tests for FocusTimer
    - Test: defaults to 25:00 with no stored duration (Req 3.2)
    - Test: starts counting down after `start()` (Req 3.3)
    - Test: pauses after `stop()` (Req 3.4)
    - Test: fires completion notification at 00:00 (Req 3.6)

- [x] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement TodoList
  - [x] 7.1 Write `TodoList` with `init()`, `addTask(text)`, `editTask(id, newText)`, `toggleTask(id)`, `deleteTask(id)`, `isDuplicate(text, excludeId?)`, `save()`, and `render()` methods
    - `init`: loads `pd_tasks` array via `StorageHelper` (default `[]`); guards with `Array.isArray`; renders
    - `addTask`: trims text; rejects empty (inline message); rejects duplicate via `isDuplicate`; appends `{id, text, completed: false}`; saves; renders
    - `editTask`: trims; rejects empty; rejects duplicate excluding self; updates in array; saves; renders
    - `toggleTask`: flips `completed`; saves; renders
    - `deleteTask`: filters out by id; saves; renders
    - `isDuplicate`: case-insensitive match, optionally excluding one id
    - `save`: `StorageHelper.set("pd_tasks", tasks)`
    - `render`: rebuilds task list DOM; each item has edit, complete-toggle, and delete controls
    - Wire add-task input and submit button in HTML
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.1, 5.2, 5.3_
  - [ ]* 7.2 Write property test for task persistence round-trip
    - **Property 7: `fc.string({minLength:1})` → `addTask()` → task in array and in `pd_tasks` JSON**
    - **Validates: Requirements 4.2, 4.3**
  - [ ]* 7.3 Write property test for task edit persistence
    - **Property 8: existing task + `fc.string({minLength:1})` → `editTask()` → updated in array and storage**
    - **Validates: Requirements 4.4**
  - [ ]* 7.4 Write property test for toggle involution
    - **Property 9: any task → `toggleTask()` twice → `completed` unchanged, storage matches**
    - **Validates: Requirements 4.5**
  - [ ]* 7.5 Write property test for task deletion
    - **Property 10: task list + any task id → `deleteTask()` → id absent from array and storage**
    - **Validates: Requirements 4.6**
  - [ ]* 7.6 Write property test for empty/whitespace rejection
    - **Property 11: `fc.stringMatching(/^\s*$/)` → `addTask()` → rejected, list unchanged**
    - **Validates: Requirements 4.7**
  - [ ]* 7.7 Write property test for duplicate add rejection
    - **Property 12: existing task text + case variant → `addTask()` → rejected, list unchanged**
    - **Validates: Requirements 5.1, 5.2**
  - [ ]* 7.8 Write property test for duplicate edit rejection
    - **Property 13: two-task list + edit to match other → `editTask()` → rejected, both unchanged**
    - **Validates: Requirements 5.3**
  - [ ]* 7.9 Write unit tests for TodoList
    - Test: renders input and submit control (Req 4.1)

- [x] 8. Implement QuickLinks
  - [x] 8.1 Write `QuickLinks` with `init()`, `addLink(label, url)`, `deleteLink(id)`, `save()`, and `render()` methods
    - `init`: loads `pd_links` via `StorageHelper` (default `[]`); guards with `Array.isArray`; renders
    - `addLink`: trims label; rejects empty label (inline message); validates URL via `new URL()` in try/catch; appends `{id, label, url}`; saves; renders
    - `deleteLink`: filters out by id; saves; renders
    - `save`: `StorageHelper.set("pd_links", links)`
    - `render`: rebuilds link buttons DOM; each button opens URL in new tab; each has a delete control
    - Wire label/URL inputs and submit button in HTML
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  - [ ]* 8.2 Write property test for link persistence round-trip
    - **Property 14: `fc.string({minLength:1})` + valid URL → `addLink()` → link in array and `pd_links` JSON**
    - **Validates: Requirements 6.2, 6.4**
  - [ ]* 8.3 Write property test for link deletion
    - **Property 15: links list + any link id → `deleteLink()` → id absent from array and storage**
    - **Validates: Requirements 6.5**
  - [ ]* 8.4 Write property test for invalid link rejection
    - **Property 16: empty label or invalid URL string → `addLink()` → rejected, list unchanged**
    - **Validates: Requirements 6.6**
  - [ ]* 8.5 Write unit tests for QuickLinks
    - Test: renders label/URL inputs and submit control (Req 6.1)

- [x] 9. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Responsive layout and visual polish
  - Add CSS grid/flexbox layout for the widget grid; two-column on desktop, single-column on mobile (media query)
  - Style all widgets consistently using CSS custom properties for colors, spacing, and typography
  - Ensure theme toggle, timer controls, task controls, and link buttons are visually distinct and accessible (focus rings, contrast)
  - Apply light and dark palette values to `[data-theme="light"]` and `[data-theme="dark"]` selectors
  - _Requirements: 7.1, 7.2, 9.1, 9.4_

- [x] 11. Wire all modules and final integration
  - [x] 11.1 In `DOMContentLoaded` handler: call `ThemeManager.init()` first (before any render), then `GreetingWidget.init()`, `FocusTimer.init()`, `TodoList.init()`, `QuickLinks.init()`
    - Ensures theme is applied before content renders (no flash)
    - _Requirements: 7.4, 8.1_
  - [x] 11.2 Verify `localStorage` unavailability path renders widgets with defaults and shows warning banner
    - _Requirements: 8.3_

- [x] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use **fast-check** with a minimum of 100 iterations each
- Unit tests use Vitest + jsdom
- Test files live under `tests/` (greeting, timer, todo, quicklinks, theme, storage)
- The timer does not persist remaining time across reloads — it always resets to session duration on load (by design)
