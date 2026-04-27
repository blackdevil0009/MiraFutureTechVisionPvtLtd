from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routes import application, admin, auth
from database import engine, Base
from utils.logger import setup_logger
import os
from dotenv import load_dotenv

load_dotenv()

# Setup logger
logger = setup_logger("main")

# Initialize database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Mira Future Tech Internship API",
    description="Backend for internship application platform",
    version="2.0.0"
)

# CORS configuration
origins = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handler for global error handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {str(exc)} on path {request.url.path}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )

# Include routers
app.include_router(application.router, tags=["Applications"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(auth.router, prefix="/admin", tags=["Admin Auth"])

@app.get("/")
async def root():
    return {"message": "Welcome to Mira Future Tech Internship API", "status": "running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
