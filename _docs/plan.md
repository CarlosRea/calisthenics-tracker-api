# Technical Specification: Calisthenics Workout Tracker (MVP)

## 1. Problem Statement
Athletes doing bodyweight and street workout circuits need a fast, lightweight tool to log sets, repetitions, and extra weight (weighted calisthenics), and automatically calculate their total training volume and personal records per exercise.

---

## 2. Agreed Scope & Design Decisions

* **Volume Calculation:** Minimalist rep-based calculation (`sets * reps`). Added weight is recorded and displayed as metadata in the history.
* **Set Entry Structure:** Uniform set input (`sets` and `reps` fixed per entry, e.g., 4 sets of 10 reps = 40 reps).
* **Exercise Selection:** Hybrid input (predefined dropdown of popular calisthenics exercises with auto-assigned categories, with the ability to enter custom exercises and select a category).
* **Personal Records (PR):** Maximum reps achieved in a single set per category (`Pull`, `Push`, `Legs`, `Core`).
* **User Model & Authentication:** Open demo / single-tenant mode without authentication for friction-free reviewer access.
* **CRUD Operations:** Create (`POST`), List/Filter (`GET`), and Delete (`DELETE`). Mistakes are corrected by deleting and re-logging.

---

## 3. Core Features (MVP Backlog)

### [FEAT-1] Log Workout Entry (`POST /api/workouts`)
Record a workout session with the following fields:
* `exercise_name` (string, required): e.g., "Pull-ups", "Parallel Bar Dips".
* `category` (enum, required): `"Pull"`, `"Push"`, `"Legs"`, or `"Core"`.
* `sets` (integer, required, > 0): Number of completed sets.
* `reps` (integer, required, > 0): Repetitions completed per set.
* `added_weight` (float, optional, default: `0.0`): Extra weight in kg.
* `date` (date/ISO string, optional, default: current date).

### [FEAT-2] List & Filter Workouts (`GET /api/workouts`)
* Retrieve all logged workouts ordered by date (most recent first).
* Query parameter filters:
  * `category`: Filter by "Pull", "Push", "Legs", or "Core".
  * `exercise`: Filter by specific exercise name.

### [FEAT-3] Delete Workout (`DELETE /api/workouts/{id}`)
* Remove a workout record by unique ID.

### [FEAT-4] Analytics & PR Summary (`GET /api/stats/summary`)
Deterministic metrics calculation:
* **Total workouts:** Total number of logged workout entries.
* **Total volume:** Total repetitions across all entries (`sum(sets * reps)`).
* **Category PRs:** Maximum reps in a single set for each category:
  * Pull PR (max reps)
  * Push PR (max reps)
  * Legs PR (max reps)
  * Core PR (max reps)

### [FEAT-5] Interactive Web Dashboard (`GET /`)
* **KPI Header:** Summary cards displaying Total Workouts, Total Volume, and PRs per category.
* **Quick-Add Form:** Inputs for exercise, category, sets, reps, weight, date, and a submit button.
* **Filter Bar:** Category filter pills (All, Pull, Push, Legs, Core) and exercise filter.
* **History Table:** Tabular view of logged sessions with exercise, category, sets, reps, weight, calculated total reps, date, and a delete action button.

### [FEAT-6] Auto-Seed Demo Data
* On startup, if the database contains 0 records, automatically seed 4 realistic calisthenics workout logs (e.g., Pull-ups, Dips, Squats, Hanging Leg Raises) so reviewers can test immediately.

---

## 4. Next Steps
* Define technical stack and implementation plan.
