from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Outreach Automation Engine API",
    description="Backend API for managing HR contacts, campaigns, and senders.",
    version="1.0.0",
)

# CORS middleware to allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Outreach Automation Engine API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
