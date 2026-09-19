from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.auth import router as auth_router
from api.projects import router as projects_router
from api.artifacts import router as artifacts_router
from api.traceability import router as traceability_router
from api.signoff import router as signoff_router
from api.export import router as export_router

app = FastAPI(title="Superspec API")

# Setup CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(projects_router, prefix="/api/projects", tags=["projects"])
app.include_router(artifacts_router, prefix="/api/projects", tags=["artifacts"])
app.include_router(traceability_router, prefix="/api/projects", tags=["traceability"])
app.include_router(signoff_router, prefix="/api/projects", tags=["signoff"])
app.include_router(export_router, prefix="/api/projects", tags=["export"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
