# AgendAI — Full Codebase Audit

> Generated: 2026-05-27

---

## Part 1 — Page Overview

| Page | Auth ✓/✗ | Data | TODOs / Notes | Issues |
|---|---|---|---|---|
| dashboard.tsx | ✓ | Real (7 Supabase queries) | None | `scheduleQuery.eq(...)` not reassigned — Supabase builder mutates in-place so it works, but code smell |
| catalog.tsx | ✓ | Real | None | None |
| teme.tsx | ✓ | Real | None | Uses `assignment_submissions` table |
| orar.tsx | ✓ | Real | None | None |
| progres.tsx | ✓ | Real | None | Tables `topic_progress`, `learning_events`, `streak_log` may be empty/missing in DB |
| mesaje.tsx | ✓ | **Mock** (`MOCK_CONVERSATIONS` hardcoded) | Line 57: `// Static preview conversations — backend not yet implemented` | Entire messaging backend unimplemented |
| profil.tsx | ✓ | Real (read + 3 update paths) | None | None |
| setari.tsx | ✓ | Real | None | `currentPassword` field collected but never sent to Supabase — `auth.updateUser` only needs `newPassword` |
| tutore.tsx | ✓ | Real | `console.error` line 309 (legitimate error handler) | **Credits decremented client-side only** — `thinking_credits` never updated in Supabase; refresh restores credits |
| api/tutor.ts | ✓ (JWT) | Real (OpenAI + Supabase) | `console.log` debug lines 31–32, 102 left in production | No server-side credit check or deduction |
| admin/index.tsx | ✓ + role check | Real | None | None |
| admin/utilizatori.tsx | ✓ + role check | Real (+ POST `/api/admin/create-user`) | None | `/api/admin/create-user` endpoint not audited — needs verification |
| admin/clase.tsx | ✓ + role check | Real (full CRUD) | None | None |
| admin/an-scolar.tsx | ✓ + role check | Real | None | None |
| profesor/index.tsx | ✓ + role check | Real | None | Queries `from("submissions")` — teme.tsx uses `from("assignment_submissions")` — **table name mismatch** |
| profesor/clasele-mele.tsx | ✓ + role check | Real | None | None |
| **profesor/clasa/[id].tsx** | — | — | — | **FILE DOES NOT EXIST** — all professor class links result in 404 |
| profesor/orar.tsx | ✓ + role check | Real | None | None |

---

## Part 2 — Interactive Elements

| Page | Element | Status | Notes |
|---|---|---|---|
| dashboard | "Începe un streak" button | ✗ Mock | No `onClick` handler |
| dashboard | Floating AI brain button (bottom-right) | ✗ Mock | No `onClick`, no `href` — does nothing |
| dashboard | Sidebar nav links | ✓ Working | Next.js `<Link>` components |
| catalog | Sidebar nav links | ✓ Working | No interactive elements beyond nav |
| teme | Tab filter buttons (Toate / În așteptare / Predate / Întârziate) | ✓ Working | Updates `activeTab` state, filters list |
| teme | "Vezi detalii / Închide" expand button | ✓ Working | Toggles `expandedId` |
| teme | Submission textarea | ✓ Working | Bound to `submissionTexts` state |
| teme | "Predă tema" button | ✓ Working | Inserts into `assignment_submissions` |
| orar | Previous week button (ChevronLeft) | ✓ Working | Decrements `weekOffset` |
| orar | Next week button (ChevronRight) | ✓ Working | Increments `weekOffset` |
| orar | "Azi" reset button | ✓ Working | Resets `weekOffset` to 0 |
| mesaje | Conversation list items | ~ Partial | Selects conversation but thread shows "Funcționalitate în construcție" |
| mesaje | Search input | ✗ Mock | `disabled` attribute, no handler |
| mesaje | Message textarea | ✗ Mock | `disabled` attribute |
| mesaje | Send button | ✗ Mock | `disabled` attribute |
| profil | "Editează" button | ✓ Working | Switches to edit mode |
| profil | Profile form (name, school, grade, style, goal) | ✓ Working | All fields bound to state |
| profil | "Salvează" (profile) button | ✓ Working | Updates `profiles` via Supabase |
| profil | "Anulează" button | ✓ Working | Exits edit mode without saving |
| profil | Language toggle buttons (Română / Rusă) | ✓ Working | Updates `prefLanguage` state |
| profil | Difficulty toggle buttons (Ușor / Mediu / Dificil) | ✓ Working | Updates `prefDifficulty` state |
| profil | "Salvează preferințele" button | ✓ Working | Updates `language`, `preferred_difficulty` in Supabase |
| profil | Add weak subject input + Enter | ✓ Working | Calls `addSubject()` |
| profil | "Adaugă" button (weak subjects) | ✓ Working | Upserts `weak_subjects` array in Supabase |
| profil | X remove button on subject tag | ✓ Working | Removes from array, updates Supabase |
| setari | "Schimbă parola" toggle | ✓ Working | Expands password form |
| setari | Password show/hide eye buttons | ✓ Working | Toggles visibility state |
| setari | Current password field | UI Only | Collected but **never sent** to Supabase API |
| setari | New / confirm password fields | ✓ Working | Validated and sent to `auth.updateUser` |
| setari | "Salvează parola" button | ✓ Working | Calls `supabase.auth.updateUser({ password })` |
| setari | Notifications toggle | ✓ Working | Updates local state |
| setari | Streak reminders toggle | ✓ Working | Updates local state |
| setari | "Salvează preferințele" (notifications) button | ✓ Working | Updates `notifications_enabled`, `streak_reminders` in Supabase |
| setari | "Deconectează-te" button | ✓ Working | Calls `auth.signOut()`, redirects to `/login` |
| setari | "Șterge contul" button | UI Only | `disabled`, shows tooltip "Contactează administratorul" |
| setari | "În curând" (upgrade) button | UI Only | `disabled`, no handler |
| tutore | Subject selector dropdown | ✓ Working | Fetches subjects from Supabase, adds context to AI |
| tutore | Suggestion chips | ✓ Working | Calls `handleSend(chip)` directly |
| tutore | "Sesiune nouă" button | ✓ Working | Clears messages, resets session ID |
| tutore | Message textarea (Enter / Shift+Enter) | ✓ Working | Auto-resize + keyboard shortcut |
| tutore | Send button | ✓ Working | POSTs to `/api/tutor` with JWT auth header |
| tutore | Error dismiss (×) button | ✓ Working | Clears `sendError` state |
| admin/index | No interactive elements | — | Stat display only |
| admin/utilizatori | Tab buttons (Elevi / Profesori) | ✓ Working | Switches list and form context |
| admin/utilizatori | Search input | ✓ Working | Client-side filter by name |
| admin/utilizatori | "Adaugă elev / profesor" button | ✓ Working | Opens inline add form |
| admin/utilizatori | Add form (name, email, password) | ✓ Working | Bound to `form` state |
| admin/utilizatori | "Salvează" (add user) button | ✓ Working | POSTs to `/api/admin/create-user` |
| admin/utilizatori | Close (X) button | ✓ Working | Closes form |
| admin/clase | "Adaugă clasă" button | ✓ Working | Opens new class form |
| admin/clase | Class form (name, grade level, teacher) | ✓ Working | Inserts into `classes` |
| admin/clase | Class expand / collapse row | ✓ Working | Loads class detail via `loadClassDetail` |
| admin/clase | "Adaugă elev" link | ✓ Working | Opens student select dropdown |
| admin/clase | Student select + "Adaugă" | ✓ Working | Inserts into `class_enrollments` |
| admin/clase | Student X (remove) | ✓ Working | Deletes from `class_enrollments` |
| admin/clase | "Adaugă materie" link | ✓ Working | Opens subject + teacher select |
| admin/clase | Subject + teacher select + "Adaugă" | ✓ Working | Inserts into `class_subjects` |
| admin/clase | Subject X (remove) | ✓ Working | Deletes from `class_subjects` |
| admin/an-scolar | "An școlar nou" button | ✓ Working | Opens create form |
| admin/an-scolar | Form fields (name, start date, end date) | ✓ Working | Bound to state with validation |
| admin/an-scolar | "Activează imediat" toggle | ✓ Working | Sets `makeActive` flag |
| admin/an-scolar | "Salvează" button | ✓ Working | Inserts `school_years`, deactivates others if toggled |
| admin/an-scolar | "Activează" button (per row) | ✓ Working | Deactivates all years, activates selected one |
| profesor/index | Class cards (Links) | ✓ Working | Navigates to `/profesor/clasa/[id]` — **target page missing** |
| profesor/index | "Vezi toate" link | ✓ Working | Navigates to `/profesor/clasele-mele` |
| profesor/clasele-mele | Class cards (Links) | ✓ Working | Same issue — links to missing `[id].tsx` |
| profesor/orar | Previous / Next week buttons | ✓ Working | Increments / decrements `weekOffset` |
| profesor/orar | "Azi" reset button | ✓ Working | Resets `weekOffset` to 0 |

---

## Critical Issues

### 1. `pages/profesor/clasa/[id].tsx` — FILE MISSING
Every professor-side link to a class detail page (from `profesor/index.tsx` and `profesor/clasele-mele.tsx`) results in a **404**. The route `/profesor/clasa/[id]` has no handler. This is the largest functional gap for the professor role.

### 2. `thinking_credits` never persisted
In `tutore.tsx` (line 306):
```ts
setCredits((prev) => Math.max(0, prev - 1));
```
Credits are only decremented in local React state. The `thinking_credits` column in Supabase `profiles` is never updated. A page refresh restores the full credit balance. There is also no server-side credit check in `api/tutor.ts` — a user with 0 credits can call the API directly.

### 3. `mesaje.tsx` — fully mocked
All messaging UI is static. Conversations are hardcoded (`MOCK_CONVERSATIONS`). Search, textarea, and send button are all `disabled`. No Supabase tables or real-time subscriptions are wired up.

### 4. Table name mismatch — `submissions` vs `assignment_submissions`
- `teme.tsx` (student submit): queries `from("assignment_submissions")`
- `profesor/index.tsx` (pending grading): queries `from("submissions")`

One of these table names is wrong. If the real table is `assignment_submissions`, the professor dashboard will always show 0 pending items.

### 5. Debug `console.log` in `api/tutor.ts`
Lines 31–32 log every API call and the presence of the OpenAI key to server logs in production:
```ts
console.log("[tutor API] called", req.method, JSON.stringify(req.body ?? {}).slice(0, 200));
console.log("[tutor API] has OPENAI_API_KEY:", !!process.env.OPENAI_API_KEY);
```
Line 102 logs every successful response length. These should be removed or replaced with a proper logger.

### 6. `currentPassword` field is a no-op in `setari.tsx`
The "Parola curentă" input is rendered and bound to state but the value is never passed anywhere. `supabase.auth.updateUser({ password: newPassword })` works without it for authenticated sessions, so this is a UX deception rather than a bug — but users expect it to be validated.

### 7. `/api/admin/create-user` not audited
`admin/utilizatori.tsx` posts to `/api/admin/create-user`. This endpoint was not in the audit scope. It needs to exist and use the Supabase service-role key to create users in Auth + insert into `profiles`.

---

## Legend

| Symbol | Meaning |
|---|---|
| ✓ Working | Has real handler + Supabase call |
| ~ Partial | Has handler but incomplete / missing DB call |
| ✗ Mock | onClick does nothing or is disabled |
| UI Only | Rendered but disabled / not wired |
