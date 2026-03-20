from __future__ import annotations

import json

from sqlalchemy.orm import Session

from .models import Funnel, FunnelChoice, FunnelNode


DEFAULT_SLUG = "hkd-default"


def seed_default_funnel(db: Session) -> Funnel | None:
    exists = db.query(Funnel).filter(Funnel.slug == DEFAULT_SLUG).one_or_none()
    if exists:
        return None

    config = {
        "base_score": 80,
        "score_bounds": {"min": 5, "max": 95},
        "bands": [
            {
                "max": 29,
                "risk": "Cao",
                "action": "Đặt lịch tư vấn chuyên gia trong 24h và chuẩn bị hồ sơ đăng ký thuế ngay",
                "advice": "Rủi ro tuân thủ đang ở mức cao, cần hành động ngay để tránh phạt và truy thu.",
            },
            {
                "max": 59,
                "risk": "Trung bình",
                "action": "Rà soát lại hồ sơ thuế và thực hiện checklist tuân thủ trong 7 ngày",
                "advice": "Cần rà soát định kỳ và hoàn thiện các nghĩa vụ còn thiếu.",
            },
            {
                "max": 95,
                "risk": "Thấp",
                "action": "Theo dõi định kỳ và tối ưu cấu trúc thuế theo quý",
                "advice": "Tình hình tương đối ổn, tiếp tục duy trì và tối ưu theo lộ trình.",
            },
        ],
    }

    funnel = Funnel(
        name="Funnel HKD — mặc định",
        slug=DEFAULT_SLUG,
        is_published=True,
        start_node_key="q_tax",
        config_json=json.dumps(config, ensure_ascii=False),
    )
    db.add(funnel)
    db.flush()

    nodes_spec = [
        {
            "key": "q_tax",
            "kind": "question",
            "title": "Bạn đã đăng ký thuế cho hộ kinh doanh chưa?",
            "body": "",
            "order": 0,
            "choices": [
                {
                    "label": "Đã đăng ký",
                    "value": "da_dang_ky",
                    "next": "q_sector",
                    "delta": 0,
                    "insight": "Tuyệt vời — bước đăng ký đã hoàn tất giúp giảm rủi ro pháp lý cơ bản.",
                },
                {
                    "label": "Chưa đăng ký",
                    "value": "chua_dang_ky",
                    "next": "q_sector",
                    "delta": -45,
                    "insight": "Chưa đăng ký thuế là rủi ro lớn — ưu tiên hoàn thiện đăng ký trong thời gian ngắn.",
                },
                {
                    "label": "Đang tìm hiểu",
                    "value": "dang_tim_hieu",
                    "next": "q_sector",
                    "delta": -25,
                    "insight": "Bạn đang ở giai đoạn thích hợp để chuẩn hóa trước khi doanh thu tăng nhanh.",
                },
            ],
        },
        {
            "key": "q_sector",
            "kind": "question",
            "title": "Bạn đang kinh doanh lĩnh vực nào?",
            "body": "",
            "order": 1,
            "choices": [
                {"label": "F&B", "value": "fnb", "next": "q_revenue", "delta": -5, "insight": "F&B thường có nhiều giao dịch tiền mặt — cần chú ý hóa đơn và bảng kê."},
                {"label": "Thương mại/Bán lẻ", "value": "ban_le", "next": "q_revenue", "delta": -5, "insight": "Bán lẻ cần theo dõi tồn kho và doanh thu theo ca để kê khai chính xác."},
                {"label": "Dịch vụ", "value": "dich_vu", "next": "q_revenue", "delta": 0, "insight": "Mô hình dịch vụ thường dễ bóc tách chi phí — hợp lý hóa thuế theo từng hạng mục."},
                {"label": "Khác", "value": "khac", "next": "q_revenue", "delta": 0, "insight": "Chúng ta sẽ tinh chỉnh nhận định khi có thêm thông tin chi tiết ngành nghề."},
            ],
        },
        {
            "key": "q_revenue",
            "kind": "question",
            "title": "Doanh thu trung bình mỗi tháng của bạn?",
            "body": "",
            "order": 2,
            "choices": [
                {"label": "< 50 triệu", "value": "rev_low", "next": "q_location", "delta": 0, "insight": "Quy mô nhỏ vẫn cần tuân thủ — nhưng thủ tục có thể đơn giản hơn."},
                {"label": "50 - 100 triệu", "value": "rev_mid", "next": "q_location", "delta": -8, "insight": "Mức doanh thu này dễ bị quan tâm kiểm tra — nên chuẩn hóa chứng từ."},
                {"label": "> 100 triệu", "value": "rev_high", "next": "q_location", "delta": -15, "insight": "Doanh thu cao đồng nghĩa rủi ro kiểm tra tăng — cần quy trình kê khai rõ ràng."},
            ],
        },
        {
            "key": "q_location",
            "kind": "question",
            "title": "Khu vực hoạt động chính của bạn?",
            "body": "",
            "order": 3,
            "choices": [
                {"label": "Hà Nội", "value": "ha_noi", "next": "lead", "delta": -5, "insight": "Địa bàn lớn thường có tần suất kiểm tra cao hơn — cần lưu trữ hồ sơ chặt chẽ."},
                {"label": "TP.HCM", "value": "ho_chi_minh", "next": "lead", "delta": -5, "insight": "Địa bàn lớn thường có tần suất kiểm tra cao hơn — cần lưu trữ hồ sơ chặt chẽ."},
                {"label": "Tỉnh/Thành khác", "value": "khac", "next": "lead", "delta": 0, "insight": "Tiếp tục duy trì thói quen lưu chứng từ để sẵn sàng khi cơ quan thuế yêu cầu."},
            ],
        },
        {
            "key": "lead",
            "kind": "lead",
            "title": "Để nhận báo cáo tóm gọn, cho chúng tôi thông tin liên hệ",
            "body": "Chúng tôi chỉ dùng thông tin này để liên hệ tư vấn, không chia sẻ cho bên thứ ba.",
            "order": 4,
            "lead_next": "result",
            "choices": [],
        },
        {
            "key": "result",
            "kind": "result",
            "title": "Báo cáo tóm gọn cá nhân hóa",
            "body": (
                "Điểm tuân thủ hiện tại: {{score}}. Mức rủi ro: {{risk_level}}. "
                "{{advice}} Đề xuất hành động: {{next_action}}"
            ),
            "order": 5,
            "choices": [],
        },
    ]

    for spec in nodes_spec:
        node = FunnelNode(
            funnel_id=funnel.id,
            node_key=spec["key"],
            kind=spec["kind"],
            title=spec["title"],
            body=spec.get("body", ""),
            display_order=int(spec["order"]),
            lead_next_node_key=spec.get("lead_next"),
        )
        db.add(node)
        db.flush()
        for cidx, c in enumerate(spec.get("choices") or []):
            db.add(
                FunnelChoice(
                    node_id=node.id,
                    label=c["label"],
                    value=c["value"],
                    next_node_key=c["next"],
                    score_delta=int(c.get("delta", 0)),
                    insight_after=c.get("insight"),
                    display_order=cidx,
                )
            )

    db.commit()
    db.refresh(funnel)
    return funnel
