# Math Materials

คลังสื่อ HTML แบบ interactive สำหรับใช้อ้างอิงความรู้และสาธิตแนวคิดทางคณิตศาสตร์ในชั้นเรียน

## Materials

- [Logistic Growth Functions](interactive/logistic-growth.html) — ปรับค่า `a`, `b`, `c` เพื่อสำรวจกราฟของฟังก์ชันโลจิสติกและขอบเขตการเพิ่มปริมาณ

### ม.5 บทที่ 0 — ทบทวนความสัมพันธ์และฟังก์ชัน

- [ความสัมพันธ์กับฟังก์ชัน](interactive/m5-relation-vs-function.html) — สร้างลูกศรจากเซต A ไปเซต B เพื่อตรวจว่าเป็นฟังก์ชันหรือไม่ พร้อมนิยามวิชาการด้วย KaTeX
- [โดเมน โคโดเมน และเรนจ์](interactive/m5-domain-codomain-range.html) — สำรวจความแตกต่างระหว่าง domain, codomain และ range ผ่าน mapping diagram แบบ interactive
- [One-to-one และ Onto](interactive/m5-one-to-one-onto.html) — สร้าง mapping เพื่อตรวจสอบ injective, surjective และ bijective ด้วยภาพลูกศร
- [Inverse Function](interactive/m5-inverse-function.html) — ตรวจสอบว่า mapping มี inverse function หรือไม่ ผ่านเงื่อนไข bijective และตัวอย่างหลายกรณี

### 01422111 หลักสถิติ

- [บทที่ 3 ตัวแปรสุ่มและการแจกแจงความน่าจะเป็น](interactive/statistics/01422111-ch03-purehtml.html) — สไลด์ interactive สำหรับสำรวจ random variable และ probability distribution พร้อมตัวอย่างคำนวณ

## GitHub Pages

Repository นี้เตรียมไว้สำหรับเปิด GitHub Pages จาก branch `main` และ folder `/` (root)

หลังสร้าง repository และ push แล้ว เปิดใช้งานได้ด้วย:

```bash
gh api --method POST /repos/<owner>/Math-materials/pages -f source.branch=main -f source.path=/
```

หรือใน GitHub UI:

Settings → Pages → Build and deployment → Deploy from a branch → `main` / `/ (root)`
