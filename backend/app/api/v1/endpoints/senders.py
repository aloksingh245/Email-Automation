from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.api import deps
from app.models.sender import SenderAccount
from app.schemas.sender import SenderAccountCreate, SenderAccountResponse, SenderAccountUpdate

router = APIRouter()
MOCK_USER_ID = "00000000-0000-0000-0000-000000000000"

@router.post("/add", response_model=SenderAccountResponse)
def add_sender(sender_in: SenderAccountCreate, db: Session = Depends(deps.get_db)):
    sender = SenderAccount(
        user_id=MOCK_USER_ID,
        email=sender_in.email,
        smtp_host=sender_in.smtp_host,
        smtp_port=sender_in.smtp_port,
        smtp_username=sender_in.smtp_username or sender_in.email,
        smtp_password=sender_in.smtp_password,
        daily_limit=sender_in.daily_limit
    )
    db.add(sender)
    db.commit()
    db.refresh(sender)
    return sender

@router.get("/", response_model=List[SenderAccountResponse])
def get_senders(db: Session = Depends(deps.get_db)):
    return db.query(SenderAccount).all()

@router.patch("/{id}/disable")
def disable_sender(id: UUID, db: Session = Depends(deps.get_db)):
    sender = db.query(SenderAccount).filter(SenderAccount.id == id).first()
    if not sender:
        raise HTTPException(status_code=404, detail="Sender account not found")
    
    sender.status = "DISABLED"
    db.commit()
    return {"message": "Sender account disabled successfully"}
