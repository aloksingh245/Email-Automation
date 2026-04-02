import time
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.worker.celery_app import celery_app
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.campaign import Campaign
from app.models.contact import HRContact
from app.models.sender import SenderAccount
from app.models.template import EmailTemplate
from app.models.log import EmailLog
from jinja2 import Template

def get_next_sender(db: Session, campaign_id):
    # Retrieve active senders that haven't reached their daily limit
    # For a real implementation, we could track send limits carefully here
    # and order by least recently used
    senders = db.query(SenderAccount).filter(
        SenderAccount.status == "ACTIVE",
        SenderAccount.sent_today < SenderAccount.daily_limit
    ).order_by(SenderAccount.last_used_at.asc()).all()
    
    if not senders:
        return None
    return senders[0]

@celery_app.task(name="app.worker.tasks.start_campaign_task", bind=True, max_retries=3)
def start_campaign_task(self, campaign_id: str):
    db: Session = SessionLocal()
    try:
        campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign or campaign.status != "RUNNING":
            return "Campaign stopped or paused"

        template = db.query(EmailTemplate).filter(EmailTemplate.id == campaign.template_id).first()
        jinja_body_template = Template(template.body) if template else Template("Hi {{name}},")
        jinja_subject_template = Template(template.subject) if template else Template("Regarding Opportunities")

        while True:
            # Refresh campaign status in case user paused it
            db.refresh(campaign)
            if campaign.status != "RUNNING":
                break

            # Fetch next unsent contact using SKIP LOCKED to be safe for multiple workers
            # In SQLite SKIP LOCKED is not supported, but we are using PostgreSQL.
            # Using raw SQL for skip locked or SQLAlchemy equivalent.
            contact = db.query(HRContact).filter(
                HRContact.campaign_id == campaign_id,
                HRContact.status == "NOT_SENT"
            ).with_for_update(skip_locked=True).first()

            if not contact:
                campaign.status = "COMPLETED"
                db.commit()
                break

            # Mark IN_PROGRESS to ensure another worker doesn't pick it up
            contact.status = "IN_PROGRESS"
            db.commit()

            sender = get_next_sender(db, campaign_id)
            if not sender:
                # No senders available, pause the campaign
                campaign.status = "PAUSED"
                contact.status = "NOT_SENT"
                db.commit()
                break

            # Send Email Logic
            try:
                # Render template
                rendered_body = jinja_body_template.render(
                    name=contact.name,
                    company=contact.company,
                    title=contact.title
                )
                rendered_subject = jinja_subject_template.render(
                    name=contact.name,
                    company=contact.company,
                    title=contact.title
                )
                
                # Actual SMTP sending
                msg = MIMEMultipart()
                msg['From'] = sender.email
                msg['To'] = contact.email
                msg['Subject'] = rendered_subject
                
                # Attach body
                msg.attach(MIMEText(rendered_body, 'plain'))
                
                # Send
                with smtplib.SMTP(sender.smtp_host, sender.smtp_port) as server:
                    server.starttls()
                    if sender.smtp_username and sender.smtp_password:
                        server.login(sender.smtp_username, sender.smtp_password)
                    server.send_message(msg)
                
                # Update stats
                contact.status = "SENT"
                contact.sender_id = sender.id
                campaign.sent_count += 1
                sender.sent_today += 1
                
                log = EmailLog(
                    contact_id=contact.id,
                    sender_id=sender.id,
                    status="SUCCESS"
                )
                db.add(log)
                db.commit()

            except Exception as e:
                contact.retry_count += 1
                if contact.retry_count >= 3:
                    contact.status = "FAILED"
                    campaign.failed_count += 1
                else:
                    contact.status = "NOT_SENT" # Try again later
                
                log = EmailLog(
                    contact_id=contact.id,
                    sender_id=sender.id,
                    status="FAILED",
                    error_message=str(e)
                )
                db.add(log)
                db.commit()

            # Random delay
            sleep_time = random.randint(20, 60)
            time.sleep(sleep_time)

    finally:
        db.close()
    return "Task Finished"
