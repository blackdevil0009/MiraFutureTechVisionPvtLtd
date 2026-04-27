from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from jose import JWTError, jwt
import os
from database import get_db
from models import Application
from schemas import PaginatedApplications, TokenData
from utils.logger import setup_logger
from utils.auth_utils import SECRET_KEY, ALGORITHM

logger = setup_logger("admin_route")
router = APIRouter()

async def verify_token(x_token: str = Header(..., alias="Authorization")):
    # Extract "Bearer <token>"
    if not x_token.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = x_token.split(" ")[1]
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    return token_data

@router.get("/applications", response_model=PaginatedApplications)
async def get_applications(
    page: int = 1,
    size: int = 10,
    domain: Optional[str] = None,
    db: Session = Depends(get_db),
    _ = Depends(verify_token)
):
    try:
        query = db.query(Application)
        
        # Filtering
        if domain:
            query = query.filter(Application.domain == domain)
        
        # Total count
        total = query.count()
        
        # Sorting (latest first) and Pagination
        applications = query.order_by(desc(Application.created_at))\
            .offset((page - 1) * size)\
            .limit(size)\
            .all()
            
        return {
            "total": total,
            "page": page,
            "size": size,
            "applications": applications
        }
    except Exception as e:
        logger.error(f"Error fetching applications: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving applications"
        )
