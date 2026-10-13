# Thrive Pulse — On-Device Vegan Nutrition & Calisthenics Progression Tracker

A high-performance, colorful, privacy-first web application designed for mobile and desktop that stores 100% of its data directly on the user's device. It pairs comprehensive vegan macro & micronutrient tracking (with personalized targets) alongside an interactive calisthenics skill-tree workout engine that tracks progressive overload and fuels recovery in real time.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX choices have been aligned based on your preferences:

- **Confirmed Decision 1 (Local Multi-User Architecture)**: The application stores all data exclusively inside the browser storage (IndexedDB + local storage fallback with zero cloud transmission). An instant user-profile switcher enables separate profiles (e.g., family members or different training phases) with full JSON export/import and offline backup capabilities.
- **Confirmed Decision 2 (Vibrant Visual Theme)**: A dynamic, high-contrast, energizing color system combining Emerald Leaf (`#059669`), Vivid Citrus/Tangerine (`#F59E0B`), Energetic Coral/Watermelon (`#F43F5E`), and Deep Botanical Slate (`#064E3B` / `#0F172A`). Rich SVG progress rings, macro balance bars, and celebratory milestone animations.
- **Confirmed Decision 3 (Calisthenics & Nutrition Synergy)**: A tiered progression ladder spanning 4 core disciplines (Push, Pull, Legs, Core & Mobility) from beginner (knee push-ups, dead hangs, assisted squats) through intermediate to advanced (muscle-up progressions, pistol squats, L-sit, handstand push-ups). Workout logging automatically calculates recovery protein targets and highlights critical vegan micronutrients (Iron, Zinc, B12, Calcium, Vitamin D, Omega-3, Magnesium).

---

### 1. Overview & Core Concept

- **What It Does**:
  - **Local Multi-User Profile Hub**: Seamless creation and instant switching between independent user profiles without accounts or internet connection.
  - **Comprehensive Vegan Nutrition Engine**: Tracks total energy (kcal), macronutrients (Protein, Complex Carbs, Healthy Fats, Fiber) and essential vegan micronutrients (B12, Vitamin D, Non-Heme Iron + Vitamin C booster, Calcium, Zinc, Iodine, Omega-3 ALA, Magnesium). Includes a rich database of 120+ verified vegan whole-foods and quick-add staples.
  - **Calisthenics Progression Ladder**: An interactive skill tree with step-by-step movement progressions, animated exercise guides, rep/set/hold tracking, rest timer, and personal record (PR) detection.
  - **Fuel & Recovery Synergy**: Directly links workouts with post-session nutrition (e.g. recommended post-workout protein window, leucine-rich plant sources, anti-inflammatory micronutrients).
  - **Insightful Visualizations**: Interactive weekly/monthly SVG macro breakdown charts, micronutrient sufficiency gauges, calisthenics volume trendlines, consistency heatmaps, and habit checklists.
  - **100% Offline & Private**: Zero external database or tracking scripts; full JSON backup/restore ensures users own their data forever.

- **Target Audience**: Individuals and households committed to vegan living, plant-based athletes, and beginners through advanced calisthenics enthusiasts looking for an all-in-one local tracker.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Profile Switching & Goal Calibration**: Switch or create a profile in 1 click; personalize daily health goals (protein target in g/day, target calories, hydration, sleep, calisthenics focus).
2. **Dynamic Daily Dashboard**: View current day ring progress (calories, protein, movement, sleep, micronutrient score), date carousel, quick-action buttons for logging meals and exercises.
3. **Macro & Micro Food Logger**: Search or quick-pick plant foods (tofu, tempeh, lentils, quinoa, nutritional yeast, chia, edamame, etc.), adjust portion sizes, and immediately watch dynamic macro/micro gauges update.
4. **Calisthenics Skill Tree & Workout Session**: Browse exercise trees (Push, Pull, Legs, Core); tap to start a structured workout with built-in rest timer, rep counters, and progression milestones.
5. **Trends & Insight Visualizations**: Explore interactive analytics: 7-day and 30-day nutrition averages, strength progression charts, radar charts for micronutrient coverage, and weekly self-reflection.
6. **Data Portability**: Instant one-tap JSON backup download and restore with validation.

#### Visual Identity & Theme
- **Aesthetic Direction**: Energetic, polished, tactile athletic-botanical aesthetic. Deep rich forest surfaces paired with crisp daylight cards, vibrant neon-fruit accents, and smooth reactive charts.
- **Color Tokens**:
  - Dominant Neutral: Deep Botanical Slate (`#0A1D16` dark / `#FBFDF9` daylight canvas)
  - Primary Botanical Accent: Emerald Leaf (`#10B981` / `#059669`)
  - High-Energy Protein Accent: Vivid Coral (`#F43F5E`)
  - Calorie & Carb Accent: Citrus Tangerine (`#F59E0B`)
  - Healthy Fats & Mobility Accent: Sky Cyan (`#06B6D4`)
  - Micronutrient Gold: Bright Sunflower (`#EAB308`)
- **Typography**: Clean contemporary display typography (`Plus Jakarta Sans` / modern system rounded sans) with tabular figures (`tabular-nums`) for all stats, reps, and grams.
- **Layout Presence**: Full 1440px desktop layout featuring a split 2-column or 3-column workspace, combined with ergonomic mobile bottom navigation bar and accessible touch hitboxes ($\ge 44\text{px}$).

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Local Device Storage vs Cloud**:
  - *Chosen*: IndexedDB + `localStorage` fallback with multi-user namespace partition.
  - *Why*: Complies strictly with the user's requirement ("stored in the phone itself, and not anywhere in the cloud"). Provides instant zero-latency loading, complete offline capability, and zero account friction.
- **Decision 2: Calisthenics Mastery Model**:
  - *Chosen*: Tiered Progressive Overload Tree (Level 1: Novice, Level 2: Foundation, Level 3: Intermediate, Level 4: Advanced Mastery) across Push, Pull, Legs, and Core.
  - *Why*: Calisthenics relies on mechanical leverage adjustments rather than adding weight plates. Progressing from Wall Push-ups -> Knee Push-ups -> Full Push-ups -> Diamond Push-ups -> Archer -> One-Arm Push-ups provides a clear gamified trajectory.
- **Decision 3: Vegan Micro-Nutrient Intelligence**:
  - *Chosen*: Emphasize the critical nutrients commonly needing attention on vegan diets (B12, Vitamin D, Iron, Zinc, Calcium, Omega-3, Iodine, Protein). Each nutrient card displays daily target percentage, food sources logged today, and practical pairing tips (e.g., "Pair non-heme iron with Vitamin C for 3x absorption").

---

### 4. Technical Architecture & Data Strategy

#### System & Component Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Thrive Pulse App Client                         │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │     Top Bar & Profile Switcher (Local Multi-User Selector)       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌───────────────────┬───────────────────┬──────────────────────────┐  │
│  │   Today Hub       │   Nutrition Log   │  Calisthenics Tree       │  │
│  │ • Day Carousel    │ • Macros & Micros │ • Push / Pull / Legs     │  │
│  │ • 4 Metric Rings  │ • 120+ Plant DB   │ • Reps / Sets Tracker    │  │
│  │ • Essentials List │ • Custom Meals    │ • Rest Interval Timer    │  │
│  │ • Recovery Alert  │ • Fuel Insights   │ • Level Progression      │  │
│  └───────────────────┴───────────────────┴──────────────────────────┘  │
│                                                                        │
│  ┌───────────────────────────────────────┬──────────────────────────┐  │
│  │   Analytics & Visualizations          │  Daily Care & Diary      │  │
│  │ • 7/30-Day SVG Macro Trends           │ • Sleep, Mood, Soreness  │  │
│  │ • Micro Nutrient Radar Coverage       │ • Digestive & Cycle Log  │  │
│  │ • Calisthenics Volume Chart           │ • Weekly Wins Reflection │  │
│  └───────────────────────────────────────┴──────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │         Local Multi-User Persistence Engine (IndexedDB)          │  │
│  │ • Users Table  • Daily Logs Table  • Workout PRs  • Export/Import│  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

#### Core Data Entities
1. `UserProfile`:
   - `id`: string
   - `name`: string
   - `avatar`: string
   - `dailyGoals`: { calories, protein, carbs, fats, water, sleepHours }
   - `calisthenicsLevel`: 'beginner' | 'intermediate' | 'advanced'
   - `createdAt`: string
2. `DayLog`:
   - `date`: YYYY-MM-DD
   - `meals`: Array of `{ id, mealType, foodName, calories, protein, carbs, fats, micros, portion }`
   - `workouts`: Array of `{ exerciseId, level, sets: [{ reps, holdSec, rpe }], completedAt }`
   - `essentials`: Record<string, boolean> (B12, D3, Iron, etc.)
   - `care`: { sleepHours, sleepQuality, waterMl, sorenessLevel, mood, notes }
3. `CalisthenicsTree`:
   - Discipline: `push` | `pull` | `legs` | `core`
   - Progression steps with target milestone rep criteria for unlocking the next level.
   - Recommended plant fuel pairings for each workout intensity.
