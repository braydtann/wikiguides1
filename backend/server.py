from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import jwt
from passlib.context import CryptContext
from pymongo import MongoClient
import uuid
from enum import Enum

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="WikiGuides OCP API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Database connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/wikiguides_db")
client = MongoClient(MONGO_URL)
db = client.get_database()

# JWT settings
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-key")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Enums for roles and permissions
class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    AGENT = "agent"
    CONTRIBUTOR = "contributor"
    VIEWER = "viewer"

class AppPermission(str, Enum):
    WIKI_READ = "wiki:read"
    WIKI_WRITE = "wiki:write"
    WIKI_DELETE = "wiki:delete"
    FLOW_READ = "flow:read"
    FLOW_WRITE = "flow:write"
    FLOW_DELETE = "flow:delete"
    FLOW_EXECUTE = "flow:execute"
    USER_MANAGE = "user:manage"
    ADMIN_ACCESS = "admin:access"

# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.VIEWER
    department_id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: UserRole
    department_id: Optional[str] = None
    is_active: bool
    created_at: datetime

class DepartmentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    parent_department_id: Optional[str] = None

class DepartmentResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    parent_department_id: Optional[str] = None
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Role-based permissions mapping
ROLE_PERMISSIONS = {
    UserRole.ADMIN: [
        AppPermission.WIKI_READ, AppPermission.WIKI_WRITE, AppPermission.WIKI_DELETE,
        AppPermission.FLOW_READ, AppPermission.FLOW_WRITE, AppPermission.FLOW_DELETE, AppPermission.FLOW_EXECUTE,
        AppPermission.USER_MANAGE, AppPermission.ADMIN_ACCESS
    ],
    UserRole.MANAGER: [
        AppPermission.WIKI_READ, AppPermission.WIKI_WRITE,
        AppPermission.FLOW_READ, AppPermission.FLOW_WRITE, AppPermission.FLOW_EXECUTE,
        AppPermission.USER_MANAGE
    ],
    UserRole.AGENT: [
        AppPermission.WIKI_READ, AppPermission.WIKI_WRITE,
        AppPermission.FLOW_READ, AppPermission.FLOW_EXECUTE
    ],
    UserRole.CONTRIBUTOR: [
        AppPermission.WIKI_READ, AppPermission.WIKI_WRITE,
        AppPermission.FLOW_READ, AppPermission.FLOW_EXECUTE
    ],
    UserRole.VIEWER: [
        AppPermission.WIKI_READ,
        AppPermission.FLOW_READ, AppPermission.FLOW_EXECUTE
    ]
}

# Utility functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = db.users.find_one({"id": user_id})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

def check_permission(user: dict, required_permission: AppPermission):
    user_role = UserRole(user["role"])
    user_permissions = ROLE_PERMISSIONS.get(user_role, [])
    if required_permission not in user_permissions:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

# API Routes

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Authentication routes
@app.post("/api/auth/register", response_model=UserResponse)
async def register_user(user_data: UserCreate):
    # Check if user already exists
    if db.users.find_one({"email": user_data.email}):
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_password = hash_password(user_data.password)
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password_hash": hashed_password,
        "full_name": user_data.full_name,
        "role": user_data.role,
        "department_id": user_data.department_id,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    db.users.insert_one(user_doc)
    
    return UserResponse(**{k: v for k, v in user_doc.items() if k != "password_hash"})

@app.post("/api/auth/login", response_model=TokenResponse)
async def login_user(login_data: UserLogin):
    user = db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user["is_active"]:
        raise HTTPException(status_code=401, detail="Account is deactivated")
    
    access_token = create_access_token({"sub": user["id"], "email": user["email"]})
    
    user_response = UserResponse(**{k: v for k, v in user.items() if k != "password_hash"})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return UserResponse(**{k: v for k, v in current_user.items() if k != "password_hash"})

# Department management routes
@app.post("/api/departments", response_model=DepartmentResponse)
async def create_department(
    dept_data: DepartmentCreate,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.ADMIN_ACCESS)
    
    dept_id = str(uuid.uuid4())
    dept_doc = {
        "id": dept_id,
        "name": dept_data.name,
        "description": dept_data.description,
        "parent_department_id": dept_data.parent_department_id,
        "created_at": datetime.utcnow(),
        "created_by": current_user["id"]
    }
    
    db.departments.insert_one(dept_doc)
    return DepartmentResponse(**dept_doc)

@app.get("/api/departments", response_model=List[DepartmentResponse])
async def get_departments(current_user: dict = Depends(get_current_user)):
    departments = list(db.departments.find({}, {"_id": 0}))
    return [DepartmentResponse(**dept) for dept in departments]

# User management routes
@app.get("/api/users", response_model=List[UserResponse])
async def get_users(current_user: dict = Depends(get_current_user)):
    check_permission(current_user, AppPermission.USER_MANAGE)
    
    users = list(db.users.find({}, {"_id": 0, "password_hash": 0}))
    return [UserResponse(**user) for user in users]

@app.patch("/api/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role_data: dict,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.USER_MANAGE)
    
    new_role = role_data.get("role")
    if new_role not in [r.value for r in UserRole]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    result = db.users.update_one(
        {"id": user_id},
        {"$set": {"role": new_role, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User role updated successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)