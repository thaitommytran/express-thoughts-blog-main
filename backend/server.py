from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.security import HTTPBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import httpx
import markdown
import bleach

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer(auto_error=False)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class UserCreate(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    is_admin: bool = False
    created_at: datetime

class PostCreate(BaseModel):
    title: str
    content: str
    preview: Optional[str] = None
    tags: List[str] = []
    published: bool = True

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    preview: Optional[str] = None
    tags: Optional[List[str]] = None
    published: Optional[bool] = None

class PostResponse(BaseModel):
    post_id: str
    title: str
    content: str
    content_html: str
    preview: str
    tags: List[str]
    author_id: str
    author_name: str
    published: bool
    created_at: datetime
    updated_at: datetime
    comment_count: int = 0

class CommentCreate(BaseModel):
    content: str
    author_name: str
    author_email: Optional[str] = None

class CommentResponse(BaseModel):
    comment_id: str
    post_id: str
    content: str
    author_name: str
    created_at: datetime

class TagResponse(BaseModel):
    name: str
    count: int

# ============== HELPERS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_jwt_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_jwt_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def render_markdown(content: str) -> str:
    html = markdown.markdown(content, extensions=['fenced_code', 'tables', 'nl2br'])
    allowed_tags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'ul', 'ol', 'li', 
                   'code', 'pre', 'blockquote', 'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'br', 'hr']
    allowed_attrs = {'a': ['href', 'title'], 'code': ['class'], 'pre': ['class']}
    return bleach.clean(html, tags=allowed_tags, attributes=allowed_attrs)

async def get_current_user(request: Request) -> Optional[dict]:
    # Check cookie first
    session_token = request.cookies.get("session_token")
    
    # Then check Authorization header
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        return None
    
    # Check if it's a JWT token (for email/password auth)
    try:
        payload = decode_jwt_token(session_token)
        user = await db.users.find_one({"user_id": payload["user_id"]}, {"_id": 0})
        return user
    except:
        pass
    
    # Check if it's a session token (for Google OAuth)
    session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session:
        return None
    
    # Check expiry
    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    return user

async def require_auth(request: Request) -> dict:
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

async def require_admin(request: Request) -> dict:
    user = await require_auth(request)
    if not user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ============== AUTH ROUTES ==============

@api_router.post("/auth/register", response_model=dict)
async def register(data: UserCreate, response: Response):
    existing = await db.users.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    # Check if this is the first user BEFORE creating
    user_count = await db.users.count_documents({})
    is_first_user = user_count == 0
    
    user_doc = {
        "user_id": user_id,
        "email": data.email,
        "name": data.name,
        "password_hash": hash_password(data.password),
        "is_admin": is_first_user,  # First user is admin
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    logger.info(f"User registered: {data.email}, is_admin: {is_first_user}")
    
    token = create_jwt_token(user_id)
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=JWT_EXPIRATION_HOURS * 3600
    )
    
    return {"token": token, "user": {"user_id": user_id, "email": data.email, "name": data.name, "is_admin": is_first_user}}

@api_router.post("/auth/login", response_model=dict)
async def login(data: UserLogin, response: Response):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not verify_password(data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user["user_id"])
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=JWT_EXPIRATION_HOURS * 3600
    )
    
    return {"token": token, "user": {"user_id": user["user_id"], "email": user["email"], "name": user["name"], "is_admin": user.get("is_admin", False)}}

@api_router.get("/auth/me", response_model=dict)
async def get_me(request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "picture": user.get("picture"),
        "is_admin": user.get("is_admin", False)
    }

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/", samesite="none", secure=True)
    return {"message": "Logged out"}

# REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
@api_router.post("/auth/session", response_model=dict)
async def exchange_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID required")
    
    # Exchange session_id with Emergent Auth
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            
            auth_data = resp.json()
        except httpx.RequestError:
            raise HTTPException(status_code=500, detail="Auth service unavailable")
    
    # Find or create user
    user = await db.users.find_one({"email": auth_data["email"]}, {"_id": 0})
    
    if not user:
        user_count = await db.users.count_documents({})
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user = {
            "user_id": user_id,
            "email": auth_data["email"],
            "name": auth_data["name"],
            "picture": auth_data.get("picture"),
            "is_admin": user_count == 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user)
    else:
        user_id = user["user_id"]
        # Update user info
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": auth_data["name"], "picture": auth_data.get("picture")}}
        )
    
    # Create session
    session_token = auth_data.get("session_token", f"session_{uuid.uuid4().hex}")
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 3600
    )
    
    return {
        "user_id": user_id,
        "email": user["email"],
        "name": user["name"],
        "picture": user.get("picture"),
        "is_admin": user.get("is_admin", False)
    }

# ============== POST ROUTES ==============

@api_router.get("/posts", response_model=List[PostResponse])
async def get_posts(
    page: int = 1,
    limit: int = 10,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    include_unpublished: bool = False,
    request: Request = None
):
    query = {}
    
    # Only show published posts unless admin is viewing
    if not include_unpublished:
        query["published"] = True
    else:
        user = await get_current_user(request)
        if not user or not user.get("is_admin", False):
            query["published"] = True
    
    if tag:
        query["tags"] = tag
    
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}}
        ]
    
    skip = (page - 1) * limit
    posts = await db.posts.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Add comment counts
    for post in posts:
        comment_count = await db.comments.count_documents({"post_id": post["post_id"]})
        post["comment_count"] = comment_count
        if isinstance(post.get("created_at"), str):
            post["created_at"] = datetime.fromisoformat(post["created_at"])
        if isinstance(post.get("updated_at"), str):
            post["updated_at"] = datetime.fromisoformat(post["updated_at"])
    
    return posts

@api_router.get("/posts/count")
async def get_posts_count(tag: Optional[str] = None, search: Optional[str] = None):
    query = {"published": True}
    if tag:
        query["tags"] = tag
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}}
        ]
    count = await db.posts.count_documents(query)
    return {"count": count}

@api_router.get("/posts/{post_id}", response_model=PostResponse)
async def get_post(post_id: str, request: Request = None):
    post = await db.posts.find_one({"post_id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if unpublished post - only admins can view
    if not post.get("published", True):
        user = await get_current_user(request)
        if not user or not user.get("is_admin", False):
            raise HTTPException(status_code=404, detail="Post not found")
    
    comment_count = await db.comments.count_documents({"post_id": post_id})
    post["comment_count"] = comment_count
    
    if isinstance(post.get("created_at"), str):
        post["created_at"] = datetime.fromisoformat(post["created_at"])
    if isinstance(post.get("updated_at"), str):
        post["updated_at"] = datetime.fromisoformat(post["updated_at"])
    
    return post

@api_router.post("/posts", response_model=PostResponse)
async def create_post(data: PostCreate, request: Request):
    user = await require_admin(request)
    
    post_id = f"post_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()
    
    preview = data.preview or data.content[:200] + "..." if len(data.content) > 200 else data.content
    
    post = {
        "post_id": post_id,
        "title": data.title,
        "content": data.content,
        "content_html": render_markdown(data.content),
        "preview": preview,
        "tags": data.tags,
        "author_id": user["user_id"],
        "author_name": user["name"],
        "published": data.published,
        "created_at": now,
        "updated_at": now
    }
    
    await db.posts.insert_one(post)
    
    # Update tags collection
    for tag in data.tags:
        await db.tags.update_one(
            {"name": tag},
            {"$inc": {"count": 1}},
            upsert=True
        )
    
    post["comment_count"] = 0
    post["created_at"] = datetime.fromisoformat(now)
    post["updated_at"] = datetime.fromisoformat(now)
    return post

@api_router.put("/posts/{post_id}", response_model=PostResponse)
async def update_post(post_id: str, data: PostUpdate, request: Request):
    await require_admin(request)
    
    post = await db.posts.find_one({"post_id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if data.title is not None:
        update_data["title"] = data.title
    if data.content is not None:
        update_data["content"] = data.content
        update_data["content_html"] = render_markdown(data.content)
        if data.preview is None:
            update_data["preview"] = data.content[:200] + "..." if len(data.content) > 200 else data.content
    if data.preview is not None:
        update_data["preview"] = data.preview
    if data.tags is not None:
        # Update tag counts
        old_tags = set(post.get("tags", []))
        new_tags = set(data.tags)
        
        for tag in old_tags - new_tags:
            await db.tags.update_one({"name": tag}, {"$inc": {"count": -1}})
        for tag in new_tags - old_tags:
            await db.tags.update_one({"name": tag}, {"$inc": {"count": 1}}, upsert=True)
        
        update_data["tags"] = data.tags
    if data.published is not None:
        update_data["published"] = data.published
    
    await db.posts.update_one({"post_id": post_id}, {"$set": update_data})
    
    updated_post = await db.posts.find_one({"post_id": post_id}, {"_id": 0})
    comment_count = await db.comments.count_documents({"post_id": post_id})
    updated_post["comment_count"] = comment_count
    
    if isinstance(updated_post.get("created_at"), str):
        updated_post["created_at"] = datetime.fromisoformat(updated_post["created_at"])
    if isinstance(updated_post.get("updated_at"), str):
        updated_post["updated_at"] = datetime.fromisoformat(updated_post["updated_at"])
    
    return updated_post

@api_router.delete("/posts/{post_id}")
async def delete_post(post_id: str, request: Request):
    await require_admin(request)
    
    post = await db.posts.find_one({"post_id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Update tag counts
    for tag in post.get("tags", []):
        await db.tags.update_one({"name": tag}, {"$inc": {"count": -1}})
    
    await db.posts.delete_one({"post_id": post_id})
    await db.comments.delete_many({"post_id": post_id})
    
    # Clean up tags with count <= 0
    await db.tags.delete_many({"count": {"$lte": 0}})
    
    return {"message": "Post deleted"}

# ============== COMMENT ROUTES ==============

@api_router.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
async def get_comments(post_id: str):
    comments = await db.comments.find({"post_id": post_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for comment in comments:
        if isinstance(comment.get("created_at"), str):
            comment["created_at"] = datetime.fromisoformat(comment["created_at"])
    
    return comments

@api_router.post("/posts/{post_id}/comments", response_model=CommentResponse)
async def create_comment(post_id: str, data: CommentCreate):
    post = await db.posts.find_one({"post_id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    comment_id = f"comment_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()
    
    comment = {
        "comment_id": comment_id,
        "post_id": post_id,
        "content": data.content,
        "author_name": data.author_name,
        "author_email": data.author_email,
        "created_at": now
    }
    
    await db.comments.insert_one(comment)
    
    comment["created_at"] = datetime.fromisoformat(now)
    return comment

@api_router.delete("/posts/{post_id}/comments/{comment_id}")
async def delete_comment(post_id: str, comment_id: str, request: Request):
    await require_admin(request)
    
    result = await db.comments.delete_one({"comment_id": comment_id, "post_id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    return {"message": "Comment deleted"}

# ============== TAG ROUTES ==============

@api_router.get("/tags", response_model=List[TagResponse])
async def get_tags():
    tags = await db.tags.find({"count": {"$gt": 0}}, {"_id": 0}).sort("count", -1).to_list(50)
    return tags

# ============== ROOT ==============

@api_router.get("/")
async def root():
    return {"message": "Blog API", "version": "1.0"}

# Include the router in the main app
app.include_router(api_router)

# Get CORS origins - when credentials are used, we can't use wildcard
cors_origins_str = os.environ.get('CORS_ORIGINS', '')
if cors_origins_str == '*' or not cors_origins_str:
    # For credentials mode, we need specific origins
    cors_origins = [
        "http://localhost:3000",
        "https://express-thoughts.preview.emergentagent.com"
    ]
else:
    cors_origins = cors_origins_str.split(',')

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
