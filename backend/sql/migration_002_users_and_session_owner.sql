-- Chạy thủ công nếu DB đã tồn tại từ bản cũ (chưa có bảng users / cột user_id).
USE mrthue;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(30) NULL,
  plan_tier VARCHAR(32) NOT NULL DEFAULT 'free',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_phone (phone)
);

ALTER TABLE funnel_sessions ADD COLUMN user_id INT NULL AFTER funnel_id;
ALTER TABLE funnel_sessions ADD INDEX idx_funnel_sessions_user_id (user_id);
ALTER TABLE funnel_sessions
  ADD CONSTRAINT fk_funnel_sessions_user
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE SET NULL;
