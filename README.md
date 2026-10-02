# Math Materials

คลังสื่อ HTML แบบ interactive สำหรับใช้อ้างอิงความรู้และสาธิตแนวคิดทางคณิตศาสตร์ในชั้นเรียน

## Materials

- [Logistic Growth Functions](interactive/logistic-growth.html) — ปรับค่า `a`, `b`, `c` เพื่อสำรวจกราฟของฟังก์ชันโลจิสติกและขอบเขตการเพิ่มปริมาณ

### ม.3 — สถิติ

- [ทบทวนแผนภาพกล่อง (Box Plot) แบบโต้ตอบ](interactive/statistics/m3-box-plot-review.html) — ใส่ข้อมูลแล้วระบบแสดงขั้นตอนหาค่า Q1/Q2/Q3, IQR, ขอบเขต และค่าผิดปกติ พร้อมวาด Box Plot ให้อัตโนมัติ

### ม.5 บทที่ 0 — ทบทวนความสัมพันธ์และฟังก์ชัน

- [ความสัมพันธ์กับฟังก์ชัน](interactive/m5-relation-vs-function.html) — สร้างลูกศรจากเซต A ไปเซต B เพื่อตรวจว่าเป็นฟังก์ชันหรือไม่ พร้อมนิยามวิชาการด้วย KaTeX
- [โดเมน โคโดเมน และเรนจ์](interactive/m5-domain-codomain-range.html) — สำรวจความแตกต่างระหว่าง domain, codomain และ range ผ่าน mapping diagram แบบ interactive
- [One-to-one และ Onto](interactive/m5-one-to-one-onto.html) — สร้าง mapping เพื่อตรวจสอบ injective, surjective และ bijective ด้วยภาพลูกศร
- [Inverse Function](interactive/m5-inverse-function.html) — ตรวจสอบว่า mapping มี inverse function หรือไม่ ผ่านเงื่อนไข bijective และตัวอย่างหลายกรณี

### 01422111 หลักสถิติ

- [Statistics Interactive Teaching Assistant (Streamlit)](https://stat-distribution-solver-naaptzyidcew7rrys9xj2q.streamlit.app/) — แอป Streamlit สำหรับการแจกแจงทวินาม ปัวซง Z t ไคสแควร์ F และการแจกแจงค่าสถิติ พร้อมวิธีทำทีละขั้นด้วย KaTeX (แอปจะหลับเมื่อไม่ได้ใช้ ให้กดปุ่ม Wake up เพื่อปลุกก่อนใช้งาน)
- [บทที่ 3 ตัวแปรสุ่มและการแจกแจงความน่าจะเป็น](interactive/statistics/01422111-ch03-purehtml.html) — สไลด์ interactive สำหรับสำรวจ random variable และ probability distribution พร้อมตัวอย่างคำนวณ
- [บทที่ 9 การทดสอบไคสแควร์ (Chi-Square Test)](interactive/statistics/01422111-ch09-chisquare-purehtml.html) — สไลด์ PureHTML สำหรับการทดสอบความสอดคล้องตามทฤษฎี (Goodness-of-Fit) และตารางการจรณ์ (Contingency Table) พร้อมธีม Halloween Spooky / Academic Clean Light
- [สถิติสลากกินแบ่งรัฐบาลไทย (2 ตัว, 3 ตัว, รางวัลที่ 1 & สุ่ม 20 เบอร์)](interactive/thai-lottery-stats/index.html) — เว็บแอปสำรวจสถิติย้อนหลัง 24 ปี (627 งวด), Chi-Square Test, พิสูจน์ทฤษฎีบทลิมิตศูนย์กลาง (CLT), พอร์ต 20 เบอร์เด็ด vs สุ่ม 20 ตัว, ตรวจสลากย้อนหลังทุกรางวัล 20 ปี และเทคนิคการซื้อให้ปลอดภัย

## GitHub Pages

Repository นี้เตรียมไว้สำหรับเปิด GitHub Pages จาก branch `main` และ folder `/` (root)

หลังสร้าง repository และ push แล้ว เปิดใช้งานได้ด้วย:

```bash
gh api --method POST /repos/<owner>/Math-materials/pages -f source.branch=main -f source.path=/
```

หรือใน GitHub UI:

Settings → Pages → Build and deployment → Deploy from a branch → `main` / `/ (root)`
