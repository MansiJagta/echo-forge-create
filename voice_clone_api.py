from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends, Header
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import tempfile
import shutil
import uuid
from pathlib import Path
import requests
from typing import Optional, List
import json
import logging
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt
from supabase import create_client, Client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Voice Clone API",
    description="API for voice cloning and speech synthesis with Supabase integration",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "your-elevenlabs-api-key")
ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1"
SUPABASE_URL = os.getenv("SUPABASE_URL", "your-supabase-url")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "your-supabase-anon-key")
JWT_SECRET = os.getenv("JWT_SECRET", "your-jwt-secret-key")
UPLOAD_DIR = "uploads/voice_samples"
OUTPUT_DIR = "outputs/generated_speech"
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15MB
ALLOWED_AUDIO_TYPES = ["audio/wav", "audio/mp3", "audio/webm", "audio/mpeg"]

# Create directories if they don't exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Security
security = HTTPBearer()

# Pydantic models
class UserCreate(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class VoiceCloneRequest(BaseModel):
    text: str
    voice_sample_url: Optional[str] = None

class VoiceCloneResponse(BaseModel):
    message: str
    status: str
    audio_url: Optional[str] = None
    voice_id: Optional[str] = None
    error: Optional[str] = None
    audio_id: Optional[str] = None

class AudioHistoryItem(BaseModel):
    id: str
    user_id: str
    filename: str
    text: str
    voice_id: str
    audio_url: str
    created_at: datetime
    duration: Optional[float] = None

# Authentication functions
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def create_jwt_token(user_id: str) -> str:
    """Create JWT token for user"""
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def validate_audio_file(file: UploadFile) -> bool:
    """Validate the uploaded audio file"""
    if not file.content_type in ALLOWED_AUDIO_TYPES:
        return False
    
    # Check file size (read first 1024 bytes to get size estimate)
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning
    
    if file_size > MAX_FILE_SIZE:
        return False
    
    return True

def save_uploaded_file(file: UploadFile) -> str:
    """Save uploaded file and return the file path"""
    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return file_path

def create_voice_with_elevenlabs(voice_sample_path: str) -> str:
    """Create a voice clone using ElevenLabs API"""
    try:
        # First, add the voice to ElevenLabs
        add_voice_url = f"{ELEVENLABS_BASE_URL}/voices/add"
        
        with open(voice_sample_path, "rb") as audio_file:
            files = {
                "files": (os.path.basename(voice_sample_path), audio_file, "audio/wav"),
                "name": f"voice_clone_{uuid.uuid4().hex[:8]}",
                "description": "Voice clone created via API"
            }
            
            headers = {
                "xi-api-key": ELEVENLABS_API_KEY
            }
            
            response = requests.post(add_voice_url, files=files, headers=headers)
            
            if response.status_code == 200:
                voice_data = response.json()
                voice_id = voice_data.get("voice_id")
                logger.info(f"Voice created successfully with ID: {voice_id}")
                return voice_id
            else:
                logger.error(f"Failed to create voice: {response.text}")
                raise HTTPException(status_code=400, detail=f"Failed to create voice: {response.text}")
                
    except Exception as e:
        logger.error(f"Error creating voice: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating voice: {str(e)}")

def generate_speech_with_elevenlabs(text: str, voice_id: str) -> str:
    """Generate speech using ElevenLabs API"""
    try:
        # Generate speech
        tts_url = f"{ELEVENLABS_BASE_URL}/text-to-speech/{voice_id}"
        
        headers = {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json"
        }
        
        data = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.5
            }
        }
        
        response = requests.post(tts_url, json=data, headers=headers)
        
        if response.status_code == 200:
            # Save the generated audio
            output_filename = f"generated_speech_{uuid.uuid4().hex[:8]}.mp3"
            output_path = os.path.join(OUTPUT_DIR, output_filename)
            
            with open(output_path, "wb") as f:
                f.write(response.content)
            
            logger.info(f"Speech generated successfully: {output_path}")
            return output_path
        else:
            logger.error(f"Failed to generate speech: {response.text}")
            raise HTTPException(status_code=400, detail=f"Failed to generate speech: {response.text}")
            
    except Exception as e:
        logger.error(f"Error generating speech: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating speech: {str(e)}")

def save_audio_to_supabase(user_id: str, filename: str, text: str, voice_id: str, audio_url: str, duration: Optional[float] = None) -> str:
    """Save audio record to Supabase"""
    try:
        audio_data = {
            "user_id": user_id,
            "filename": filename,
            "text": text,
            "voice_id": voice_id,
            "audio_url": audio_url,
            "duration": duration,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("audio_history").insert(audio_data).execute()
        
        if result.data:
            audio_id = result.data[0]["id"]
            logger.info(f"Audio saved to Supabase with ID: {audio_id}")
            return audio_id
        else:
            raise Exception("Failed to save audio to Supabase")
            
    except Exception as e:
        logger.error(f"Error saving audio to Supabase: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error saving audio: {str(e)}")

# Authentication endpoints
@app.post("/auth/register")
async def register(user_data: UserCreate):
    """Register a new user"""
    try:
        # Create user in Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password
        })
        
        if auth_response.user:
            user_id = auth_response.user.id
            
            # Store additional user data
            profile_data = {
                "id": user_id,
                "email": user_data.email,
                "name": user_data.name or user_data.email.split('@')[0],
                "created_at": datetime.utcnow().isoformat()
            }
            
            supabase.table("user_profiles").insert(profile_data).execute()
            
            # Create JWT token
            token = create_jwt_token(user_id)
            
            return {
                "message": "User registered successfully",
                "token": token,
                "user_id": user_id,
                "email": user_data.email
            }
        else:
            raise HTTPException(status_code=400, detail="Registration failed")
            
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Registration failed: {str(e)}")

@app.post("/auth/login")
async def login(user_data: UserLogin):
    """Login user"""
    try:
        # Authenticate with Supabase
        auth_response = supabase.auth.sign_in_with_password({
            "email": user_data.email,
            "password": user_data.password
        })
        
        if auth_response.user:
            user_id = auth_response.user.id
            
            # Create JWT token
            token = create_jwt_token(user_id)
            
            return {
                "message": "Login successful",
                "token": token,
                "user_id": user_id,
                "email": user_data.email
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/auth/me")
async def get_current_user_info(current_user: str = Depends(get_current_user)):
    """Get current user information"""
    try:
        # Get user profile from Supabase
        result = supabase.table("user_profiles").select("*").eq("id", current_user).execute()
        
        if result.data:
            user_profile = result.data[0]
            return {
                "user_id": user_profile["id"],
                "email": user_profile["email"],
                "name": user_profile["name"],
                "created_at": user_profile["created_at"]
            }
        else:
            raise HTTPException(status_code=404, detail="User profile not found")
            
    except Exception as e:
        logger.error(f"Error getting user info: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving user information")

# Voice cloning endpoint with authentication
@app.post("/clone-voice", response_model=VoiceCloneResponse)
async def clone_voice(
    text: str = Form(..., description="Text to convert to speech"),
    voice_sample: UploadFile = File(..., description="Voice sample audio file (max 15 seconds)"),
    current_user: str = Depends(get_current_user)
):
    """
    Clone a voice and generate speech from text.
    Requires authentication.
    
    - **text**: The text you want to convert to speech
    - **voice_sample**: Audio file containing the voice sample (WAV, MP3, or WebM format)
    
    Returns:
    - **message**: Success or error message
    - **status**: "success" or "error"
    - **audio_url**: URL to download the generated audio file
    - **voice_id**: The ID of the created voice clone
    - **audio_id**: The ID of the saved audio record
    """
    
    try:
        # Validate input
        if not text.strip():
            raise HTTPException(status_code=400, detail="Text input cannot be empty")
        
        if len(text) > 5000:  # Limit text length
            raise HTTPException(status_code=400, detail="Text too long (max 5000 characters)")
        
        # Validate audio file
        if not validate_audio_file(voice_sample):
            raise HTTPException(
                status_code=400, 
                detail="Invalid audio file. Please upload a WAV, MP3, or WebM file under 15MB"
            )
        
        # Save uploaded file
        voice_sample_path = save_uploaded_file(voice_sample)
        logger.info(f"Voice sample saved: {voice_sample_path}")
        
        # Create voice clone
        voice_id = create_voice_with_elevenlabs(voice_sample_path)
        
        # Generate speech
        output_path = generate_speech_with_elevenlabs(text, voice_id)
        
        # Create download URL
        audio_filename = os.path.basename(output_path)
        audio_url = f"/download/{audio_filename}"
        
        # Save to Supabase
        audio_id = save_audio_to_supabase(
            user_id=current_user,
            filename=voice_sample.filename,
            text=text,
            voice_id=voice_id,
            audio_url=audio_url,
            duration=None  # Could be calculated from audio file
        )
        
        # Clean up uploaded file
        try:
            os.remove(voice_sample_path)
            logger.info(f"Cleaned up uploaded file: {voice_sample_path}")
        except Exception as e:
            logger.warning(f"Failed to clean up uploaded file: {e}")
        
        return VoiceCloneResponse(
            message="Voice cloned and speech generated successfully",
            status="success",
            audio_url=audio_url,
            voice_id=voice_id,
            audio_id=audio_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/download/{filename}")
async def download_audio(filename: str):
    """Download generated audio file"""
    file_path = os.path.join(OUTPUT_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="audio/mpeg"
    )

@app.get("/audio/history", response_model=List[AudioHistoryItem])
async def get_audio_history(
    limit: int = 20,
    offset: int = 0,
    current_user: str = Depends(get_current_user)
):
    """Get user's audio history"""
    try:
        result = supabase.table("audio_history")\
            .select("*")\
            .eq("user_id", current_user)\
            .order("created_at", desc=True)\
            .range(offset, offset + limit - 1)\
            .execute()
        
        if result.data:
            return result.data
        else:
            return []
            
    except Exception as e:
        logger.error(f"Error getting audio history: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving audio history")

@app.delete("/audio/{audio_id}")
async def delete_audio(
    audio_id: str,
    current_user: str = Depends(get_current_user)
):
    """Delete an audio record"""
    try:
        # Check if audio belongs to user
        result = supabase.table("audio_history")\
            .select("*")\
            .eq("id", audio_id)\
            .eq("user_id", current_user)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Audio not found or access denied")
        
        # Delete from Supabase
        supabase.table("audio_history")\
            .delete()\
            .eq("id", audio_id)\
            .eq("user_id", current_user)\
            .execute()
        
        return {"message": "Audio deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting audio: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting audio")

@app.get("/voices")
async def list_voices():
    """List all available voices"""
    try:
        headers = {
            "xi-api-key": ELEVENLABS_API_KEY
        }
        
        response = requests.get(f"{ELEVENLABS_BASE_URL}/voices", headers=headers)
        
        if response.status_code == 200:
            voices = response.json()
            return {"voices": voices.get("voices", [])}
        else:
            raise HTTPException(status_code=400, detail="Failed to fetch voices")
            
    except Exception as e:
        logger.error(f"Error fetching voices: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching voices: {str(e)}")

@app.delete("/voices/{voice_id}")
async def delete_voice(voice_id: str):
    """Delete a voice clone"""
    try:
        headers = {
            "xi-api-key": ELEVENLABS_API_KEY
        }
        
        response = requests.delete(f"{ELEVENLABS_BASE_URL}/voices/{voice_id}", headers=headers)
        
        if response.status_code == 200:
            return {"message": "Voice deleted successfully"}
        else:
            raise HTTPException(status_code=400, detail="Failed to delete voice")
            
    except Exception as e:
        logger.error(f"Error deleting voice: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting voice: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Voice Clone API with Supabase is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)