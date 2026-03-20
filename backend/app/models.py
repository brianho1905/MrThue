from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(120))
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True, unique=True, index=True)
    plan_tier: Mapped[str] = mapped_column(String(32), default="free")  # free | pro — dự phòng thu phí
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    funnel_sessions: Mapped[list["FunnelSession"]] = relationship(back_populates="user")


class Funnel(Base):
    __tablename__ = "funnels"
    __table_args__ = (UniqueConstraint("slug", name="uq_funnels_slug"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(160))
    slug: Mapped[str] = mapped_column(String(80), index=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    start_node_key: Mapped[str] = mapped_column(String(80))
    config_json: Mapped[str] = mapped_column(Text, default="{}")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    nodes: Mapped[list["FunnelNode"]] = relationship(back_populates="funnel", cascade="all, delete-orphan")


class FunnelNode(Base):
    __tablename__ = "funnel_nodes"
    __table_args__ = (UniqueConstraint("funnel_id", "node_key", name="uq_funnel_node_key"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    funnel_id: Mapped[int] = mapped_column(ForeignKey("funnels.id", ondelete="CASCADE"), index=True)
    node_key: Mapped[str] = mapped_column(String(80))
    kind: Mapped[str] = mapped_column(String(32))  # question | lead | result
    title: Mapped[str] = mapped_column(String(255))
    body: Mapped[str] = mapped_column(Text, default="")
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    lead_next_node_key: Mapped[str | None] = mapped_column(String(80), nullable=True)

    funnel: Mapped[Funnel] = relationship(back_populates="nodes")
    choices: Mapped[list["FunnelChoice"]] = relationship(back_populates="node", cascade="all, delete-orphan")


class FunnelChoice(Base):
    __tablename__ = "funnel_choices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    node_id: Mapped[int] = mapped_column(ForeignKey("funnel_nodes.id", ondelete="CASCADE"), index=True)
    label: Mapped[str] = mapped_column(String(255))
    value: Mapped[str] = mapped_column(String(120))
    next_node_key: Mapped[str] = mapped_column(String(80))
    score_delta: Mapped[int] = mapped_column(Integer, default=0)
    insight_after: Mapped[str | None] = mapped_column(Text, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)

    node: Mapped[FunnelNode] = relationship(back_populates="choices")


class FunnelSession(Base):
    __tablename__ = "funnel_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    funnel_id: Mapped[int] = mapped_column(ForeignKey("funnels.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    current_node_key: Mapped[str] = mapped_column(String(80))
    score: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(32), default="in_progress")  # in_progress | completed
    full_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    result_snapshot_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    funnel: Mapped[Funnel] = relationship()
    user: Mapped["User | None"] = relationship(back_populates="funnel_sessions")
    answers: Mapped[list["FunnelSessionAnswer"]] = relationship(
        back_populates="session", cascade="all, delete-orphan"
    )


class FunnelSessionAnswer(Base):
    __tablename__ = "funnel_session_answers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("funnel_sessions.id", ondelete="CASCADE"), index=True)
    node_key: Mapped[str] = mapped_column(String(80))
    choice_value: Mapped[str | None] = mapped_column(String(255), nullable=True)
    insight_after: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    session: Mapped[FunnelSession] = relationship(back_populates="answers")
