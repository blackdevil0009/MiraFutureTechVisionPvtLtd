from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Application
from schemas import ApplicationCreate, ApplicationOut
from utils.logger import setup_logger

logger = setup_logger("application_route")
router = APIRouter()

@router.post("/apply", response_model=ApplicationOut, status_code=status.HTTP_201_CREATED)
async def apply_internship(application: ApplicationCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"New application received from {application.email}")
        
        db_application = Application(**application.model_dump())
        db.add(db_application)
        db.commit()
        db.refresh(db_application)
        
        logger.info(f"Application saved with ID: {db_application.id}")
        return db_application
    except Exception as e:
        logger.error(f"Error saving application: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your application"
        )
