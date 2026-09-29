# Specification: Thai Lottery 2-Digit Statistics & Interactive Educational Explorer

## Problem Statement

นักศึกษาวิชาสถิติและประชาชนทั่วไปมักมีความเข้าใจผิดอย่างแพร่หลายเกี่ยวกับผลสลากกินแบ่งรัฐบาล โดยเฉพาะรางวัลเลขท้าย 2 ตัว เช่น เชื่อว่าผลในอดีตมีผลต่ออนาคต (Gambler's Fallacy), เชื่อว่ามีเลข "ล็อค" หรือเลขที่มีความน่าจะเป็นสูงกว่าปกติ และขาดเครื่องมือเชิงโต้ตอบ (Interactive Tool) ที่ช่วยให้เห็นสถิติทางคณิตศาสตร์ที่เป็นรูปธรรม ทั้งในแง่การกระจายตัวจริง (Empirical Distribution), การทดสอบภาวะสารูปสนิทดี (Chi-Square Goodness-of-Fit), และผลกระทบต่อเงินทุนผ่านการจำลอง (Monte Carlo Simulation) ภายใต้กฎจำนวนมาก (Law of Large Numbers)

## Solution

เว็บแอปพลิเคชันเชิงโต้ตอบแบบ Client-side 100% เผยแพร่ผ่าน GitHub Pages ภายใต้ธีม "Starbucks Warm Clean" (โทนครีม-เขียวเอิร์ธโทน สบายตา ฟอนต์ไทยแบบมีหัว Bai Jamjuree / Pridi / Sarabun ไร้ Emoji) สำหรับอาจารย์ใช้สอนและให้นิสิตใช้ทดลองค้นคว้าด้วยตนเอง โดยเน้นด้าน **Data Explorer** อย่างละเอียด ผสานกับโมดูลการเรียนรู้ทางคณิตศาสตร์และสถิติ

## User Stories

1. As an instructor, I want an overview dashboard displaying sample size ($N=565$), degrees of freedom ($df=99$), Chi-Square test statistic ($\chi^2 = 82.26$), and $p$-value ($0.888$), so that I can immediately demonstrate to students that the empirical data is statistically indistinguishable from a Discrete Uniform Distribution $U\{0, 99\}$.
2. As a student, I want an interactive $10 \times 10$ Heatmap matrix of all numbers from 00 to 99, so that I can visually verify how uniformly winning numbers are distributed across decades and units.
3. As a student, I want to hover and click any number (00–99) on the Heatmap or search bar, so that I can inspect its complete historical draw dates, frequency count, and interval gaps.
4. As a researcher/learner, I want rich data filtering options (by Buddhist Era year range, month, and draw day: 1st vs 16th), so that I can explore seasonal patterns or verify if specific draw dates exhibit any anomaly.
5. As a student, I want an interactive frequency table with sorting (by number, frequency ascending/descending, and last drawn date), so that I can explore "hot" and "cold" numbers easily.
6. As a student/instructor, I want a 1-click "Export Filtered CSV" button, so that I can download any filtered subset of historical data into Python/Excel for classroom assignments.
7. As a learner, I want a Digit Distribution module comparing tens digits (0–9) and unit digits (0–9) against the theoretical $10\%$ expectation, so that I can understand marginal distributions.
8. As a student, I want an interactive Monte Carlo Simulator where I can configure ticket purchase strategies (fixed number vs random number, ticket cost 80/100 THB, duration in years), so that I can visualize portfolio ruin and understand why the house edge renders long-term play unprofitable ($E[X] = -75\%$).
9. As a mobile/tablet user, I want a fully responsive layout that fits gracefully on smartphones and iPads, so that I can use the tool conveniently inside classrooms.
10. As an offline/local learner, I want the web application to work without CORS errors even when opened via the `file://` protocol, so that lack of an active web server or internet connection never breaks functionality.

## Implementation Decisions

- **Architecture & Hosting**: Pure static web application (HTML5 + CSS3 + Vanilla JavaScript + KaTeX math rendering), zero build step, hosted under `SubwatG/Math-materials` on GitHub Pages (`interactive/thai-lottery-stats/`).
- **Visual Design & Palette (Starbucks Warm Clean)**:
  - Background canvas: Warm milk-tea cream (`#FAF8F5`)
  - Surface cards: Clean white (`#FFFFFF`) with subtle warm border (`#E3DDD5`)
  - Accent / Primary: Starbucks Siren Green (`#00704A`) with warm forest green hover states (`#00583A`)
  - Secondary / Math accents: Ochre Gold (`#A86F00`) and Deep Terracotta (`#C94A29`)
  - Typography: `Bai Jamjuree` (Headings), `IBM Plex Sans Thai Looped` / `Sarabun` (Body), `IBM Plex Mono` (Numbers & tabular figures)
  - Zero Emoji: Clean SVG icons and formal mathematical symbols only.
- **Data Encapsulation**: Historical data spanning 2543–2567 (565 draws) bundled as an immutable JavaScript data module (`lottery-data.js` exposing `window.LOTTERY_DATA`), eliminating CORS/fetch failures.
- **Seams & Modules**:
  - `StatsEngine`: Pure analytical functions (Chi-square test, frequency counter, gap calculator, Monte Carlo runner).
  - `FilterState`: Reactive state management tracking active year range, draw period, and digit filters.
  - `UIController`: DOM bindings for Heatmap grid, Explorer view, charts, and CSV exporter.
- **Mathematical Rigor**: All formula displays use KaTeX with clear academic definitions (Null hypothesis $H_0$, test statistic formula, expected value equation).

## Testing Decisions

- **Automated Verification**:
  - Verification of data integrity: exactly 565 draws, valid date ranges (2543 to 2567), valid winning numbers ($0 \le num \le 99$).
  - Mathematical correctness: Chi-square calculation verified against `scipy.stats.chisquare` ($\chi^2 \approx 82.2566, df=99, p \approx 0.8881$).
  - Linting & Standards: Validation with `s1-doctor` to ensure zero KaTeX rendering crashes, unclosed delimiters, or syntax bugs.
- **Interactive Verification**:
  - Filter state mutations produce correct subsets.
  - Heatmap correctly reflects filtered frequencies.
  - CSV export generates valid RFC 4180 format.
  - Monte Carlo simulation properly applies the prize rules (2,000 THB prize for 2-digit match).

## Out of Scope

- Other prize tiers (1st prize 6 digits, 3-digit front/back) — the focus is strictly on the 2-digit bottom prize (00–99).
- Predictive "AI" or machine-learning number generators (excluded intentionally to uphold mathematical validity).
- User authentication or server-side database.

## Further Notes

This deliverable directly supports the Department of Computing and Digital Technology curriculum and General Education / Statistics courses (01422111), serving as a reusable open-source educational instrument.
