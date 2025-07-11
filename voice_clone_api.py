from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import tempfile
import shutil
import uuid
from pathlib import Path
import requests
from typing import Optional
import json
import logging
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Voice Clone API",
    description="API for voice cloning and speech synthesis",
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
UPLOAD_DIR = "uploads/voice_samples"
OUTPUT_DIR = "outputs/generated_speech"
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15MB
ALLOWED_AUDIO_TYPES = ["audio/wav", "audio/mp3", "audio/webm", "audio/mpeg"]

# Create directories if they don't exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

class VoiceCloneRequest(BaseModel):
    text: str
    voice_sample_url: Optional[str] = None

class VoiceCloneResponse(BaseModel):
    message: str
    status: str
    audio_url: Optional[str] = None
    voice_id: Optional[str] = None
    error: Optional[str] = None

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

@app.post("/clone-voice", response_model=VoiceCloneResponse)
async def clone_voice(
    text: str = Form(..., description="Text to convert to speech"),
    voice_sample: UploadFile = File(..., description="Voice sample audio file (max 15 seconds)")
):
    """
    Clone a voice and generate speech from text.
    
    - **text**: The text you want to convert to speech
    - **voice_sample**: Audio file containing the voice sample (WAV, MP3, or WebM format)
    
    Returns:
    - **message**: Success or error message
    - **status**: "success" or "error"
    - **audio_url**: URL to download the generated audio file
    - **voice_id**: The ID of the created voice clone
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
            voice_id=voice_id
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
    return {"status": "healthy", "message": "Voice Clone API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)