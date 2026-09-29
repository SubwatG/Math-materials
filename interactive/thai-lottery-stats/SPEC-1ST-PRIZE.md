# Specification: 1st Prize (6 Digits) Statistics & Combinatorial Analysis

## Problem Statement

ในบรรดารางวัลสลากกินแบ่งรัฐบาล รางวัลที่ 1 (ตัวเลข 6 หลัก $000000$ ถึง $999999$) เป็นรางวัลที่มีเงินรางวัลสูงสุดและได้รับความสนใจจากสังคมมากที่สุด ทว่ามีความเข้าใจผิดเชิงสถิติอย่างรุนแรง เช่น ความเชื่อว่ารางวัลที่ 1 มักเป็น "เลขที่ไม่ซ้ำกันเลย", ความประหลาดใจเมื่อเห็นเลขเบิ้ลติดกัน (เช่น `811852`), และการขาดความเข้าใจเรื่องการแจกแจงผลรวมของเลขโดด (Digit Sum) ที่พิสูจน์ทฤษฎีบทลิมิตศูนย์กลาง (Central Limit Theorem) รวมถึงยังไม่มีแพลตฟอร์มการเรียนรู้ที่เปิดให้สำรวจข้อมูลรางวัลที่ 1 ย้อนหลัง 20 ปีในเชิงคณิตศาสตร์อย่างเป็นระบบ

## Solution

เพิ่มแท็บ "รางวัลที่ 1 (6 หลัก)" เข้าสู่เว็บแอปพลิเคชัน โดยประกอบด้วย:
1. การวิเคราะห์ทฤษฎีบทลิมิตศูนย์กลาง (Central Limit Theorem) ผ่าน Histogram ผลรวมของเลขโดด 6 หลัก ($0 \le S \le 54$) เทียบกับ Normal Distribution ($\mu=27, \sigma=7.04$)
2. การวิเคราะห์รูปแบบการซ้ำของตัวเลข (Combinatorial Duplication Breakdown) พิสูจน์ว่าทำไมเลขที่มีตัวซ้ำอย่างน้อย 1 คู่จึงเกิดขึ้นถึง $\approx 85\%$ ขณะที่เลขต่างกันทั้งหมดเกิดขึ้นเพียง $\approx 15\%$
3. การวิเคราะห์อัตราการเกิดเลขเบิ้ลติดกัน (Consecutive Duplicates เช่น `xx11xx`) เทียบกับค่าทฤษฎี $\approx 40.95\%$
4. ตารางแจกแจงความถี่แยกรายตำแหน่งทั้ง 6 หลัก (หลักแสนถึงหลักหน่วย) พร้อมการทดสอบ Chi-Square Goodness-of-Fit แต่ละหลัก
5. ระบบสืบค้นและเจาะลึกรางวัลที่ 1 ในอดีต (1st Prize Search & Gap Inspector) สามารถพิมพ์เลข 6 หลัก หรือพิมพ์เลขบางส่วน เพื่อค้นหาประวัติการออกและระยะห่างระหว่างงวด

## User Stories

1. As a statistics instructor, I want an interactive Digit Sum Histogram overlaying the theoretical Normal Curve ($\mu=27, \sigma=7.035$), so that I can visibly demonstrate the Central Limit Theorem in action using authentic societal data.
2. As a student, I want a Combinatorial Duplication Breakdown comparing empirical counts against theoretical probabilities (All Distinct: 15.12%, One Pair: 45.36%, Two Pairs: 22.68%, Three of a kind: 12.60%, 4+ duplicates: 4.24%), so that I can overcome the cognitive intuition bias that 6-digit lottery draws are typically distinct.
3. As a learner, I want an indicator of Consecutive Duplicate numbers (เลขเบิ้ลติดกัน), so that I can verify that about 4 out of every 10 draws have adjacent identical digits purely by chance.
4. As an instructor/student, I want a 6-Position Frequency Table showing digits 0-9 across all positions (Hundred-thousands to Units) with Chi-Square statistics, so that I can demonstrate that each wheel revolves independently without directional bias.
5. As a user, I want a 1st Prize Search input allowing 6-digit or substring lookups, so that I can check if my favorite 6-digit numbers have ever won the first prize in the past 20 years.
6. As a student, I want to filter 1st prize records by Buddhist Era year range and draw dates, so that I can observe consistency across different time periods.
7. As a researcher, I want a 1-click "Download 1st Prize CSV" button, so that I can export the complete 470 records of 1st prize draws into Python for further statistical tests.

## Implementation Decisions

- **Architectural Seams**:
  - `StatsEngine.compute1stPrizeStats(data)`: Computes digit sum histogram, empirical mean & standard deviation, combinatorial pattern distribution, consecutive duplicate counts, and position-wise frequency matrix.
  - `StatsEngine.search1stPrize(data, query)`: Substring and exact search across all historical 1st prize records.
- **Visual Design**:
  - Maintained within Starbucks Warm Clean Theme.
  - Canvas 2D for high-DPI rendering of the Digit Sum Histogram overlaid with Gaussian Bell Curve.
  - Donut/bar charts for combinatorial pattern breakdown with color coding.
- **Mathematical Formulations**:
  - Central Limit Theorem:
    $$S = \sum_{i=1}^6 d_i \xrightarrow{d} \mathcal{N}(27.0, 49.5)$$
  - Combinatorial distinct probability:
    $$P(\text{All distinct}) = \frac{P(10,6)}{10^6} = \frac{151,200}{1,000,000} = 15.12\%$$
  - Consecutive duplicate probability:
    $$P(\text{Consecutive duplicates}) = 1 - \frac{10 \times 9^5}{10^6} = 40.95\%$$

## Testing Decisions

- Test digit sum mathematical parity: Empirical mean within $27.0 \pm 0.8$, standard deviation within $7.04 \pm 0.5$.
- Test combinatorial pattern classification on known test cases (e.g. `123456` -> All Distinct, `112345` -> One Pair, `112234` -> Two Pairs, `111234` -> Three of a Kind).
- Test consecutive duplicate detector (e.g. `112345` -> True, `121314` -> False).
- HTML syntax validation with zero emoji and valid KaTeX formulas.

## Out of Scope

- Prediction of future 1st prizes.
- Lottery ticket serial numbers or security codes.
