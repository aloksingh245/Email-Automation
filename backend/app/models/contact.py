import uuid
from sqlalchemy import Column, String, Integer, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class HRContact(Base):
    __tablename__ = "hr_contacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    title = Column(String, nullable=True)
    company = Column(String, nullable=True)
    status = Column(String, default="NOT_SENT") # NOT_SENT, IN_PROGRESS, SENT, FAILED, REPLIED
    sender_id = Column(UUID(as_uuid=True), ForeignKey("sender_accounts.id", ondelete="SET NULL"), nullable=True)
    retry_count = Column(Integer, default=0)
    last_attempt = Column(DateTime(timezone=True), nullable=True)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    campaign = relationship("Campaign", backref="contacts")
    sender = relationship("SenderAccount")
