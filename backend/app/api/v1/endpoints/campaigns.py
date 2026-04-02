from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from app.api import deps
from app.models.campaign import Campaign
from app.models.contact import HRContact
from app.schemas.campaign import CampaignCreate, CampaignResponse
from app.worker.tasks import start_campaign_task

router = APIRouter()

# Mock user_id for now
MOCK_USER_ID = "00000000-0000-0000-0000-000000000000"

@router.post("/create", response_model=CampaignResponse)
def create_campaign(
    campaign_in: CampaignCreate,
    db: Session = Depends(deps.get_db)
):
    campaign = Campaign(
        user_id=MOCK_USER_ID,
        campaign_name=campaign_in.campaign_name,
        template_id=campaign_in.template_id,
        attachment_path=campaign_in.attachment_path,
        status="CREATED"
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign

@router.get("/", response_model=List[CampaignResponse])
def get_campaigns(db: Session = Depends(deps.get_db)):
    return db.query(Campaign).all()

@router.post("/{id}/start")
def start_campaign(id: UUID, db: Session = Depends(deps.get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign.status in ["RUNNING", "COMPLETED"]:
        raise HTTPException(status_code=400, detail="Campaign already running or completed")

    campaign.status = "RUNNING"
    db.commit()
    
    try:
        # Trigger Celery Task
        start_campaign_task.delay(str(campaign.id))
    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        raise HTTPException(status_code=500, detail=f"Celery Error: {str(e)}\n{error_msg}")
    
    return {"message": "Campaign started successfully"}

@router.post("/{id}/pause")
def pause_campaign(id: UUID, db: Session = Depends(deps.get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    campaign.status = "PAUSED"
    db.commit()
    return {"message": "Campaign paused successfully"}

@router.get("/{id}/stats")
def campaign_stats(id: UUID, db: Session = Depends(deps.get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
        
    total = db.query(HRContact).filter(HRContact.campaign_id == id).count()
    sent = db.query(HRContact).filter(HRContact.campaign_id == id, HRContact.status == "SENT").count()
    failed = db.query(HRContact).filter(HRContact.campaign_id == id, HRContact.status == "FAILED").count()
    pending = total - sent - failed
    
    return {
        "total": total,
        "sent": sent,
        "failed": failed,
        "pending": pending,
        "progress_percent": (sent / total * 100) if total > 0 else 0
    }
