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

class FlowStepType(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    TEXT_INPUT = "text_input"  
    CONDITIONAL_BRANCH = "conditional_branch"
    SUBFLOW = "subflow"
    INFORMATION = "information"

class FlowExecutionStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"

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

# Enhanced models for knowledge base system
class WikiCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = "#3b82f6"
    is_public: bool = False
    allowed_roles: List[UserRole] = [UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT]

class WikiResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color: str = "#3b82f6"
    is_public: bool = False
    allowed_roles: List[UserRole]
    categories_count: int = 0
    articles_count: int = 0
    created_at: datetime
    updated_at: datetime
    created_by: str

class WikiUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    is_public: Optional[bool] = None
    allowed_roles: Optional[List[UserRole]] = None

# Enhanced Category model with icons and wiki association
class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    icon_type: Optional[str] = "emoji"  # emoji, lucide, upload
    color: Optional[str] = "#3b82f6"
    wiki_id: str
    order_index: int = 0

class CategoryResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    icon_type: str = "emoji"
    color: str = "#3b82f6"
    wiki_id: str
    order_index: int = 0
    subcategories_count: int = 0
    articles_count: int = 0
    created_at: datetime
    updated_at: datetime

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    icon_type: Optional[str] = None
    color: Optional[str] = None
    order_index: Optional[int] = None

# Enhanced Subcategory model with nested support
class SubcategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category_id: str
    parent_subcategory_id: Optional[str] = None  # For nested subcategories
    order_index: int = 0

class SubcategoryResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    category_id: str
    parent_subcategory_id: Optional[str] = None
    order_index: int = 0
    nested_subcategories: List['SubcategoryResponse'] = []
    articles_count: int = 0
    created_at: datetime
    updated_at: datetime

class SubcategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    parent_subcategory_id: Optional[str] = None
    order_index: Optional[int] = None

# Enhanced Article model
class ArticleCreate(BaseModel):
    title: str
    content: str
    subcategory_id: str
    visibility: ArticleVisibility = ArticleVisibility.INTERNAL
    tags: Optional[List[str]] = []
    images: Optional[List[str]] = []

class ArticleResponse(BaseModel):
    id: str
    title: str
    content: str
    subcategory_id: str
    wiki_id: str  # Derived from subcategory
    visibility: ArticleVisibility
    tags: List[str] = []
    images: List[str] = []
    version: int
    created_at: datetime
    updated_at: datetime
    created_by: str
    updated_by: str

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    subcategory_id: Optional[str] = None
    visibility: Optional[ArticleVisibility] = None
    tags: Optional[List[str]] = None
    images: Optional[List[str]] = None

class ArticleVersion(BaseModel):
    version: int
    title: str
    content: str
    tags: List[str]
    images: List[str]
    updated_at: datetime
    updated_by: str
    change_notes: Optional[str] = None

# Flow models
class FlowCreate(BaseModel):
    title: str
    description: Optional[str] = None
    visibility: ArticleVisibility = ArticleVisibility.INTERNAL
    tags: Optional[List[str]] = []

class FlowResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    visibility: ArticleVisibility
    tags: List[str]
    version: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    created_by: str
    updated_by: str

class FlowStepCreate(BaseModel):
    flow_id: str
    step_order: int
    step_type: FlowStepType
    question_text: str
    description: Optional[str] = None
    options: Optional[List[Dict[str, Any]]] = []  # For multiple choice: [{"text": "Option 1", "value": "opt1", "next_step": "step_id"}]
    validation_rules: Optional[Dict[str, Any]] = {}  # For text input validation
    conditional_logic: Optional[Dict[str, Any]] = {}  # For conditional branches
    subflow_id: Optional[str] = None  # For subflow steps
    images: Optional[List[str]] = []  # Base64 encoded images
    is_required: bool = True

class FlowStepResponse(BaseModel):
    id: str
    flow_id: str
    step_order: int
    step_type: FlowStepType
    question_text: str
    description: Optional[str] = None
    options: List[Dict[str, Any]]
    validation_rules: Dict[str, Any]
    conditional_logic: Dict[str, Any]
    subflow_id: Optional[str] = None
    images: List[str]
    is_required: bool
    created_at: datetime
    updated_at: datetime

class FlowExecutionCreate(BaseModel):
    flow_id: str
    session_data: Optional[Dict[str, Any]] = {}

class FlowExecutionResponse(BaseModel):
    id: str
    flow_id: str
    user_id: Optional[str] = None
    session_id: str
    status: FlowExecutionStatus
    current_step_id: Optional[str] = None
    answers: Dict[str, Any]
    session_data: Dict[str, Any]
    url_path: str  # For resumable sessions
    started_at: datetime
    completed_at: Optional[datetime] = None
    last_activity: datetime

class FlowStepAnswer(BaseModel):
    step_id: str
    answer: Any  # Can be string, number, list, etc.
    metadata: Optional[Dict[str, Any]] = {}

class FlowSummary(BaseModel):
    execution_id: str
    flow_title: str
    completed_steps: List[Dict[str, Any]]
    total_time_seconds: int
    summary_text: str
    summary_markdown: str
    summary_json: Dict[str, Any]
    generated_at: datetime

# Admin models
class SystemSettings(BaseModel):
    storage_provider: Optional[str] = None  # 'google_drive', 'aws_s3', 'local'
    storage_config: Optional[Dict[str, Any]] = {}
    email_notifications: bool = False
    email_config: Optional[Dict[str, Any]] = {}
    analytics_enabled: bool = True
    backup_enabled: bool = False
    backup_config: Optional[Dict[str, Any]] = {}

class AnalyticsResponse(BaseModel):
    total_users: int
    active_users_last_30_days: int
    total_wiki_articles: int
    articles_created_last_30_days: int
    total_flows: int
    flows_created_last_30_days: int
    total_flow_executions: int
    executions_last_30_days: int
    most_popular_articles: List[Dict[str, Any]]
    most_executed_flows: List[Dict[str, Any]]
    user_activity_by_role: Dict[str, int]
    storage_usage: Dict[str, Any]

class UserActivityLog(BaseModel):
    user_id: str
    action: str  # 'login', 'create_article', 'execute_flow', etc.
    resource_type: Optional[str] = None  # 'article', 'flow', 'category'
    resource_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}
    timestamp: datetime

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

# Flow management routes
@app.post("/api/flows", response_model=FlowResponse)
async def create_flow(
    flow_data: FlowCreate,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.FLOW_WRITE)
    
    flow_id = str(uuid.uuid4())
    flow_doc = {
        "id": flow_id,
        "title": flow_data.title,
        "description": flow_data.description,
        "visibility": flow_data.visibility,
        "tags": flow_data.tags or [],
        "version": 1,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "created_by": current_user["id"],
        "updated_by": current_user["id"]
    }
    
    db.flows.insert_one(flow_doc)
    return FlowResponse(**flow_doc)

@app.get("/api/flows", response_model=List[FlowResponse])
async def get_flows(
    search: Optional[str] = None,
    tags: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.FLOW_READ)
    
    query = {"is_active": True}
    
    # Apply visibility filters based on user role
    user_role = UserRole(current_user["role"])
    if user_role == UserRole.VIEWER:
        query["visibility"] = {"$in": [ArticleVisibility.PUBLIC, ArticleVisibility.INTERNAL]}
    elif user_role not in [UserRole.ADMIN, UserRole.MANAGER]:
        query["visibility"] = {"$ne": ArticleVisibility.PRIVATE}
    
    # Search functionality
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}}
        ]
    
    # Filter by tags
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        query["tags"] = {"$in": tag_list}
    
    flows = list(db.flows.find(query, {"_id": 0}).sort("created_at", -1))
    return [FlowResponse(**flow) for flow in flows]

@app.get("/api/flows/{flow_id}", response_model=FlowResponse)
async def get_flow(
    flow_id: str,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.FLOW_READ)
    
    flow = db.flows.find_one({"id": flow_id}, {"_id": 0})
    if not flow:
        raise HTTPException(status_code=404, detail="Flow not found")
    
    # Check visibility permissions
    user_role = UserRole(current_user["role"])
    flow_visibility = ArticleVisibility(flow["visibility"])
    
    if flow_visibility == ArticleVisibility.PRIVATE:
        if flow["created_by"] != current_user["id"] and user_role not in [UserRole.ADMIN, UserRole.MANAGER]:
            raise HTTPException(status_code=403, detail="Access denied to private flow")
    
    return FlowResponse(**flow)

@app.put("/api/flows/{flow_id}", response_model=FlowResponse)
async def update_flow(
    flow_id: str,
    flow_data: FlowCreate,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.FLOW_WRITE)
    
    flow = db.flows.find_one({"id": flow_id})
    if not flow:
        raise HTTPException(status_code=404, detail="Flow not found")
    
    # Check if user can edit this flow
    user_role = UserRole(current_user["role"])
    if flow["created_by"] != current_user["id"] and user_role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="You can only edit your own flows")
    
    update_data = {
        "title": flow_data.title,
        "description": flow_data.description,
        "visibility": flow_data.visibility,
        "tags": flow_data.tags or [],
        "version": flow["version"] + 1,
        "updated_at": datetime.utcnow(),
        "updated_by": current_user["id"]
    }
    
    db.flows.update_one({"id": flow_id}, {"$set": update_data})
    
    updated_flow = db.flows.find_one({"id": flow_id}, {"_id": 0})
    return FlowResponse(**updated_flow)

@app.delete("/api/flows/{flow_id}")
async def delete_flow(
    flow_id: str,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.FLOW_DELETE)
    
    flow = db.flows.find_one({"id": flow_id})
    if not flow:
        raise HTTPException(status_code=404, detail="Flow not found")
    
    # Check if user can delete this flow
    user_role = UserRole(current_user["role"])
    if flow["created_by"] != current_user["id"] and user_role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="You can only delete your own flows")
    
    # Soft delete - set is_active to False
    db.flows.update_one({"id": flow_id}, {"$set": {"is_active": False, "updated_at": datetime.utcnow()}})
    
    return {"message": "Flow deleted successfully"}

# Flow steps management
@app.post("/api/flows/{flow_id}/steps", response_model=FlowStepResponse)
async def create_flow_step(
    flow_id: str,
    step_data: FlowStepCreate,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.FLOW_WRITE)
    
    # Verify flow exists and user has access
    flow = db.flows.find_one({"id": flow_id})
    if not flow:
        raise HTTPException(status_code=404, detail="Flow not found")
    
    user_role = UserRole(current_user["role"])
    if flow["created_by"] != current_user["id"] and user_role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="You can only edit your own flows")
    
    step_id = str(uuid.uuid4())
    step_doc = {
        "id": step_id,
        "flow_id": flow_id,
        "step_order": step_data.step_order,
        "step_type": step_data.step_type,
        "question_text": step_data.question_text,
        "description": step_data.description,
        "options": step_data.options or [],
        "validation_rules": step_data.validation_rules or {},
        "conditional_logic": step_data.conditional_logic or {},
        "subflow_id": step_data.subflow_id,
        "images": step_data.images or [],
        "is_required": step_data.is_required,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    db.flow_steps.insert_one(step_doc)
    return FlowStepResponse(**step_doc)

@app.get("/api/flows/{flow_id}/steps", response_model=List[FlowStepResponse])
async def get_flow_steps(
    flow_id: str,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.FLOW_READ)
    
    # Verify flow exists and user has access
    flow = db.flows.find_one({"id": flow_id})
    if not flow:
        raise HTTPException(status_code=404, detail="Flow not found")
    
    steps = list(db.flow_steps.find({"flow_id": flow_id}, {"_id": 0}).sort("step_order", 1))
    return [FlowStepResponse(**step) for step in steps]

@app.put("/api/flows/{flow_id}/steps/{step_id}", response_model=FlowStepResponse)
async def update_flow_step(
    flow_id: str,
    step_id: str,
    step_data: FlowStepCreate,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.FLOW_WRITE)
    
    # Verify flow exists and user has access
    flow = db.flows.find_one({"id": flow_id})
    if not flow:
        raise HTTPException(status_code=404, detail="Flow not found")
    
    user_role = UserRole(current_user["role"])
    if flow["created_by"] != current_user["id"] and user_role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="You can only edit your own flows")
    
    update_data = {
        "step_order": step_data.step_order,
        "step_type": step_data.step_type,
        "question_text": step_data.question_text,
        "description": step_data.description,
        "options": step_data.options or [],
        "validation_rules": step_data.validation_rules or {},  
        "conditional_logic": step_data.conditional_logic or {},
        "subflow_id": step_data.subflow_id,
        "images": step_data.images or [],
        "is_required": step_data.is_required,
        "updated_at": datetime.utcnow()
    }
    
    result = db.flow_steps.update_one({"id": step_id, "flow_id": flow_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Flow step not found")
    
    updated_step = db.flow_steps.find_one({"id": step_id}, {"_id": 0})
    return FlowStepResponse(**updated_step)

@app.delete("/api/flows/{flow_id}/steps/{step_id}")
async def delete_flow_step(
    flow_id: str,
    step_id: str,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.FLOW_WRITE)
    
    # Verify flow exists and user has access
    flow = db.flows.find_one({"id": flow_id})
    if not flow:
        raise HTTPException(status_code=404, detail="Flow not found")
    
    user_role = UserRole(current_user["role"])
    if flow["created_by"] != current_user["id"] and user_role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="You can only edit your own flows")
    
    result = db.flow_steps.delete_one({"id": step_id, "flow_id": flow_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Flow step not found")
    
    return {"message": "Flow step deleted successfully"}

# Flow execution routes
@app.post("/api/flows/{flow_id}/execute", response_model=FlowExecutionResponse)
async def start_flow_execution(
    flow_id: str,
    execution_data: FlowExecutionCreate,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.FLOW_EXECUTE)
    
    # Verify flow exists and user has access
    flow = db.flows.find_one({"id": flow_id})
    if not flow:
        raise HTTPException(status_code=404, detail="Flow not found")
    
    # Get first step
    first_step = db.flow_steps.find_one({"flow_id": flow_id}, {"_id": 0}, sort=[("step_order", 1)])
    
    execution_id = str(uuid.uuid4())
    session_id = str(uuid.uuid4())
    
    execution_doc = {
        "id": execution_id,
        "flow_id": flow_id,
        "user_id": current_user["id"] if current_user else None,
        "session_id": session_id,
        "status": FlowExecutionStatus.IN_PROGRESS,
        "current_step_id": first_step["id"] if first_step else None,
        "answers": {},
        "session_data": execution_data.session_data or {},
        "url_path": f"/flows/{flow_id}/execute/{session_id}",
        "started_at": datetime.utcnow(),
        "completed_at": None,
        "last_activity": datetime.utcnow()
    }
    
    db.flow_executions.insert_one(execution_doc)
    return FlowExecutionResponse(**execution_doc)

@app.get("/api/flows/{flow_id}/execute/{session_id}", response_model=FlowExecutionResponse)
async def get_flow_execution(
    flow_id: str,
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.FLOW_EXECUTE)
    
    execution = db.flow_executions.find_one({"flow_id": flow_id, "session_id": session_id}, {"_id": 0})
    if not execution:
        raise HTTPException(status_code=404, detail="Flow execution not found")
    
    return FlowExecutionResponse(**execution)

@app.post("/api/flows/{flow_id}/execute/{session_id}/answer")
async def submit_step_answer(
    flow_id: str,
    session_id: str,
    answer_data: FlowStepAnswer,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.FLOW_EXECUTE)
    
    execution = db.flow_executions.find_one({"flow_id": flow_id, "session_id": session_id})
    if not execution:
        raise HTTPException(status_code=404, detail="Flow execution not found")
    
    if execution["status"] != FlowExecutionStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Flow execution is not in progress")
    
    # Get current step
    current_step = db.flow_steps.find_one({"id": answer_data.step_id, "flow_id": flow_id})
    if not current_step:
        raise HTTPException(status_code=404, detail="Flow step not found")
    
    # Store the answer
    answers = execution["answers"]
    answers[answer_data.step_id] = {
        "answer": answer_data.answer,
        "metadata": answer_data.metadata or {},
        "answered_at": datetime.utcnow().isoformat()
    }
    
    # Determine next step
    next_step_id = None
    if current_step["step_type"] == FlowStepType.MULTIPLE_CHOICE:
        # Find next step based on selected option
        for option in current_step["options"]:
            if option.get("value") == answer_data.answer:
                next_step_id = option.get("next_step")
                break
        
        # If no specific next step, get next step by order
        if not next_step_id:
            next_step = db.flow_steps.find_one(
                {"flow_id": flow_id, "step_order": {"$gt": current_step["step_order"]}},
                sort=[("step_order", 1)]
            )
            next_step_id = next_step["id"] if next_step else None
    
    elif current_step["step_type"] == FlowStepType.CONDITIONAL_BRANCH:
        # Evaluate conditional logic
        conditional_logic = current_step.get("conditional_logic", {})
        # For now, simple implementation - can be extended
        conditions = conditional_logic.get("conditions", [])
        for condition in conditions:
            if condition.get("field") == "answer" and condition.get("operator") == "equals":
                if answer_data.answer == condition.get("value"):
                    next_step_id = condition.get("next_step")
                    break
        
        # Default next step
        if not next_step_id:
            next_step_id = conditional_logic.get("default_next_step")
    
    else:
        # For text input and other types, get next step by order
        next_step = db.flow_steps.find_one(
            {"flow_id": flow_id, "step_order": {"$gt": current_step["step_order"]}},
            sort=[("step_order", 1)]
        )
        next_step_id = next_step["id"] if next_step else None
    
    # Update execution
    update_data = {
        "answers": answers,
        "current_step_id": next_step_id,
        "last_activity": datetime.utcnow()
    }
    
    # Mark as completed if no more steps
    if not next_step_id:
        update_data["status"] = FlowExecutionStatus.COMPLETED
        update_data["completed_at"] = datetime.utcnow()
    
    db.flow_executions.update_one(
        {"flow_id": flow_id, "session_id": session_id},
        {"$set": update_data}
    )
    
    return {
        "message": "Answer submitted successfully",
        "next_step_id": next_step_id,
        "is_completed": not next_step_id
    }

@app.get("/api/flows/{flow_id}/execute/{session_id}/summary", response_model=FlowSummary)
async def get_flow_summary(
    flow_id: str,
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.FLOW_EXECUTE)
    
    execution = db.flow_executions.find_one({"flow_id": flow_id, "session_id": session_id})
    if not execution:
        raise HTTPException(status_code=404, detail="Flow execution not found")
    
    flow = db.flows.find_one({"id": flow_id})
    steps = list(db.flow_steps.find({"flow_id": flow_id}, {"_id": 0}).sort("step_order", 1))
    
    # Build completed steps summary
    completed_steps = []
    for step in steps:
        if step["id"] in execution["answers"]:
            answer_data = execution["answers"][step["id"]]
            completed_steps.append({
                "step_order": step["step_order"],
                "question": step["question_text"],
                "answer": answer_data["answer"],
                "answered_at": answer_data["answered_at"]
            })
    
    # Calculate total time
    started_at = execution["started_at"]
    completed_at = execution.get("completed_at", datetime.utcnow())
    total_time = int((completed_at - started_at).total_seconds())
    
    # Generate summaries
    summary_text = f"Flow '{flow['title']}' completed with {len(completed_steps)} steps answered."
    
    summary_markdown = f"# Flow Summary: {flow['title']}\n\n"
    for step in completed_steps:
        summary_markdown += f"**Q{step['step_order']}.** {step['question']}\n"
        summary_markdown += f"**Answer:** {step['answer']}\n\n"
    
    summary_json = {
        "flow_id": flow_id,
        "flow_title": flow["title"],
        "execution_id": execution["id"],
        "completed_steps": completed_steps,
        "total_time_seconds": total_time,
        "started_at": started_at.isoformat() if isinstance(started_at, datetime) else started_at,
        "completed_at": completed_at.isoformat() if isinstance(completed_at, datetime) else completed_at
    }
    
    return FlowSummary(
        execution_id=execution["id"],
        flow_title=flow["title"],
        completed_steps=completed_steps,
        total_time_seconds=total_time,
        summary_text=summary_text,
        summary_markdown=summary_markdown,
        summary_json=summary_json,
        generated_at=datetime.utcnow()
    )

# Admin and Analytics routes
@app.get("/api/admin/analytics", response_model=AnalyticsResponse)
async def get_analytics(current_user: dict = Depends(get_current_user)):
    check_permission(current_user, AppPermission.ADMIN_ACCESS)
    
    # Calculate date ranges
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    # User analytics
    total_users = db.users.count_documents({})
    active_users_last_30_days = db.users.count_documents({
        "updated_at": {"$gte": thirty_days_ago}
    })
    
    # Wiki analytics
    total_wiki_articles = db.wiki_articles.count_documents({})
    articles_created_last_30_days = db.wiki_articles.count_documents({
        "created_at": {"$gte": thirty_days_ago}
    })
    
    # Flow analytics
    total_flows = db.flows.count_documents({"is_active": True})
    flows_created_last_30_days = db.flows.count_documents({
        "created_at": {"$gte": thirty_days_ago},
        "is_active": True
    })
    
    # Execution analytics
    total_flow_executions = db.flow_executions.count_documents({})
    executions_last_30_days = db.flow_executions.count_documents({
        "started_at": {"$gte": thirty_days_ago}
    })
    
    # Most popular articles (placeholder logic - can be enhanced)
    most_popular_articles = list(db.wiki_articles.find(
        {}, {"_id": 0, "title": 1, "created_at": 1, "created_by": 1}
    ).sort("created_at", -1).limit(5))
    
    # Most executed flows
    pipeline = [
        {"$match": {"started_at": {"$gte": thirty_days_ago}}},
        {"$group": {"_id": "$flow_id", "execution_count": {"$sum": 1}}},
        {"$sort": {"execution_count": -1}},
        {"$limit": 5}
    ]
    
    most_executed_flows_data = list(db.flow_executions.aggregate(pipeline))
    most_executed_flows = []
    
    for item in most_executed_flows_data:
        flow = db.flows.find_one({"id": item["_id"]}, {"_id": 0, "title": 1, "created_by": 1})
        if flow:
            most_executed_flows.append({
                "title": flow["title"],
                "execution_count": item["execution_count"],
                "created_by": flow["created_by"]
            })
    
    # User activity by role
    user_activity_by_role = {}
    for role in UserRole:
        count = db.users.count_documents({"role": role.value})
        user_activity_by_role[role.value] = count
    
    # Storage usage (placeholder)
    storage_usage = {
        "total_storage_mb": 0,
        "articles_storage_mb": 0,
        "images_storage_mb": 0,
        "flows_storage_mb": 0
    }
    
    return AnalyticsResponse(
        total_users=total_users,
        active_users_last_30_days=active_users_last_30_days,
        total_wiki_articles=total_wiki_articles,
        articles_created_last_30_days=articles_created_last_30_days,
        total_flows=total_flows,
        flows_created_last_30_days=flows_created_last_30_days,
        total_flow_executions=total_flow_executions,
        executions_last_30_days=executions_last_30_days,
        most_popular_articles=most_popular_articles,
        most_executed_flows=most_executed_flows,
        user_activity_by_role=user_activity_by_role,
        storage_usage=storage_usage
    )

@app.get("/api/admin/settings", response_model=SystemSettings)
async def get_system_settings(current_user: dict = Depends(get_current_user)):
    check_permission(current_user, AppPermission.ADMIN_ACCESS)
    
    settings = db.system_settings.find_one({"type": "global"}) or {}
    
    return SystemSettings(
        storage_provider=settings.get("storage_provider"),
        storage_config=settings.get("storage_config", {}),
        email_notifications=settings.get("email_notifications", False),
        email_config=settings.get("email_config", {}),
        analytics_enabled=settings.get("analytics_enabled", True),
        backup_enabled=settings.get("backup_enabled", False),
        backup_config=settings.get("backup_config", {})
    )

@app.put("/api/admin/settings", response_model=SystemSettings)
async def update_system_settings(
    settings: SystemSettings,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.ADMIN_ACCESS)
    
    settings_doc = {
        "type": "global",
        "storage_provider": settings.storage_provider,
        "storage_config": settings.storage_config,
        "email_notifications": settings.email_notifications,
        "email_config": settings.email_config,
        "analytics_enabled": settings.analytics_enabled,
        "backup_enabled": settings.backup_enabled,
        "backup_config": settings.backup_config,
        "updated_at": datetime.utcnow(),
        "updated_by": current_user["id"]
    }
    
    db.system_settings.update_one(
        {"type": "global"},
        {"$set": settings_doc},
        upsert=True
    )
    
    return settings

@app.get("/api/admin/users", response_model=List[UserResponse])
async def get_all_users_admin(current_user: dict = Depends(get_current_user)):
    check_permission(current_user, AppPermission.ADMIN_ACCESS)
    
    users = list(db.users.find({}, {"_id": 0, "password_hash": 0}))
    return [UserResponse(**user) for user in users]

@app.get("/api/admin/recent-activity")
async def get_recent_activity(
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    check_permission(current_user, AppPermission.ADMIN_ACCESS)
    
    # Get recent articles
    recent_articles = list(db.wiki_articles.find(
        {}, {"_id": 0, "title": 1, "created_at": 1, "created_by": 1}
    ).sort("created_at", -1).limit(20))
    
    # Get recent flows
    recent_flows = list(db.flows.find(
        {"is_active": True}, {"_id": 0, "title": 1, "created_at": 1, "created_by": 1}
    ).sort("created_at", -1).limit(20))
    
    # Get recent executions
    recent_executions = list(db.flow_executions.find(
        {}, {"_id": 0, "flow_id": 1, "started_at": 1, "user_id": 1, "status": 1}
    ).sort("started_at", -1).limit(20))
    
    # Combine and format activities
    activities = []
    
    for article in recent_articles:
        activities.append({
            "type": "article_created",
            "title": f"Article '{article['title']}' created",
            "timestamp": article["created_at"],
            "user_id": article["created_by"]
        })
    
    for flow in recent_flows:
        activities.append({
            "type": "flow_created", 
            "title": f"Flow '{flow['title']}' created",
            "timestamp": flow["created_at"],
            "user_id": flow["created_by"]
        })
    
    for execution in recent_executions:
        flow = db.flows.find_one({"id": execution["flow_id"]}, {"title": 1})
        flow_title = flow["title"] if flow else "Unknown Flow"
        activities.append({
            "type": "flow_executed",
            "title": f"Flow '{flow_title}' executed",
            "timestamp": execution["started_at"],
            "user_id": execution.get("user_id"),
            "status": execution["status"]
        })
    
    # Sort by timestamp and limit
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    return activities[:limit]

# Helper function to log user activity
def log_user_activity(user_id: str, action: str, resource_type: str = None, resource_id: str = None, metadata: dict = None):
    activity_doc = {
        "user_id": user_id,
        "action": action,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "metadata": metadata or {},
        "timestamp": datetime.utcnow()
    }
    db.user_activity_logs.insert_one(activity_doc)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)