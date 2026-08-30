from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import progress, attendance, faculty_monitoring, exam_performance, faculty_syllabus, progress_analytics
from app.routers.principal import router as principal_router

app = FastAPI(
    title="Module 6 - Progress Monitoring API",
    version="1.0.0",
    description="API for Progress Monitoring & Academic Tracking",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(progress.router)
app.include_router(attendance.router)
app.include_router(faculty_monitoring.router)
app.include_router(exam_performance.router)
app.include_router(faculty_syllabus.router)
app.include_router(progress_analytics.router)
app.include_router(principal_router)

@app.get("/")
def root():
    return {
        "message": "Progress Monitoring API is running",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)