from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.api import deps
from app.models.template import EmailTemplate
from app.schemas.template import EmailTemplateCreate, EmailTemplateResponse

router = APIRouter()
MOCK_USER_ID = "00000000-0000-0000-0000-000000000000"

@router.post("/create", response_model=EmailTemplateResponse)
def create_template(template_in: EmailTemplateCreate, db: Session = Depends(deps.get_db)):
    template = EmailTemplate(
        user_id=MOCK_USER_ID,
        template_name=template_in.template_name,
        subject=template_in.subject,
        body=template_in.body
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return template

@router.get("/", response_model=List[EmailTemplateResponse])
def get_templates(db: Session = Depends(deps.get_db)):
    return db.query(EmailTemplate).all()

@router.delete("/{id}")
def delete_template(id: UUID, db: Session = Depends(deps.get_db)):
    template = db.query(EmailTemplate).filter(EmailTemplate.id == id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    db.delete(template)
    db.commit()
    return {"message": "Template deleted successfully"}
