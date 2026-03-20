# MrThue API

## Health
### `GET /health`
```json
{ "status": "ok" }
```

## Public — Funnel runtime
Base: `/api/public/funnels`

### `GET /{slug}/manifest`
Trả về toàn bộ node/choice **ẩn hướng đi & điểm** (chỉ label/value) — dùng khi cần preview UI.

### `POST /{slug}/sessions`
Tạo phiên, trả `session_id`, `node` đầu tiên, `score` ban đầu (theo `config.base_score`).

**Tuỳ chọn:** header `Authorization: Bearer <access_token>` — nếu token hợp lệ, phiên mới gắn `user_id` ngay (khách đã đăng nhập).

### `POST /sessions/{session_id}/answer`
Body:
```json
{ "choice_value": "da_dang_ky" }
```
Trả `node` tiếp theo, `insight_after` (nếu có), `score` sau khi cộng `score_delta`, `completed` nếu vào node `result`.

### `POST /sessions/{session_id}/lead`
Body:
```json
{ "full_name": "Nguyen A", "phone": "0901234567" }
```
Dùng khi node hiện tại là `lead`. Sau đó chuyển sang node kế (`lead_next_node_key`), thường là `result`.

### `GET /sessions/{session_id}/report`
Trả snapshot báo cáo sau khi hoàn tất.

## Auth — Tài khoản & lưu phiên
Base: `/api/auth`

### `POST /register`
Body:
```json
{
  "email": "a@b.com",
  "password": "********",
  "full_name": "Nguyen A",
  "phone": "0901234567",
  "funnel_session_id": 12
}
```
- `phone`, `funnel_session_id` tuỳ chọn.
- Nếu `funnel_session_id` trỏ tới phiên đang `user_id` null → gắn phiên cho user mới.
- Trả `access_token` (JWT) + `user`.

### `POST /login`
Body: `{ "email", "password" }` → `access_token` + `user`.

### `GET /me`
Header: `Authorization: Bearer <token>` → thông tin user.

### `POST /sessions/{session_id}/claim`
Header Bearer — gắn phiên vào user hiện tại (phiên chưa có owner hoặc đã là của user).

### `GET /consultations`
Header Bearer — danh sách phiên funnel đã gắn `user_id`, mới nhất trước.

## Admin — CMS Funnel
Header bắt buộc: `X-Admin-Key: <ADMIN_API_KEY>` (khớp env backend).

### `GET /api/admin/funnels`
Danh sách funnel.

### `POST /api/admin/funnels`
Tạo funnel + graph ban đầu (body theo `AdminFunnelCreate`).

### `GET /api/admin/funnels/{id}/graph`
Lấy graph đầy đủ cho CMS (gồm `next_node_key`, `score_delta`, `insight_after`...).

### `PUT /api/admin/funnels/{id}/graph`
Thay thế toàn bộ graph (transaction): xóa node/choice cũ, ghi mới.

> Gợi ý: dùng UI `/admin` (Next.js server actions) để không lộ admin key ra browser.
