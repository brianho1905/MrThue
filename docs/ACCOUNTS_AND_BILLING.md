# Tài khoản, lưu phiên tư vấn & hướng thu phí

## Hiện trạng (v1)

- **Đăng ký / đăng nhập:** email + mật khẩu, kèm họ tên và số điện thoại (tuỳ chọn).
- **JWT** trả về sau `POST /api/auth/register` và `POST /api/auth/login`, lưu ở frontend (`localStorage` key `mrthue_access_token`).
- **Phiên funnel** (`funnel_sessions`) có cột `user_id` (nullable):
  - Khách ẩn danh: `user_id` null cho đến khi đăng ký / claim / bắt đầu phiên khi đã đăng nhập.
  - **Đăng ký kèm `funnel_session_id`:** gắn phiên vừa làm dở hoặc vừa xong vào tài khoản.
  - **`POST /api/auth/sessions/{id}/claim`:** user đã login gắn thêm một phiên (nếu phiên chưa có chủ).
- **Danh sách phiên đã lưu:** `GET /api/auth/consultations` (Bearer).
- **Trường `users.plan_tier`:** mặc định `free` — **placeholder** để sau này bật tính năng trả phí (pro, gói tư vấn, v.v.).

## Luồng gợi ý cho khách

1. Làm phễu tư vấn (ẩn danh hoặc đã login).
2. Xem báo cáo → khối **“Lưu phiên tư vấn”** trên trang báo cáo: đăng ký hoặc đăng nhập + claim.
3. Vào **/tai-khoan** để xem lại các phiên đã gắn tài khoản.

## Hướng mở rộng thu phí (chưa code)

- **Thanh toán:** Stripe / PayOS / VNPay — webhook cập nhật `plan_tier` hoặc bảng `subscriptions` (chu kỳ, hết hạn).
- **Giới hạn theo gói:** ví dụ chỉ `plan_tier=pro` mới xem báo cáo chi tiết / tải PDF / chat chuyên gia.
- **Bảo mật báo cáo:** thay vì public `GET .../report` chỉ bằng `session_id`, có thể yêu cầu Bearer và `session.user_id == current_user.id` hoặc token một lần (share link).

## Biến môi trường backend

- `JWT_SECRET_KEY` — bắt buộc đổi trên production.
- `JWT_EXPIRE_MINUTES` — thời hạn token (mặc định trong code: 7 ngày nếu không set env).

## Migration DB cũ

Nếu database tạo trước khi có `users` / `user_id`, chạy thủ công `backend/sql/migration_002_users_and_session_owner.sql` (kiểm tra trùng cột trước khi chạy lại).
