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

class ArticleVisibility(str, Enum):
    PUBLIC = "public"
    INTERNAL = "internal"
    DEPARTMENT = "department"
    PRIVATE = "private"

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

# Wiki models
class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = "#3b82f6"

class CategoryResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color: str
    created_at: datetime
    created_by: str

class SubcategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category_id: str

class SubcategoryResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    category_id: str
    created_at: datetime
    created_by: str

class ArticleCreate(BaseModel):
    title: str
    content: str
    subcategory_id: str
    visibility: ArticleVisibility = ArticleVisibility.INTERNAL
    tags: Optional[List[str]] = []
    images: Optional[List[str]] = []  # Base64 encoded images

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    visibility: Optional[ArticleVisibility] = None
    tags: Optional[List[str]] = None
    images: Optional[List[str]] = None

class ArticleResponse(BaseModel):
    id: str
    title: str
    content: str
    subcategory_id: str
    visibility: ArticleVisibility
    tags: List[str]
    images: List[str]
    version: int
    created_at: datetime
    updated_at: datetime
    created_by: str
    updated_by: str

class ArticleVersion(BaseModel):
    version: int
    title: str
    content: str
    tags: List[str]
    images: List[str]
    updated_at: datetime
    updated_by: str
    change_notes: Optional[str] = None

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

# Wiki Category routes
@app.post("/api/wiki/categories", response_model=CategoryResponse)
async def create_category(
    category_data: CategoryCreate,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.WIKI_WRITE)
    
    category_id = str(uuid.uuid4())
    category_doc = {
        "id": category_id,
        "name": category_data.name,
        "description": category_data.description,
        "icon": category_data.icon,
        "color": category_data.color,
        "created_at": datetime.utcnow(),
        "created_by": current_user["id"]
    }
    
    db.wiki_categories.insert_one(category_doc)
    return CategoryResponse(**category_doc)

@app.get("/api/wiki/categories", response_model=List[CategoryResponse])
async def get_categories(current_user: dict = Depends(get_current_user)):
    check_permission(current_user, AppPermission.WIKI_READ)
    
    categories = list(db.wiki_categories.find({}, {"_id": 0}))
    return [CategoryResponse(**cat) for cat in categories]

@app.put("/api/wiki/categories/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: str,
    category_data: CategoryCreate,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.WIKI_WRITE)
    
    update_data = {
        "name": category_data.name,
        "description": category_data.description,
        "icon": category_data.icon,
        "color": category_data.color,
        "updated_at": datetime.utcnow(),
        "updated_by": current_user["id"]
    }
    
    result = db.wiki_categories.update_one(
        {"id": category_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    updated_category = db.wiki_categories.find_one({"id": category_id}, {"_id": 0})
    return CategoryResponse(**updated_category)

@app.delete("/api/wiki/categories/{category_id}")
async def delete_category(
    category_id: str,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.WIKI_DELETE)
    
    # Check if category has subcategories
    subcategories = db.wiki_subcategories.find_one({"category_id": category_id})
    if subcategories:
        raise HTTPException(status_code=400, detail="Cannot delete category with subcategories")
    
    result = db.wiki_categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"message": "Category deleted successfully"}

# Wiki Subcategory routes
@app.post("/api/wiki/subcategories", response_model=SubcategoryResponse)
async def create_subcategory(
    subcategory_data: SubcategoryCreate,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.WIKI_WRITE)
    
    # Verify category exists
    category = db.wiki_categories.find_one({"id": subcategory_data.category_id})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    subcategory_id = str(uuid.uuid4())
    subcategory_doc = {
        "id": subcategory_id,
        "name": subcategory_data.name,
        "description": subcategory_data.description,
        "category_id": subcategory_data.category_id,
        "created_at": datetime.utcnow(),
        "created_by": current_user["id"]
    }
    
    db.wiki_subcategories.insert_one(subcategory_doc)
    return SubcategoryResponse(**subcategory_doc)

@app.get("/api/wiki/subcategories", response_model=List[SubcategoryResponse])
async def get_subcategories(
    category_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.WIKI_READ)
    
    query = {}
    if category_id:
        query["category_id"] = category_id
    
    subcategories = list(db.wiki_subcategories.find(query, {"_id": 0}))
    return [SubcategoryResponse(**subcat) for subcat in subcategories]

@app.delete("/api/wiki/subcategories/{subcategory_id}")
async def delete_subcategory(
    subcategory_id: str,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.WIKI_DELETE)
    
    # Check if subcategory has articles
    articles = db.wiki_articles.find_one({"subcategory_id": subcategory_id})
    if articles:
        raise HTTPException(status_code=400, detail="Cannot delete subcategory with articles")
    
    result = db.wiki_subcategories.delete_one({"id": subcategory_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Subcategory not found")
    
    return {"message": "Subcategory deleted successfully"}

# Wiki Article routes
@app.post("/api/wiki/articles", response_model=ArticleResponse)
async def create_article(
    article_data: ArticleCreate,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.WIKI_WRITE)
    
    # Verify subcategory exists
    subcategory = db.wiki_subcategories.find_one({"id": article_data.subcategory_id})
    if not subcategory:
        raise HTTPException(status_code=404, detail="Subcategory not found")
    
    article_id = str(uuid.uuid4())
    article_doc = {
        "id": article_id,
        "title": article_data.title,
        "content": article_data.content,
        "subcategory_id": article_data.subcategory_id,
        "visibility": article_data.visibility,
        "tags": article_data.tags or [],
        "images": article_data.images or [],
        "version": 1,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "created_by": current_user["id"],
        "updated_by": current_user["id"]
    }
    
    db.wiki_articles.insert_one(article_doc)
    
    # Create initial version entry
    version_doc = {
        "article_id": article_id,
        "version": 1,
        "title": article_data.title,
        "content": article_data.content,
        "tags": article_data.tags or [],
        "images": article_data.images or [],
        "updated_at": datetime.utcnow(),
        "updated_by": current_user["id"],
        "change_notes": "Initial creation"
    }
    db.wiki_article_versions.insert_one(version_doc)
    
    return ArticleResponse(**article_doc)

@app.get("/api/wiki/articles", response_model=List[ArticleResponse])
async def get_articles(
    subcategory_id: Optional[str] = None,
    search: Optional[str] = None,
    tags: Optional[str] = None,
    visibility: Optional[ArticleVisibility] = None,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.WIKI_READ)
    
    query = {}
    
    # Filter by subcategory
    if subcategory_id:
        query["subcategory_id"] = subcategory_id
    
    # Filter by visibility (public articles are visible to all)
    if visibility:
        query["visibility"] = visibility
    else:
        # Show articles based on user role and visibility rules
        user_role = UserRole(current_user["role"])
        if user_role == UserRole.VIEWER:
            query["visibility"] = {"$in": [ArticleVisibility.PUBLIC, ArticleVisibility.INTERNAL]}
        # Admin and managers can see all articles
        elif user_role not in [UserRole.ADMIN, UserRole.MANAGER]:
            query["visibility"] = {"$ne": ArticleVisibility.PRIVATE}
    
    # Search functionality
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}}
        ]
    
    # Filter by tags
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        query["tags"] = {"$in": tag_list}
    
    articles = list(db.wiki_articles.find(query, {"_id": 0}))
    return [ArticleResponse(**article) for article in articles]

@app.get("/api/wiki/articles/{article_id}", response_model=ArticleResponse)
async def get_article(
    article_id: str,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.WIKI_READ)
    
    article = db.wiki_articles.find_one({"id": article_id}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Check visibility permissions
    user_role = UserRole(current_user["role"])
    article_visibility = ArticleVisibility(article["visibility"])
    
    if article_visibility == ArticleVisibility.PRIVATE:
        if article["created_by"] != current_user["id"] and user_role not in [UserRole.ADMIN, UserRole.MANAGER]:
            raise HTTPException(status_code=403, detail="Access denied to private article")
    
    return ArticleResponse(**article)

@app.put("/api/wiki/articles/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: str,
    article_data: ArticleUpdate,
    change_notes: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.WIKI_WRITE)
    
    article = db.wiki_articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Check if user can edit this article
    user_role = UserRole(current_user["role"])
    if article["created_by"] != current_user["id"] and user_role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="You can only edit your own articles")
    
    # Prepare update data
    update_data = {"updated_at": datetime.utcnow(), "updated_by": current_user["id"]}
    
    if article_data.title is not None:
        update_data["title"] = article_data.title
    if article_data.content is not None:
        update_data["content"] = article_data.content
    if article_data.visibility is not None:
        update_data["visibility"] = article_data.visibility
    if article_data.tags is not None:
        update_data["tags"] = article_data.tags
    if article_data.images is not None:
        update_data["images"] = article_data.images
    
    # Increment version
    new_version = article["version"] + 1
    update_data["version"] = new_version
    
    # Update article
    db.wiki_articles.update_one({"id": article_id}, {"$set": update_data})
    
    # Create version entry
    version_doc = {
        "article_id": article_id,
        "version": new_version,
        "title": article_data.title or article["title"],
        "content": article_data.content or article["content"],
        "tags": article_data.tags or article["tags"],
        "images": article_data.images or article["images"],
        "updated_at": datetime.utcnow(),
        "updated_by": current_user["id"],
        "change_notes": change_notes or f"Updated by {current_user['full_name']}"
    }
    db.wiki_article_versions.insert_one(version_doc)
    
    # Get updated article
    updated_article = db.wiki_articles.find_one({"id": article_id}, {"_id": 0})
    return ArticleResponse(**updated_article)

@app.delete("/api/wiki/articles/{article_id}")
async def delete_article(
    article_id: str,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.WIKI_DELETE)
    
    article = db.wiki_articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Check if user can delete this article
    user_role = UserRole(current_user["role"])
    if article["created_by"] != current_user["id"] and user_role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="You can only delete your own articles")
    
    # Delete article and its versions
    db.wiki_articles.delete_one({"id": article_id})
    db.wiki_article_versions.delete_many({"article_id": article_id})
    
    return {"message": "Article deleted successfully"}

@app.get("/api/wiki/articles/{article_id}/versions", response_model=List[ArticleVersion])
async def get_article_versions(
    article_id: str,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.WIKI_READ)
    
    # Verify article exists and user has access
    article = db.wiki_articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    versions = list(db.wiki_article_versions.find(
        {"article_id": article_id}, 
        {"_id": 0}
    ).sort("version", -1))
    
    return [ArticleVersion(**version) for version in versions]

# Wiki search route
@app.get("/api/wiki/search")
async def search_wiki(
    q: str,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.WIKI_READ)
    
    if len(q.strip()) < 2:
        return {"articles": [], "categories": [], "subcategories": []}
    
    search_regex = {"$regex": q, "$options": "i"}
    
    # Search articles
    article_query = {
        "$or": [
            {"title": search_regex},
            {"content": search_regex},
            {"tags": search_regex}
        ]
    }
    
    # Apply visibility filters
    user_role = UserRole(current_user["role"])
    if user_role == UserRole.VIEWER:
        article_query["visibility"] = {"$in": [ArticleVisibility.PUBLIC, ArticleVisibility.INTERNAL]}
    elif user_role not in [UserRole.ADMIN, UserRole.MANAGER]:
        article_query["visibility"] = {"$ne": ArticleVisibility.PRIVATE}
    
    articles = list(db.wiki_articles.find(article_query, {"_id": 0}).limit(10))
    
    # Search categories
    categories = list(db.wiki_categories.find(
        {"$or": [{"name": search_regex}, {"description": search_regex}]},
        {"_id": 0}
    ).limit(5))
    
    # Search subcategories
    subcategories = list(db.wiki_subcategories.find(
        {"$or": [{"name": search_regex}, {"description": search_regex}]},
        {"_id": 0}
    ).limit(5))
    
    return {
        "articles": [ArticleResponse(**article) for article in articles],
        "categories": [CategoryResponse(**cat) for cat in categories],
        "subcategories": [SubcategoryResponse(**subcat) for subcat in subcategories]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)