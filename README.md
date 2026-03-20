# MrThue — Layout + Backend + MySQL + CMS Funnel

## Cấu trúc
- `frontend/` — Next.js (trang chủ, `/tu-van`, `/bao-cao/[sessionId]`, CMS `/admin`)
- `backend/` — FastAPI (public funnel API + admin API)
- `docs/` — kiến trúc & hợp đồng API
- `Layout/` — tham chiếu Stitch/HTML gốc (DESIGN.md + code.html)

## Chạy nhanh

Hướng dẫn đầy đủ (MySQL, env, dev/prod frontend, Docker, xử lý sự cố): **`docs/DEPLOYMENT.md`**.

Tóm tắt:

```bash
# Backend
cd backend && cp .env.example .env
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend (terminal khác)
cd frontend && cp .env.example .env.local && npm install && npm run dev
```

- API docs: http://localhost:8000/docs  
- CMS funnel: http://localhost:3000/admin (cần `MRTHUE_ADMIN_KEY` = `ADMIN_API_KEY`)

## Docker Compose

```bash
docker compose up --build
```

Chi tiết biến môi trường: `docs/DEPLOYMENT.md`.

## Tài liệu

- `docs/DEPLOYMENT.md` — **deploy & chạy thử**
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/FUNNEL.md`
- `docs/ACCOUNTS_AND_BILLING.md` — **tài khoản, lưu phiên, hướng thu phí**
- `docs/LEGAL_DISCLAIMER.md` — **miễn trừ trách nhiệm tư vấn**
- `docs/GITHUB_DEPLOYMENT.md` — **deploy bằng GitHub Actions**
