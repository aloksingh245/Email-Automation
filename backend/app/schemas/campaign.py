from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime

class CampaignBase(BaseModel):
    campaign_name: str
    template_id: Optional[UUID] = None
    attachment_path: Optional[str] = None

class CampaignCreate(CampaignBase):
    pass

class CampaignResponse(CampaignBase):
    id: UUID
    user_id: UUID
    status: str
    total_contacts: int
    sent_count: int
    failed_count: int
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)
