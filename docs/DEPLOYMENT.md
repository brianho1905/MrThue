# Hướng dẫn deploy & chạy thử (MrThue)

Tài liệu này mô tả cách chạy **full stack** (Next.js + FastAPI + MySQL) trên máy local hoặc Docker để xem giao diện và luồng funnel/CMS.

---

## Yêu cầu

| Thành phần | Ghi chú |
|------------|---------|
| **Node.js** | Để chạy frontend (`npm`) |
| **Python 3.11+** | Để chạy backend (khuyến nghị dùng `venv`) |
| **MySQL 8** | Server MySQL đang chạy, có user/password hợp lệ |
| **Docker Desktop** *(tuỳ chọn)* | Nếu muốn `docker compose up` |

---

## 1. Chuẩn bị database

1. Tạo database (nếu chưa có):

```sql
CREATE DATABASE IF NOT EXISTS mrthue CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mrthue'@'localhost' IDENTIFIED BY 'mrthue2026';
GRANT ALL PRIVILEGES ON mrthue.* TO 'mrthue'@'localhost';
```

2. Import schema ban đầu (bảng funnel, session…):

```bash
mysql -h 127.0.0.1 -u <USER> -p mrthue < backend/sql/init.sql
```

> Nếu dùng user khác `mrthue`, hãy cập nhật `DATABASE_URL` trong `backend/.env` cho khớp.

---

## 2. Cấu hình Backend (`backend/.env`)

Copy từ mẫu:

```bash
cd backend
cp .env.example .env
```

Sửa tối thiểu các biến sau:

| Biến | Mô tả |
|------|--------|
| `DATABASE_URL` | `mysql+pymysql://USER:PASSWORD@127.0.0.1:3306/mrthue` |
| `FRONTEND_ORIGIN` | Origin của Next.js (ví dụ `http://localhost:3000` hoặc `http://localhost:4100`) — dùng cho CORS |
| `ADMIN_API_KEY` | Chuỗi bí mật cho API admin (`X-Admin-Key`) |
| `JWT_SECRET_KEY` | **Bắt buộc đổi trên production** — ký JWT đăng nhập |
| `JWT_EXPIRE_MINUTES` | Tuỳ chọn — thời hạn token (ví dụ `10080` ≈ 7 ngày) |

**Lưu ý MySQL 8 + PyMySQL:** gói `cryptography` đã nằm trong `backend/requirements.txt` để hỗ trợ xác thực kiểu `caching_sha2_password`.

---

## 3. Chạy Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8010
```

- Swagger: [http://localhost:8010/docs](http://localhost:8010/docs)
- Health: [http://localhost:8010/health](http://localhost:8010/health)
- Funnel mặc định `hkd-default` được **seed tự động** khi startup nếu chưa tồn tại.

---

## 4. Cấu hình Frontend (`frontend/.env.local`)

```bash
cd frontend
cp .env.example .env.local
```

| Biến | Mô tả |
|------|--------|
| `NEXT_PUBLIC_API_BASE_URL` | URL backend mà **trình duyệt** gọi (thường `http://localhost:8000`) |
| `BACKEND_URL` | URL backend mà **Next.js server** gọi (local: cũng `http://localhost:8000`) |
| `MRTHUE_ADMIN_KEY` | Trùng `ADMIN_API_KEY` — chỉ dùng phía server (trang `/admin`) |

---

## 5. Chạy Frontend

### Chế độ dev (hot reload)

```bash
cd frontend
npm install
npm run dev
```

Mặc định: [http://localhost:3000](http://localhost:3000)

### Chế độ “giống production” (ít watcher)

```bash
cd frontend
npm run build
npm run start
# hoặc đổi port: npm run start -- -p 4100
```

**Gợi ý:** Nếu macOS báo `EMFILE: too many open files` khi `next dev`, thử tăng `ulimit -n` hoặc dùng `npm run build && npm run start`.

---

## 6. URL để kiểm tra

(Thay port nếu bạn đổi cổng Next.js.)

| Mục đích | Đường dẫn |
|----------|-----------|
| Trang chủ | `/` |
| Phễu tư vấn | `/tu-van` |
| Báo cáo (sau khi hoàn tất phiên) | `/bao-cao/[sessionId]` |
| CMS funnel (nội bộ) | `/admin` |

---

## 7. Docker Compose *(tuỳ chọn)*

Trên máy đã cài Docker:

```bash
docker compose up --build
```

- Trình duyệt gọi API qua `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`
- Next.js **server** gọi backend nội bộ qua `BACKEND_URL=http://backend:8000`

Đảm bảo `ADMIN_API_KEY` (backend) và `MRTHUE_ADMIN_KEY` (frontend) **trùng nhau** trong compose/env.

---

## 8. Xử lý sự cố thường gặp

| Triệu chứng | Hướng xử lý |
|--------------|-------------|
| `Access denied for user ...` | Sai user/password hoặc user chưa có quyền DB `mrthue`; sửa `DATABASE_URL`. |
| `Can't connect to MySQL server` | MySQL chưa chạy; bật service MySQL trên máy hoặc dùng Docker. |
| CORS error trên browser | `FRONTEND_ORIGIN` trong backend phải **khớp** đúng origin (kể cả port) của Next.js. |
| `/admin` báo lỗi gọi API | Kiểm tra `BACKEND_URL`, `MRTHUE_ADMIN_KEY`, backend đang listen `:8000`. |
| Phễu không tạo được phiên | Backend không chạy hoặc `NEXT_PUBLIC_API_BASE_URL` sai. |

---

## 9. Tài liệu liên quan

- Kiến trúc: `docs/ARCHITECTURE.md`
- API: `docs/API.md`
- Cấu hình funnel trong CMS: `docs/FUNNEL.md`
- Tài khoản & thu phí (roadmap): `docs/ACCOUNTS_AND_BILLING.md`
- Miễn trừ trách nhiệm tư vấn: `docs/LEGAL_DISCLAIMER.md`
- Deploy bằng GitHub Actions: `docs/GITHUB_DEPLOYMENT.md`
