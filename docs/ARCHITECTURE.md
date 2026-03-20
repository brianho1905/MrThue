# MrThue — Kiến trúc (layout + backend + DB + CMS funnel)

## Tổng quan
- **Frontend (Next.js)**: layout theo hướng Stitch/DESIGN.md; trang `/tu-van` chạy funnel động từ API; `/bao-cao/[sessionId]` hiển thị snapshot; `/admin` là CMS nội bộ (JSON graph).
- **Backend (FastAPI)**: public API điều hành phiên; admin API để biên tập funnel; seed funnel mặc định `hkd-default`.
- **MySQL**: lưu định nghĩa funnel (nodes/choices) + phiên người dùng + câu trả lời.

## DB — các bảng chính
- `users`: email (unique), password hash, họ tên, phone (unique nullable), `plan_tier` (mặc định `free`, dự phòng thu phí).
- `funnels`: slug, publish flag, `start_node_key`, `config_json` (base_score, score_bounds, bands...).
- `funnel_nodes`: `node_key`, `kind` (`question|lead|result`), title/body, `lead_next_node_key` (cho lead).
- `funnel_choices`: nhánh `next_node_key`, `score_delta`, `insight_after`.
- `funnel_sessions`: `user_id` (nullable, FK users), trạng thái phiên, điểm, lead info, snapshot kết quả.
- `funnel_session_answers`: log theo bước.

## Auth
- JWT (HS256), env `JWT_SECRET_KEY` / `JWT_EXPIRE_MINUTES`.
- Đăng ký/đăng nhập: `/api/auth/*`; frontend lưu token, gửi Bearer khi cần.

## Luồng runtime
1. `POST /sessions` → khởi tạo điểm theo `base_score` (tuỳ chọn Bearer → gắn `user_id`).
2. Mỗi `answer` → cộng `score_delta`, clamp theo `score_bounds`, trả insight (tuỳ choice).
3. `lead` → lưu contact, nhảy tới `result`.
4. `result` → build snapshot (thay placeholder `{{score}}`, `{{risk_level}}`, `{{next_action}}`, `{{advice}}`).

## CMS
- Biên tập graph qua **PUT** (thay toàn bộ) để đơn giản & nhất quán.
- UI: `/admin` gọi backend bằng server env `BACKEND_URL` + `MRTHUE_ADMIN_KEY`.

## Mở rộng gợi ý
- UI builder kéo thả thay JSON.
- Versioning funnel + A/B slug.
- Phân quyền admin & audit log thay đổi graph.
