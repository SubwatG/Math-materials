# Specification: All-Prizes Architecture & 20-Year Lifetime Checker

## Problem Statement

ประชาชนและนิสิตส่วนใหญ่มักมองเห็นสลากกินแบ่งรัฐบาลแบบแยกส่วน (เช่น ดูเฉพาะเลขท้าย 2 ตัว หรือดูเฉพาะรางวัลที่ 1) ทำให้ขาดภาพรวมเชิงคณิตศาสตร์ของ "สถาปัตยกรรมโครงสร้างรางวัลทั้งหมด" (Total Prize Architecture) ตามพระราชบัญญัติสำนักงานสลากกินแบ่งรัฐบาล พ.ศ. 2517 (มาตรา 22 กำหนดเงินรางวัล 60% ของยอดจำหน่าย) และไม่เห็นโอกาสที่แท้จริงของการถูกรางวัลใดรางวัลหนึ่ง ($1.42\%$) รวมถึงขาดเครื่องมือที่สามารถตรวจสอบสลาก 6 หลักใดๆ ย้อนหลัง 20 ปี (428 งวด รวมกว่า 70,000 รางวัล) ว่าเคยถูกรางวัลที่ 1 ถึง 5 หรือรางวัลเลขท้าย/หน้าใดบ้าง

## Solution

เพิ่มแท็บที่ 4 ในเว็บแอปพลิเคชัน:
1. **ตารางสถาปัตยกรรมความน่าจะเป็นของรางวัลทั้ง 9 ประเภท (9-Tier Prize Architecture)**:
   - แสดงจำนวนรางวัล, เงินรางวัลต่อใบ, เงินรางวัลรวม, ความน่าจะเป็น ($P$), และสัดส่วนเงินรางวัลตามกฎหมาย ($60\%$ Payout Ratio)
   - สรุปค่าคาดหมายสุทธิ $E[X] = -32 \text{ บาทต่อใบ}$ (ที่ราคา 80 บาท) และ $-52 \text{ บาท}$ (ที่ราคา 100 บาท)
   - สรุปโอกาสที่จะไม่ถูกรางวัลใดๆ เลยสูงถึง $98.58\%$
2. **ระบบตรวจสลากย้อนหลังทุกรางวัล 20 ปี (20-Year Lifetime 6-Digit Historical Checker)**:
   - ผู้ใช้สามารถพิมพ์เลข 6 หลักใดๆ (000000 ถึง 999999)
   - ระบบจะตรวจเทียบกับฐานข้อมูลรางวัลจริงย้อนหลังกว่า 50,000 หมายเลขที่เคยถูกรางวัล (รางวัลที่ 1, ข้างเคียง, รางวัลที่ 2, รางวัลที่ 3, รางวัลที่ 4, รางวัลที่ 5, เลขหน้า 3 ตัว, เลขท้าย 3 ตัว, เลขท้าย 2 ตัว)
   - แสดงรายงานละเอียด: เคยถูกรางวัลระดับใดบ้าง ในงวดใด วันที่เท่าไร และได้รับเงินรางวัลสะสมรวมทั้งหมดเท่าไรในรอบ 20 ปี
3. **การจำลองพอร์ตการซื้อจริงรวมทุกรางวัล (All-Prizes Simulation)**:
   - จำลองการซื้อสลาก 1 ใบต่องวดโดยคำนวณโอกาสถูกทุกรางวัลจริง เทียบกับเส้นค่าคาดหมาย $E[X] = -32$ บาท

## User Stories

1. As a statistics instructor, I want a comprehensive 9-tier prize architecture table displaying counts, payout percentages, and probabilities, so that I can teach expected value and statutory payout ratios using authentic legal and mathematical frameworks.
2. As a student/user, I want an instant 6-digit number checker that scans my number across 20 years of historical draws for all prize tiers (1st, 2nd, 3rd, 4th, 5th, Nearby, 3-digit front/back, 2-digit back), so that I can see every single prize my favorite number would have won historically.
3. As a learner, I want to see the total prize money my 6-digit number would have accumulated vs the total purchase cost over 20 years ($428 \times 80 = 34,240 \text{ THB}$), so that I can evaluate long-term financial outcomes.
4. As an instructor, I want to demonstrate that even when taking all 9 prize tiers into account, the expected value remains strictly negative ($E[X] = -40\%$), disproving the myth that "buying tickets is an investment".

## Implementation Decisions

- **Compact Inverted Index Data Module (`all-prizes-data.js`)**:
  - Contains index of draws and a lookup map `window.ALL_PRIZES_DATA = { draws: [...], hits: { "077335": [[drawId, tierId], ...] } }`.
  - Enables sub-millisecond $O(1)$ client-side lookups for any 6-digit number.
- **Architectural Seams**:
  - `StatsEngine.checkAllPrizes(numberStr)`: Evaluates a 6-digit string against 6-digit tiers (1st-5th, nearby) and extracts matching 2-digit and 3-digit sub-strings against the master draw history.
  - Returns total prizes won, total prize money (THB), and chronological list of all winning events.
- **Visual Presentation**:
  - Tab 4 added to mode switcher: `[ รางวัลอื่น ๆ ทั้งหมด & ตรวจสลาก 20 ปี ]`
  - Clean responsive tables and KPI cards in Starbucks Warm Clean theme.

## Testing Decisions

- Test exact prize lookup against known historical draws (e.g. `097863` won 1st prize on 16 Dec 2567; `077335` won 2nd prize on 16 Dec 2567).
- Verify mathematical totals: 14,168 total winning tickets per 1M tickets, 48M THB total payout, $60\%$ payout ratio.
- Check zero emoji and HTML tag closure.
