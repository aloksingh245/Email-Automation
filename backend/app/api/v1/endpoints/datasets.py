from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from uuid import UUID
import csv
import codecs
from app.api import deps
from app.models.campaign import Campaign
from app.models.contact import HRContact

router = APIRouter()

@router.post("/upload")
def upload_dataset(
    campaign_id: UUID = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db)
):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    csv_reader = csv.DictReader(codecs.iterdecode(file.file, 'utf-8'))
    
    contacts_to_insert = []
    for row in csv_reader:
        # Assuming CSV has headers: name, email, title, company
        contact = HRContact(
            campaign_id=campaign_id,
            name=row.get('name', ''),
            email=row.get('email', ''),
            title=row.get('title', ''),
            company=row.get('company', ''),
            status='NOT_SENT'
        )
        contacts_to_insert.append(contact)
    
    db.bulk_save_objects(contacts_to_insert)
    campaign.total_contacts += len(contacts_to_insert)
    db.commit()
    
    return {"message": f"Successfully uploaded {len(contacts_to_insert)} contacts."}
