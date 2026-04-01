from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime

class SenderAccountBase(BaseModel):
    email: EmailStr
    smtp_host: str
    smtp_port: int
    smtp_username: Optional[str] = None
    daily_limit: int = 500

class SenderAccountCreate(SenderAccountBase):
    smtp_password: str

class SenderAccountUpdate(BaseModel):
    daily_limit: Optional[int] = None
    status: Optional[str] = None

class SenderAccountResponse(SenderAccountBase):
    id: UUID
    user_id: UUID
    sent_today: int
    status: str
    last_used_at: Optional[datetime]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
