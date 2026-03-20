CREATE DATABASE IF NOT EXISTS mrthue CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
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

CREATE TABLE IF NOT EXISTS funnels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(80) NOT NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  start_node_key VARCHAR(80) NOT NULL,
  config_json LONGTEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_funnels_slug (slug)
);

CREATE TABLE IF NOT EXISTS funnel_nodes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  funnel_id INT NOT NULL,
  node_key VARCHAR(80) NOT NULL,
  kind VARCHAR(32) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body LONGTEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  lead_next_node_key VARCHAR(80) NULL,
  UNIQUE KEY uq_funnel_node_key (funnel_id, node_key),
  CONSTRAINT fk_funnel_nodes_funnel
    FOREIGN KEY (funnel_id) REFERENCES funnels(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS funnel_choices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  node_id INT NOT NULL,
  label VARCHAR(255) NOT NULL,
  value VARCHAR(120) NOT NULL,
  next_node_key VARCHAR(80) NOT NULL,
  score_delta INT NOT NULL DEFAULT 0,
  insight_after LONGTEXT NULL,
  display_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_funnel_choices_node
    FOREIGN KEY (node_id) REFERENCES funnel_nodes(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS funnel_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  funnel_id INT NOT NULL,
  user_id INT NULL,
  current_node_key VARCHAR(80) NOT NULL,
  score INT NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'in_progress',
  full_name VARCHAR(120) NULL,
  phone VARCHAR(30) NULL,
  result_snapshot_json LONGTEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_funnel_sessions_user_id (user_id),
  CONSTRAINT fk_funnel_sessions_funnel
    FOREIGN KEY (funnel_id) REFERENCES funnels(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_funnel_sessions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS funnel_session_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  node_key VARCHAR(80) NOT NULL,
  choice_value VARCHAR(255) NULL,
  insight_after LONGTEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_funnel_session_answers_session
    FOREIGN KEY (session_id) REFERENCES funnel_sessions(id)
    ON DELETE CASCADE
);
