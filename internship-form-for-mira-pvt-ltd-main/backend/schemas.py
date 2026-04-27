from pydantic import BaseModel, EmailStr, field_validator
from typing import List, Optional
from datetime import datetime
import re

class ApplicationBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    college_name: str
    degree: str
    branch: str
    year: str
    duration: str
    domain: str
    skills: str
    resume_link: str
    message: str

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if not re.match(r'^\d{10}$', v):
            raise ValueError('Phone number must be exactly 10 digits')
        return v

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationOut(ApplicationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class PaginatedApplications(BaseModel):
    total: int
    page: int
    size: int
    applications: List[ApplicationOut]

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
