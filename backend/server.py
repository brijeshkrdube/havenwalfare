from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import aiofiles
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'haven_welfare_secret_key_2024')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# File upload directory
UPLOAD_DIR = ROOT_DIR / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)

# Create the main app
app = FastAPI(title="HavenWelfare API")

# Create a router with /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== HEALTH CHECK ====================
@app.get("/api/health")
async def health_check():
    """Health check endpoint for Render.com and monitoring"""
    try:
        # Test database connection
        await db.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

# ==================== PYDANTIC MODELS ====================

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: str  # doctor, patient

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    phone: Optional[str] = None
    role: str
    status: str  # pending, approved, rejected, suspended
    created_at: str
    profile_data: Optional[dict] = None

class UserWithHistoryResponse(BaseModel):
    """Extended user response with donation history for admin panel"""
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    phone: Optional[str] = None
    role: str
    status: str
    created_at: str
    profile_data: Optional[dict] = None
    donation_history: Optional[List[dict]] = None
    total_donations: Optional[float] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class AdminUpdateProfileRequest(BaseModel):
    """Admin can update their own email and password"""
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

class AdminChangeUserPasswordRequest(BaseModel):
    """Admin can change any user's password"""
    new_password: str

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    profile_data: Optional[dict] = None

class RehabCenterCreate(BaseModel):
    name: str
    address: str
    city: str
    state: str
    pincode: str
    phone: str
    email: Optional[EmailStr] = None
    description: Optional[str] = None
    facilities: Optional[List[str]] = []

class RehabCenterResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    address: str
    city: str
    state: str
    pincode: str
    phone: str
    email: Optional[str] = None
    description: Optional[str] = None
    facilities: List[str] = []
    status: str  # pending, approved, rejected
    created_at: str

class AddictionTypeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    severity_levels: Optional[List[str]] = []

class AddictionTypeResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    description: Optional[str] = None
    severity_levels: List[str] = []
    created_at: str

class PaymentSettingsUpdate(BaseModel):
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    account_holder_name: Optional[str] = None
    upi_id: Optional[str] = None

class SMTPSettingsUpdate(BaseModel):
    sendgrid_api_key: Optional[str] = None
    sender_email: Optional[str] = None
    sender_name: Optional[str] = None

class DonationSubmit(BaseModel):
    patient_id: str
    amount: float
    transaction_id: str
    donor_name: Optional[str] = None
    donor_email: Optional[EmailStr] = None
    donor_phone: Optional[str] = None

class DonationResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    patient_id: str
    patient_name: Optional[str] = None
    amount: float
    transaction_id: str
    donor_name: Optional[str] = None
    donor_email: Optional[str] = None
    donor_phone: Optional[str] = None
    screenshot_url: Optional[str] = None
    status: str  # submitted, under_review, approved, rejected
    admin_remarks: Optional[str] = None
    created_at: str
    updated_at: Optional[str] = None

class DonationApproval(BaseModel):
    status: str  # approved, rejected
    admin_remarks: Optional[str] = None

class TreatmentRequestCreate(BaseModel):
    doctor_id: str
    rehab_center_id: str
    addiction_type_id: str
    description: Optional[str] = None

class TreatmentRequestResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    patient_id: str
    patient_name: Optional[str] = None
    patient_profile_data: Optional[dict] = None  # Patient's medical history
    doctor_id: str
    doctor_name: Optional[str] = None
    rehab_center_id: str
    rehab_center_name: Optional[str] = None
    addiction_type_id: str
    addiction_type_name: Optional[str] = None
    description: Optional[str] = None
    status: str  # pending, accepted, rejected
    treatment_notes: Optional[str] = None
    created_at: str
    updated_at: Optional[str] = None

class TreatmentNoteUpdate(BaseModel):
    treatment_notes: str
    status: Optional[str] = None

class UserStatusUpdate(BaseModel):
    status: str  # approved, rejected, suspended, active

class AuditLogResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    action: str
    details: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: str

class AnalyticsResponse(BaseModel):
    total_users: int
    total_doctors: int
    total_patients: int
    total_donors: int
    total_donations: float
    pending_approvals: int
    total_rehab_centers: int
    recent_donations: List[dict]

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, role: str) -> str:
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if user['status'] == 'suspended':
        raise HTTPException(status_code=403, detail="Account suspended")
    return user

async def require_role(roles: List[str]):
    async def role_checker(user: dict = Depends(get_current_user)):
        if user['role'] not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return role_checker

async def get_admin_user(user: dict = Depends(get_current_user)):
    if user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

async def get_doctor_user(user: dict = Depends(get_current_user)):
    if user['role'] != 'doctor':
        raise HTTPException(status_code=403, detail="Doctor access required")
    return user

async def get_patient_user(user: dict = Depends(get_current_user)):
    if user['role'] != 'patient':
        raise HTTPException(status_code=403, detail="Patient access required")
    return user

async def log_audit(user_id: str, user_email: str, action: str, details: str = None, ip_address: str = None):
    audit = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "user_email": user_email,
        "action": action,
        "details": details,
        "ip_address": ip_address,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.audit_logs.insert_one(audit)

async def send_password_reset_email(email: str, token: str, name: str):
    settings = await db.admin_settings.find_one({"type": "smtp"}, {"_id": 0})
    if not settings or not settings.get('sendgrid_api_key'):
        logger.warning("SMTP not configured, cannot send password reset email")
        return False
    
    try:
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        reset_link = f"{frontend_url}/reset-password?token={token}"
        
        message = Mail(
            from_email=settings.get('sender_email', 'noreply@havenwelfare.com'),
            to_emails=email,
            subject='Password Reset Request - HavenWelfare',
            html_content=f"""
            <html>
            <body style="font-family: Inter, sans-serif; color: #0f392b; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: #f4f1ea; padding: 40px; border-radius: 16px;">
                    <h1 style="font-family: Manrope, sans-serif; color: #0f392b;">Password Reset</h1>
                    <p>Hello {name},</p>
                    <p>You requested to reset your password. Click the button below to proceed:</p>
                    <a href="{reset_link}" style="display: inline-block; background: #d97757; color: white; padding: 12px 32px; border-radius: 50px; text-decoration: none; margin: 20px 0;">Reset Password</a>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #e0e6e4; margin: 20px 0;">
                    <p style="font-size: 12px; color: #5c706a;">HavenWelfare - Rehabilitation & Welfare Platform</p>
                </div>
            </body>
            </html>
            """
        )
        
        sg = SendGridAPIClient(settings['sendgrid_api_key'])
        sg.send(message)
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False

async def send_user_status_notification(email: str, name: str, status: str, role: str):
    """Send email notification when user status changes (approved/rejected/suspended)"""
    settings = await db.admin_settings.find_one({"type": "smtp"}, {"_id": 0})
    if not settings or not settings.get('sendgrid_api_key'):
        logger.warning("SMTP not configured, cannot send user status notification")
        return False
    
    try:
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        
        status_messages = {
            'approved': {
                'subject': 'Account Approved - HavenWelfare',
                'heading': 'Your Account Has Been Approved!',
                'message': f'Great news! Your {role} account has been approved. You can now log in and access all features.',
                'button_text': 'Login Now',
                'button_link': f'{frontend_url}/login',
                'color': '#22c55e'
            },
            'rejected': {
                'subject': 'Account Application Update - HavenWelfare',
                'heading': 'Account Application Not Approved',
                'message': 'Unfortunately, your account application was not approved at this time. Please contact our support team for more information.',
                'button_text': 'Contact Support',
                'button_link': f'{frontend_url}',
                'color': '#ef4444'
            },
            'suspended': {
                'subject': 'Account Suspended - HavenWelfare',
                'heading': 'Your Account Has Been Suspended',
                'message': 'Your account has been temporarily suspended. Please contact our support team for more information.',
                'button_text': 'Contact Support',
                'button_link': f'{frontend_url}',
                'color': '#f59e0b'
            }
        }
        
        info = status_messages.get(status)
        if not info:
            return False
        
        message = Mail(
            from_email=settings.get('sender_email', 'noreply@havenwelfare.com'),
            to_emails=email,
            subject=info['subject'],
            html_content=f"""
            <html>
            <body style="font-family: Inter, sans-serif; color: #0f392b; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: #f4f1ea; padding: 40px; border-radius: 16px;">
                    <h1 style="font-family: Manrope, sans-serif; color: {info['color']};">{info['heading']}</h1>
                    <p>Hello {name},</p>
                    <p>{info['message']}</p>
                    <a href="{info['button_link']}" style="display: inline-block; background: #d97757; color: white; padding: 12px 32px; border-radius: 50px; text-decoration: none; margin: 20px 0;">{info['button_text']}</a>
                    <hr style="border: none; border-top: 1px solid #e0e6e4; margin: 20px 0;">
                    <p style="font-size: 12px; color: #5c706a;">HavenWelfare - Rehabilitation & Welfare Platform</p>
                </div>
            </body>
            </html>
            """
        )
        
        sg = SendGridAPIClient(settings['sendgrid_api_key'])
        sg.send(message)
        logger.info(f"User status notification sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send user status notification: {e}")
        return False

async def send_donation_notification(donor_email: str, donor_name: str, patient_name: str, amount: float, status: str, admin_remarks: str = None):
    """Send email notification when donation status changes"""
    settings = await db.admin_settings.find_one({"type": "smtp"}, {"_id": 0})
    if not settings or not settings.get('sendgrid_api_key'):
        logger.warning("SMTP not configured, cannot send donation notification")
        return False
    
    if not donor_email:
        logger.warning("No donor email provided, cannot send notification")
        return False
    
    try:
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        
        if status == 'approved':
            subject = 'Donation Approved - HavenWelfare'
            heading = 'Thank You for Your Generous Donation!'
            message = f'Your donation of ${amount:,.2f} to support {patient_name} has been verified and approved.'
            extra_message = 'You can now download your donation receipt from our portal.'
            button_text = 'View Receipt'
            color = '#22c55e'
        else:
            subject = 'Donation Status Update - HavenWelfare'
            heading = 'Donation Verification Update'
            message = f'Your donation submission of ${amount:,.2f} could not be verified at this time.'
            extra_message = f'Admin remarks: {admin_remarks}' if admin_remarks else 'Please contact support for more details.'
            button_text = 'Contact Support'
            color = '#ef4444'
        
        html_message = Mail(
            from_email=settings.get('sender_email', 'noreply@havenwelfare.com'),
            to_emails=donor_email,
            subject=subject,
            html_content=f"""
            <html>
            <body style="font-family: Inter, sans-serif; color: #0f392b; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: #f4f1ea; padding: 40px; border-radius: 16px;">
                    <h1 style="font-family: Manrope, sans-serif; color: {color};">{heading}</h1>
                    <p>Hello {donor_name or 'Donor'},</p>
                    <p>{message}</p>
                    <p>{extra_message}</p>
                    <a href="{frontend_url}/donate" style="display: inline-block; background: #d97757; color: white; padding: 12px 32px; border-radius: 50px; text-decoration: none; margin: 20px 0;">{button_text}</a>
                    <hr style="border: none; border-top: 1px solid #e0e6e4; margin: 20px 0;">
                    <p style="font-size: 12px; color: #5c706a;">HavenWelfare - Rehabilitation & Welfare Platform</p>
                </div>
            </body>
            </html>
            """
        )
        
        sg = SendGridAPIClient(settings['sendgrid_api_key'])
        sg.send(html_message)
        logger.info(f"Donation notification sent to {donor_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send donation notification: {e}")
        return False

# ==================== SEED ADMIN ====================

async def seed_admin():
    admin_email = "brijesh.kr.dube@gmail.com"
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        admin = {
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "name": "Super Admin",
            "password": hash_password("Haven@9874"),
            "role": "admin",
            "status": "approved",
            "phone": None,
            "profile_data": {},
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin)
        logger.info("Default admin account created")

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/register", response_model=UserResponse)
async def register(user: UserCreate):
    if user.role not in ['doctor', 'patient']:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'doctor' or 'patient'")
    
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_doc = {
        "id": str(uuid.uuid4()),
        "email": user.email,
        "name": user.name,
        "phone": user.phone,
        "password": hash_password(user.password),
        "role": user.role,
        "status": "pending",
        "profile_data": {},
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    await log_audit(user_doc['id'], user.email, "USER_REGISTERED", f"New {user.role} registration")
    
    return UserResponse(**{k: v for k, v in user_doc.items() if k != 'password'})

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if user['status'] == 'suspended':
        raise HTTPException(status_code=403, detail="Account suspended")
    
    if user['status'] == 'pending' and user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Account pending approval")
    
    if user['status'] == 'rejected':
        raise HTTPException(status_code=403, detail="Account rejected")
    
    token = create_token(user['id'], user['role'])
    await log_audit(user['id'], user['email'], "USER_LOGIN")
    
    return {
        "token": token,
        "user": UserResponse(**{k: v for k, v in user.items() if k != 'password'})
    }

@api_router.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, background_tasks: BackgroundTasks):
    user = await db.users.find_one({"email": request.email}, {"_id": 0})
    if not user:
        # Return success even if user doesn't exist (security)
        return {"message": "If email exists, password reset link will be sent"}
    
    # Create reset token
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    reset_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user['id'],
        "token": token,
        "expires_at": expires_at.isoformat(),
        "used": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.password_reset_tokens.insert_one(reset_doc)
    background_tasks.add_task(send_password_reset_email, user['email'], token, user['name'])
    
    return {"message": "If email exists, password reset link will be sent"}

@api_router.post("/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    token_doc = await db.password_reset_tokens.find_one({"token": request.token, "used": False}, {"_id": 0})
    if not token_doc:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    expires_at = datetime.fromisoformat(token_doc['expires_at'])
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="Token has expired")
    
    # Update password
    new_hash = hash_password(request.new_password)
    await db.users.update_one(
        {"id": token_doc['user_id']},
        {"$set": {"password": new_hash}}
    )
    
    # Mark token as used
    await db.password_reset_tokens.update_one(
        {"token": request.token},
        {"$set": {"used": True}}
    )
    
    user = await db.users.find_one({"id": token_doc['user_id']}, {"_id": 0})
    await log_audit(user['id'], user['email'], "PASSWORD_RESET")
    
    return {"message": "Password reset successfully"}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(**{k: v for k, v in user.items() if k != 'password'})

@api_router.put("/auth/change-password")
async def change_password(request: ChangePasswordRequest, user: dict = Depends(get_current_user)):
    if not verify_password(request.current_password, user['password']):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    new_hash = hash_password(request.new_password)
    await db.users.update_one(
        {"id": user['id']},
        {"$set": {"password": new_hash}}
    )
    
    await log_audit(user['id'], user['email'], "PASSWORD_CHANGED")
    return {"message": "Password changed successfully"}

@api_router.put("/auth/profile", response_model=UserResponse)
async def update_profile(request: UpdateProfileRequest, user: dict = Depends(get_current_user)):
    update_data = {}
    if request.name:
        update_data['name'] = request.name
    if request.phone:
        update_data['phone'] = request.phone
    if request.email and request.email != user['email']:
        existing = await db.users.find_one({"email": request.email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        update_data['email'] = request.email
    if request.profile_data is not None:
        # Merge with existing profile_data
        existing_profile = user.get('profile_data', {}) or {}
        merged_profile = {**existing_profile, **request.profile_data}
        update_data['profile_data'] = merged_profile
    
    if update_data:
        await db.users.update_one({"id": user['id']}, {"$set": update_data})
        await log_audit(user['id'], user['email'], "PROFILE_UPDATED")
    
    updated_user = await db.users.find_one({"id": user['id']}, {"_id": 0})
    return UserResponse(**{k: v for k, v in updated_user.items() if k != 'password'})

# ==================== ADMIN ENDPOINTS ====================

@api_router.get("/admin/users", response_model=List[UserWithHistoryResponse])
async def get_all_users(status: Optional[str] = None, role: Optional[str] = None, admin: dict = Depends(get_admin_user)):
    query = {}
    if status:
        query['status'] = status
    if role:
        query['role'] = role
    
    users = await db.users.find(query, {"_id": 0, "password": 0}).to_list(1000)
    
    # Enrich patient users with donation history
    enriched_users = []
    for user in users:
        user_data = dict(user)
        if user['role'] == 'patient':
            # Fetch donation history for this patient
            donations = await db.donations.find(
                {"patient_id": user['id']},
                {"_id": 0}
            ).sort("created_at", -1).to_list(100)
            
            user_data['donation_history'] = donations
            
            # Calculate total approved donations
            total = sum(d['amount'] for d in donations if d.get('status') == 'approved')
            user_data['total_donations'] = total
        else:
            user_data['donation_history'] = None
            user_data['total_donations'] = None
            
        enriched_users.append(UserWithHistoryResponse(**user_data))
    
    return enriched_users

@api_router.put("/admin/users/{user_id}/status")
async def update_user_status(user_id: str, request: UserStatusUpdate, background_tasks: BackgroundTasks, admin: dict = Depends(get_admin_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.users.update_one({"id": user_id}, {"$set": {"status": request.status}})
    await log_audit(admin['id'], admin['email'], "USER_STATUS_UPDATED", f"User {user['email']} status changed to {request.status}")
    
    # Send email notification in background
    background_tasks.add_task(
        send_user_status_notification, 
        user['email'], 
        user['name'], 
        request.status, 
        user['role']
    )
    
    return {"message": f"User status updated to {request.status}"}

@api_router.get("/admin/analytics", response_model=AnalyticsResponse)
async def get_analytics(admin: dict = Depends(get_admin_user)):
    total_users = await db.users.count_documents({})
    total_doctors = await db.users.count_documents({"role": "doctor"})
    total_patients = await db.users.count_documents({"role": "patient"})
    total_donors = await db.donations.distinct("donor_email")
    
    # Sum approved donations
    pipeline = [
        {"$match": {"status": "approved"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    donation_sum = await db.donations.aggregate(pipeline).to_list(1)
    total_donations = donation_sum[0]['total'] if donation_sum else 0
    
    pending_users = await db.users.count_documents({"status": "pending"})
    pending_centers = await db.rehab_centers.count_documents({"status": "pending"})
    pending_approvals = pending_users + pending_centers
    
    total_rehab_centers = await db.rehab_centers.count_documents({"status": "approved"})
    
    recent_donations = await db.donations.find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    
    return AnalyticsResponse(
        total_users=total_users,
        total_doctors=total_doctors,
        total_patients=total_patients,
        total_donors=len(total_donors),
        total_donations=total_donations,
        pending_approvals=pending_approvals,
        total_rehab_centers=total_rehab_centers,
        recent_donations=recent_donations
    )

@api_router.get("/admin/audit-logs", response_model=List[AuditLogResponse])
async def get_audit_logs(limit: int = 100, admin: dict = Depends(get_admin_user)):
    logs = await db.audit_logs.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return [AuditLogResponse(**log) for log in logs]

# Payment Settings
@api_router.get("/admin/payment-settings")
async def get_payment_settings(admin: dict = Depends(get_admin_user)):
    settings = await db.admin_settings.find_one({"type": "payment"}, {"_id": 0})
    return settings or {"type": "payment"}

@api_router.put("/admin/payment-settings")
async def update_payment_settings(request: PaymentSettingsUpdate, admin: dict = Depends(get_admin_user)):
    update_data = request.model_dump(exclude_none=True)
    update_data['type'] = 'payment'
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.admin_settings.update_one(
        {"type": "payment"},
        {"$set": update_data},
        upsert=True
    )
    
    await log_audit(admin['id'], admin['email'], "PAYMENT_SETTINGS_UPDATED")
    return {"message": "Payment settings updated"}

@api_router.post("/admin/payment-settings/qr-code")
async def upload_qr_code(file: UploadFile = File(...), admin: dict = Depends(get_admin_user)):
    filename = f"qr_code_{uuid.uuid4()}{Path(file.filename).suffix}"
    filepath = UPLOAD_DIR / filename
    
    async with aiofiles.open(filepath, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    await db.admin_settings.update_one(
        {"type": "payment"},
        {"$set": {"qr_code_url": f"/uploads/{filename}", "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    
    await log_audit(admin['id'], admin['email'], "QR_CODE_UPLOADED")
    return {"qr_code_url": f"/uploads/{filename}"}

# SMTP Settings
@api_router.get("/admin/smtp-settings")
async def get_smtp_settings(admin: dict = Depends(get_admin_user)):
    settings = await db.admin_settings.find_one({"type": "smtp"}, {"_id": 0})
    if settings and 'sendgrid_api_key' in settings:
        # Mask the API key
        key = settings['sendgrid_api_key']
        settings['sendgrid_api_key'] = key[:8] + '...' + key[-4:] if len(key) > 12 else '***'
    return settings or {"type": "smtp"}

@api_router.put("/admin/smtp-settings")
async def update_smtp_settings(request: SMTPSettingsUpdate, admin: dict = Depends(get_admin_user)):
    update_data = request.model_dump(exclude_none=True)
    update_data['type'] = 'smtp'
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.admin_settings.update_one(
        {"type": "smtp"},
        {"$set": update_data},
        upsert=True
    )
    
    await log_audit(admin['id'], admin['email'], "SMTP_SETTINGS_UPDATED")
    return {"message": "SMTP settings updated"}

# ==================== REHAB CENTERS ====================

@api_router.post("/rehab-centers", response_model=RehabCenterResponse)
async def create_rehab_center(center: RehabCenterCreate, admin: dict = Depends(get_admin_user)):
    center_doc = {
        "id": str(uuid.uuid4()),
        **center.model_dump(),
        "status": "approved",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.rehab_centers.insert_one(center_doc)
    await log_audit(admin['id'], admin['email'], "REHAB_CENTER_CREATED", center.name)
    
    return RehabCenterResponse(**center_doc)

@api_router.get("/rehab-centers", response_model=List[RehabCenterResponse])
async def get_rehab_centers(status: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {}
    if status:
        query['status'] = status
    elif user['role'] != 'admin':
        query['status'] = 'approved'
    
    centers = await db.rehab_centers.find(query, {"_id": 0}).to_list(1000)
    return [RehabCenterResponse(**c) for c in centers]

@api_router.get("/rehab-centers/{center_id}", response_model=RehabCenterResponse)
async def get_rehab_center(center_id: str, user: dict = Depends(get_current_user)):
    center = await db.rehab_centers.find_one({"id": center_id}, {"_id": 0})
    if not center:
        raise HTTPException(status_code=404, detail="Rehab center not found")
    return RehabCenterResponse(**center)

@api_router.put("/rehab-centers/{center_id}", response_model=RehabCenterResponse)
async def update_rehab_center(center_id: str, center: RehabCenterCreate, admin: dict = Depends(get_admin_user)):
    existing = await db.rehab_centers.find_one({"id": center_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Rehab center not found")
    
    update_data = center.model_dump()
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.rehab_centers.update_one({"id": center_id}, {"$set": update_data})
    await log_audit(admin['id'], admin['email'], "REHAB_CENTER_UPDATED", center.name)
    
    updated = await db.rehab_centers.find_one({"id": center_id}, {"_id": 0})
    return RehabCenterResponse(**updated)

@api_router.delete("/rehab-centers/{center_id}")
async def delete_rehab_center(center_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.rehab_centers.delete_one({"id": center_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Rehab center not found")
    
    await log_audit(admin['id'], admin['email'], "REHAB_CENTER_DELETED", center_id)
    return {"message": "Rehab center deleted"}

# ==================== ADDICTION TYPES ====================

@api_router.post("/addiction-types", response_model=AddictionTypeResponse)
async def create_addiction_type(addiction: AddictionTypeCreate, admin: dict = Depends(get_admin_user)):
    addiction_doc = {
        "id": str(uuid.uuid4()),
        **addiction.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.addiction_types.insert_one(addiction_doc)
    await log_audit(admin['id'], admin['email'], "ADDICTION_TYPE_CREATED", addiction.name)
    
    return AddictionTypeResponse(**addiction_doc)

@api_router.get("/addiction-types", response_model=List[AddictionTypeResponse])
async def get_addiction_types():
    types = await db.addiction_types.find({}, {"_id": 0}).to_list(1000)
    return [AddictionTypeResponse(**t) for t in types]

@api_router.put("/addiction-types/{type_id}", response_model=AddictionTypeResponse)
async def update_addiction_type(type_id: str, addiction: AddictionTypeCreate, admin: dict = Depends(get_admin_user)):
    existing = await db.addiction_types.find_one({"id": type_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Addiction type not found")
    
    update_data = addiction.model_dump()
    await db.addiction_types.update_one({"id": type_id}, {"$set": update_data})
    
    updated = await db.addiction_types.find_one({"id": type_id}, {"_id": 0})
    return AddictionTypeResponse(**updated)

@api_router.delete("/addiction-types/{type_id}")
async def delete_addiction_type(type_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.addiction_types.delete_one({"id": type_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Addiction type not found")
    return {"message": "Addiction type deleted"}

# ==================== DONATIONS ====================

@api_router.get("/donations/payment-info")
async def get_public_payment_info():
    settings = await db.admin_settings.find_one({"type": "payment"}, {"_id": 0})
    if not settings:
        return {"message": "Payment details not configured yet"}
    # Return only public fields
    return {
        "bank_name": settings.get('bank_name'),
        "account_number": settings.get('account_number'),
        "ifsc_code": settings.get('ifsc_code'),
        "account_holder_name": settings.get('account_holder_name'),
        "upi_id": settings.get('upi_id'),
        "qr_code_url": settings.get('qr_code_url')
    }

@api_router.get("/donations/patients")
async def get_donatable_patients():
    # Get approved patients who are accepting donations
    patients = await db.users.find(
        {"role": "patient", "status": "approved"},
        {"_id": 0, "password": 0}
    ).to_list(1000)
    return patients

@api_router.post("/donations", response_model=DonationResponse)
async def submit_donation(
    patient_id: str = Form(...),
    amount: float = Form(...),
    transaction_id: str = Form(...),
    donor_name: Optional[str] = Form(None),
    donor_email: Optional[str] = Form(None),
    donor_phone: Optional[str] = Form(None),
    screenshot: Optional[UploadFile] = File(None)
):
    # Verify patient exists and is approved
    patient = await db.users.find_one({"id": patient_id, "role": "patient", "status": "approved"}, {"_id": 0})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found or not approved")
    
    screenshot_url = None
    if screenshot:
        filename = f"donation_{uuid.uuid4()}{Path(screenshot.filename).suffix}"
        filepath = UPLOAD_DIR / filename
        async with aiofiles.open(filepath, 'wb') as f:
            content = await screenshot.read()
            await f.write(content)
        screenshot_url = f"/uploads/{filename}"
    
    donation_doc = {
        "id": str(uuid.uuid4()),
        "patient_id": patient_id,
        "patient_name": patient['name'],
        "amount": amount,
        "transaction_id": transaction_id,
        "donor_name": donor_name,
        "donor_email": donor_email,
        "donor_phone": donor_phone,
        "screenshot_url": screenshot_url,
        "status": "submitted",
        "admin_remarks": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": None
    }
    
    await db.donations.insert_one(donation_doc)
    await log_audit(None, donor_email or "anonymous", "DONATION_SUBMITTED", f"Amount: {amount}, Patient: {patient['name']}")
    
    return DonationResponse(**donation_doc)

@api_router.get("/donations", response_model=List[DonationResponse])
async def get_donations(status: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {}
    
    if user['role'] == 'patient':
        query['patient_id'] = user['id']
    elif user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Access denied")
    
    if status:
        query['status'] = status
    
    donations = await db.donations.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [DonationResponse(**d) for d in donations]

@api_router.get("/donations/{donation_id}", response_model=DonationResponse)
async def get_donation(donation_id: str, user: dict = Depends(get_current_user)):
    donation = await db.donations.find_one({"id": donation_id}, {"_id": 0})
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    # Check access
    if user['role'] == 'patient' and donation['patient_id'] != user['id']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return DonationResponse(**donation)

@api_router.get("/donations/track/{transaction_id}")
async def track_donation(transaction_id: str):
    donation = await db.donations.find_one({"transaction_id": transaction_id}, {"_id": 0})
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    return {
        "donation_id": donation['id'],
        "transaction_id": donation['transaction_id'],
        "amount": donation['amount'],
        "status": donation['status'],
        "created_at": donation['created_at'],
        "admin_remarks": donation.get('admin_remarks')
    }

@api_router.put("/donations/{donation_id}/approve", response_model=DonationResponse)
async def approve_donation(donation_id: str, approval: DonationApproval, background_tasks: BackgroundTasks, admin: dict = Depends(get_admin_user)):
    donation = await db.donations.find_one({"id": donation_id}, {"_id": 0})
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    update_data = {
        "status": approval.status,
        "admin_remarks": approval.admin_remarks,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.donations.update_one({"id": donation_id}, {"$set": update_data})
    await log_audit(admin['id'], admin['email'], f"DONATION_{approval.status.upper()}", f"Donation ID: {donation_id}")
    
    # Send email notification in background if donor email exists
    if donation.get('donor_email'):
        background_tasks.add_task(
            send_donation_notification,
            donation['donor_email'],
            donation.get('donor_name'),
            donation.get('patient_name', 'a patient'),
            donation['amount'],
            approval.status,
            approval.admin_remarks
        )
    
    updated = await db.donations.find_one({"id": donation_id}, {"_id": 0})
    return DonationResponse(**updated)

@api_router.get("/donations/{donation_id}/receipt")
async def get_donation_receipt(donation_id: str):
    """Generate and return a donation receipt for approved donations"""
    donation = await db.donations.find_one({"id": donation_id}, {"_id": 0})
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    if donation['status'] != 'approved':
        raise HTTPException(status_code=400, detail="Receipt is only available for approved donations")
    
    # Get patient info
    patient = await db.users.find_one({"id": donation['patient_id']}, {"_id": 0, "password": 0})
    patient_name = patient['name'] if patient else donation.get('patient_name', 'Unknown')
    
    # Generate receipt data
    receipt = {
        "receipt_number": f"HW-{donation['id'][:8].upper()}",
        "donation_id": donation['id'],
        "transaction_id": donation['transaction_id'],
        "amount": donation['amount'],
        "currency": "USD",
        "donor_name": donation.get('donor_name') or 'Anonymous',
        "donor_email": donation.get('donor_email') or 'Not provided',
        "patient_name": patient_name,
        "donation_date": donation['created_at'],
        "approval_date": donation.get('updated_at', donation['created_at']),
        "status": "Approved",
        "organization": "HavenWelfare",
        "organization_message": "Thank you for your generous donation. Your contribution helps support rehabilitation and recovery programs."
    }
    
    return receipt

# ==================== TREATMENT REQUESTS ====================

@api_router.post("/treatment-requests", response_model=TreatmentRequestResponse)
async def create_treatment_request(request: TreatmentRequestCreate, patient: dict = Depends(get_patient_user)):
    # Verify doctor exists and is approved
    doctor = await db.users.find_one({"id": request.doctor_id, "role": "doctor", "status": "approved"}, {"_id": 0})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found or not approved")
    
    # Verify rehab center exists
    center = await db.rehab_centers.find_one({"id": request.rehab_center_id, "status": "approved"}, {"_id": 0})
    if not center:
        raise HTTPException(status_code=404, detail="Rehab center not found or not approved")
    
    # Verify addiction type exists
    addiction = await db.addiction_types.find_one({"id": request.addiction_type_id}, {"_id": 0})
    if not addiction:
        raise HTTPException(status_code=404, detail="Addiction type not found")
    
    request_doc = {
        "id": str(uuid.uuid4()),
        "patient_id": patient['id'],
        "patient_name": patient['name'],
        "doctor_id": request.doctor_id,
        "doctor_name": doctor['name'],
        "rehab_center_id": request.rehab_center_id,
        "rehab_center_name": center['name'],
        "addiction_type_id": request.addiction_type_id,
        "addiction_type_name": addiction['name'],
        "description": request.description,
        "status": "pending",
        "treatment_notes": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": None
    }
    
    await db.treatment_requests.insert_one(request_doc)
    await log_audit(patient['id'], patient['email'], "TREATMENT_REQUEST_CREATED")
    
    return TreatmentRequestResponse(**request_doc)

@api_router.get("/treatment-requests", response_model=List[TreatmentRequestResponse])
async def get_treatment_requests(status: Optional[str] = None, user: dict = Depends(get_current_user)):
    query = {}
    
    if user['role'] == 'patient':
        query['patient_id'] = user['id']
    elif user['role'] == 'doctor':
        query['doctor_id'] = user['id']
    elif user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Access denied")
    
    if status:
        query['status'] = status
    
    requests = await db.treatment_requests.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    # Enrich with patient profile data for doctors and admins
    enriched_requests = []
    for req in requests:
        req_data = dict(req)
        if user['role'] in ['doctor', 'admin']:
            # Fetch patient profile data
            patient = await db.users.find_one(
                {"id": req['patient_id']},
                {"_id": 0, "password": 0}
            )
            if patient:
                req_data['patient_profile_data'] = patient.get('profile_data', {})
            else:
                req_data['patient_profile_data'] = None
        else:
            req_data['patient_profile_data'] = None
        
        enriched_requests.append(TreatmentRequestResponse(**req_data))
    
    return enriched_requests

@api_router.put("/treatment-requests/{request_id}/respond")
async def respond_to_treatment_request(request_id: str, response: str, doctor: dict = Depends(get_doctor_user)):
    if response not in ['accepted', 'rejected']:
        raise HTTPException(status_code=400, detail="Response must be 'accepted' or 'rejected'")
    
    request_doc = await db.treatment_requests.find_one({"id": request_id, "doctor_id": doctor['id']}, {"_id": 0})
    if not request_doc:
        raise HTTPException(status_code=404, detail="Treatment request not found")
    
    await db.treatment_requests.update_one(
        {"id": request_id},
        {"$set": {"status": response, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    await log_audit(doctor['id'], doctor['email'], f"TREATMENT_REQUEST_{response.upper()}", request_id)
    return {"message": f"Treatment request {response}"}

@api_router.put("/treatment-requests/{request_id}/notes")
async def update_treatment_notes(request_id: str, update: TreatmentNoteUpdate, doctor: dict = Depends(get_doctor_user)):
    request_doc = await db.treatment_requests.find_one({"id": request_id, "doctor_id": doctor['id']}, {"_id": 0})
    if not request_doc:
        raise HTTPException(status_code=404, detail="Treatment request not found")
    
    update_data = {"treatment_notes": update.treatment_notes, "updated_at": datetime.now(timezone.utc).isoformat()}
    if update.status:
        update_data['status'] = update.status
    
    await db.treatment_requests.update_one({"id": request_id}, {"$set": update_data})
    await log_audit(doctor['id'], doctor['email'], "TREATMENT_NOTES_UPDATED", request_id)
    
    return {"message": "Treatment notes updated"}

# ==================== DOCTOR ENDPOINTS ====================

@api_router.get("/doctors", response_model=List[UserResponse])
async def get_approved_doctors():
    doctors = await db.users.find(
        {"role": "doctor", "status": "approved"},
        {"_id": 0, "password": 0}
    ).to_list(1000)
    return [UserResponse(**d) for d in doctors]

@api_router.post("/doctors/verification-document")
async def upload_verification_document(file: UploadFile = File(...), doctor: dict = Depends(get_doctor_user)):
    filename = f"doc_verify_{doctor['id']}_{uuid.uuid4()}{Path(file.filename).suffix}"
    filepath = UPLOAD_DIR / filename
    
    async with aiofiles.open(filepath, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # Update doctor's profile data
    profile_data = doctor.get('profile_data', {})
    if 'verification_documents' not in profile_data:
        profile_data['verification_documents'] = []
    profile_data['verification_documents'].append(f"/uploads/{filename}")
    
    await db.users.update_one({"id": doctor['id']}, {"$set": {"profile_data": profile_data}})
    await log_audit(doctor['id'], doctor['email'], "VERIFICATION_DOC_UPLOADED")
    
    return {"document_url": f"/uploads/{filename}"}

@api_router.put("/doctors/profile-data")
async def update_doctor_profile_data(data: dict, doctor: dict = Depends(get_doctor_user)):
    profile_data = doctor.get('profile_data', {})
    profile_data.update(data)
    
    await db.users.update_one({"id": doctor['id']}, {"$set": {"profile_data": profile_data}})
    return {"message": "Profile data updated"}

# ==================== STARTUP ====================

@app.on_event("startup")
async def startup():
    await seed_admin()
    logger.info("Application started, admin seeded")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Include router and configure static files
app.include_router(api_router)

# Mount uploads directory for static files
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
