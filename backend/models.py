# This file holds classes for our 'models' such as user profile, user, items, etc. 
# Instances of these classes will be loaded from database
# We can change this as needed 

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(256), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default="member", nullable=False)
    profile = db.relationship("Profile", uselist=False, backref="user")

# TODO - Finish implementing
class Profile(db.Model):
    pass

# TODO - Finish implementing
class Item(db.Model):
    pass

# TODO - Finish implementing
class Recommendation(db.Model):
    pass
