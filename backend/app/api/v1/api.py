from fastapi import APIRouter
from app.api.v1.endpoints import campaigns, datasets, templates, senders

api_router = APIRouter()
api_router.include_router(campaigns.router, prefix="/campaigns", tags=["campaigns"])
api_router.include_router(datasets.router, prefix="/datasets", tags=["datasets"])
api_router.include_router(templates.router, prefix="/templates", tags=["templates"])
api_router.include_router(senders.router, prefix="/senders", tags=["senders"])
