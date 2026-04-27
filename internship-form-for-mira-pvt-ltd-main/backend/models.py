from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from database import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(20), nullable=False)
    college_name = Column(String(255), nullable=False)
    degree = Column(String(100), nullable=False)
    branch = Column(String(100), nullable=False)
    year = Column(String(50), nullable=False)
    duration = Column(String(50), nullable=False)
    domain = Column(String(100), nullable=False, index=True)
    skills = Column(Text, nullable=False)
    resume_link = Column(Text, nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
