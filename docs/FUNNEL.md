# CMS Funnel — cách cấu hình

## Node kinds
- `question`: có `choices[]` (mỗi choice có `next_node_key`, `score_delta`, `insight_after?`).
- `lead`: không cần choices; bắt buộc `lead_next_node_key` trỏ tới bước kế (thường là `result`).
- `result`: node kết thúc; `body` là template báo cáo.

## Placeholder trong `result.body`
- `{{score}}` — điểm sau clamp
- `{{risk_level}}`, `{{next_action}}`, `{{advice}}` — lấy từ `config.bands` (theo ngưỡng `max`)

## `config` (JSON trên funnel)
Ví dụ:
```json
{
  "base_score": 80,
  "score_bounds": { "min": 5, "max": 95 },
  "bands": [
    { "max": 29, "risk": "Cao", "action": "...", "advice": "..." },
    { "max": 59, "risk": "Trung bình", "action": "...", "advice": "..." },
    { "max": 95, "risk": "Thấp", "action": "...", "advice": "..." }
  ]
}
```

## Publish
Chỉ funnel `is_published=true` mới được public API sử dụng.

## Seed mặc định
Slug: `hkd-default` — được tạo tự động nếu chưa tồn tại (startup backend).
