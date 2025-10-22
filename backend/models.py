"""This file holds classes for our 'models' such as user profile, user, items, etc. 
Instances of these classes will be loaded from database
We can change this as needed  """

from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from backend.db import Base
import enum

class RoleEnum(str, enum.Enum):
    member = "member"
    admin = "admin"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.member)
    profile = relationship("Profile", back_populates="user", uselist=False)

class Profile(Base):
    __tablename__ = "profiles"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    location_text = Column(String(255))
    units = Column(String(1), default="F")  # 'F' or 'C'
    user = relationship("User", back_populates="profile")

class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True)
    name = Column(String(120), nullable=False)
    category = Column(String(80))
    formality = Column(String(40))        # casual|business|formal|workout...
    warmth_score = Column(Integer)        # e.g., 1-10
    activity_comfort = Column(String(80)) # indoor|outdoor|workout...

class Recommendation(Base):
    __tablename__ = "recommendations"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    occasion = Column(String(80), nullable=False)
    weather_snapshot = Column(JSON)       # store the API response summary
    outfit = Column(JSON)                 # list of item ids/names