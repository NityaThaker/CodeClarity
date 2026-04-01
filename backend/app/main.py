from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth
from app.api import assignments
from app.api import submissions
from app.api import hints
from app.api import analytics
from app.api import code_analysis
from app.core.config import CORS_ORIGINS
from app.db.database import engine, Base
from app.models import user
from app.models import assignment
from app.models import requirement
from app.models import testcase
from app.models import submission
from app.models import hint
from app.models.code_analysis import CodeAnalysis

app = FastAPI(title="CodeClarity API")

# CORS — allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router, prefix="/api/v1", tags=["Auth"])
app.include_router(assignments.router, prefix="/api/v1", tags=["Assignments"])
app.include_router(submissions.router, prefix="/api/v1", tags=["Submissions"])
app.include_router(hints.router, prefix="/api/v1", tags=["Hints"])
app.include_router(analytics.router, prefix="/api/v1", tags=["Analytics"])
app.include_router(code_analysis.router, prefix="/api/v1", tags=["Code Analysis"])

@app.get("/")
def root():
    return {"message": "CodeClarity Backend Running"}
