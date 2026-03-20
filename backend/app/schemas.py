from __future__ import annotations

from typing import Any

from pydantic import BaseModel, EmailStr, Field


class HealthResponse(BaseModel):
    status: str


class FunnelChoicePublic(BaseModel):
    label: str
    value: str


class FunnelNodePublic(BaseModel):
    key: str
    kind: str
    title: str
    body: str
    choices: list[FunnelChoicePublic]


class FunnelManifestResponse(BaseModel):
    slug: str
    name: str
    start_node_key: str
    nodes: list[FunnelNodePublic]


class StartSessionResponse(BaseModel):
    session_id: int
    node: FunnelNodePublic
    score: int


class AnswerRequest(BaseModel):
    choice_value: str = Field(min_length=1, max_length=120)


class LeadRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=8, max_length=30)


class AnswerResponse(BaseModel):
    session_id: int
    score: int
    insight_after: str | None = None
    completed: bool
    node: FunnelNodePublic
    result: dict[str, Any] | None = None


class ReportResponse(BaseModel):
    session_id: int
    funnel_id: int
    title: str
    body: str
    compliance_score: int
    risk_level: str
    next_best_action: str
    preliminary_advice: str
    contact: dict[str, Any]


class AdminFunnelSummary(BaseModel):
    id: int
    name: str
    slug: str
    is_published: bool
    start_node_key: str
    updated_at: str | None = None


class AdminFunnelCreate(BaseModel):
    name: str
    slug: str
    is_published: bool = False
    start_node_key: str
    config: dict[str, Any] = Field(default_factory=dict)
    nodes: list[dict[str, Any]] = Field(default_factory=list)


class AdminFunnelGraph(BaseModel):
    name: str
    slug: str
    is_published: bool
    start_node_key: str
    config: dict[str, Any]
    nodes: list[dict[str, Any]]


class UserPublic(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    phone: str | None
    plan_tier: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=120)
    phone: str | None = Field(default=None, max_length=30)
    funnel_session_id: int | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class ConsultationSummary(BaseModel):
    session_id: int
    funnel_id: int
    status: str
    score: int
    report_title: str | None = None
    compliance_score: int | None = None
    created_at: str | None = None


class MessageResponse(BaseModel):
    message: str
