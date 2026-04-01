from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime

class HRContactBase(BaseModel):
    name: str
    email: EmailStr
    title: Optional[str] = None
    company: Optional[str] = None

class HRContactCreate(HRContactBase):
    campaign_id: UUID

class HRContactResponse(HRContactBase):
    id: UUID
    campaign_id: UUID
    status: str
    sender_id: Optional[UUID] = None
    retry_count: int
    last_attempt: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
