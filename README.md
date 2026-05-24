# Math Materials

คลังสื่อ HTML แบบ interactive สำหรับใช้อ้างอิงความรู้และสาธิตแนวคิดทางคณิตศาสตร์ในชั้นเรียน

## Materials

- [Logistic Growth Functions](interactive/logistic-growth.html) — ปรับค่า `a`, `b`, `c` เพื่อสำรวจกราฟของฟังก์ชันโลจิสติกและขอบเขตการเพิ่มปริมาณ

## GitHub Pages

Repository นี้เตรียมไว้สำหรับเปิด GitHub Pages จาก branch `main` และ folder `/` (root)

หลังสร้าง repository และ push แล้ว เปิดใช้งานได้ด้วย:

```bash
gh api --method POST /repos/<owner>/Math-materials/pages -f source.branch=main -f source.path=/
```

หรือใน GitHub UI:

Settings → Pages → Build and deployment → Deploy from a branch → `main` / `/ (root)`
