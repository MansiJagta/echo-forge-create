# 🎤 Voice Clone API - Quick Start Guide

## What You Get

✅ **FastAPI endpoint** that accepts text + voice sample → generates speech  
✅ **File validation** (WAV, MP3, WebM, max 15MB)  
✅ **ElevenLabs integration** for high-quality voice cloning  
✅ **Downloadable audio** output in MP3 format  
✅ **Complete error handling** and logging  
✅ **Interactive API docs** at `/docs`  
✅ **Test client** and HTML form for easy testing  

## 🚀 Quick Start (3 Steps)

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set Up API Key
Create `.env` file:
```env
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here
```
Get your API key from: https://elevenlabs.io

### 3. Start the Server
```bash
python start_api.py
```

## 📡 API Usage

### Main Endpoint
```bash
curl -X POST "http://localhost:8000/clone-voice" \
  -F "text=Hello, this is a test!" \
  -F "voice_sample=@your_voice_sample.wav"
```

### Response
```json
{
  "message": "Voice cloned and speech generated successfully",
  "status": "success",
  "audio_url": "/download/generated_speech_abc123.mp3",
  "voice_id": "voice_id_from_elevenlabs"
}
```

## 🧪 Testing

### Option 1: HTML Form
Open `test_form.html` in your browser

### Option 2: Python Test Client
```bash
python test_client.py
```

### Option 3: Interactive Docs
Visit http://localhost:8000/docs

## 📁 File Structure
```
├── voice_clone_api.py      # Main FastAPI application
├── requirements.txt         # Python dependencies
├── test_client.py          # Python test client
├── test_form.html          # HTML test form
├── start_api.py           # Startup script
├── README_VOICE_CLONE_API.md  # Complete documentation
└── uploads/               # Temporary voice samples
    └── voice_samples/
└── outputs/               # Generated audio files
    └── generated_speech/
```

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/clone-voice` | POST | Clone voice + generate speech |
| `/download/{filename}` | GET | Download generated audio |
| `/voices` | GET | List available voices |
| `/voices/{voice_id}` | DELETE | Delete voice clone |
| `/health` | GET | Health check |

## 📋 Requirements

### Voice Sample:
- **Format**: WAV, MP3, or WebM
- **Duration**: 5-15 seconds recommended
- **Quality**: Clear speech, minimal background noise
- **Size**: Maximum 15MB

### Text Input:
- **Length**: Maximum 5000 characters
- **Content**: Any text you want to convert to speech

## 🎯 Example Workflow

1. **Record/upload** a voice sample (5-15 seconds of clear speech)
2. **Write** the text you want to convert to speech
3. **Send** both to the API
4. **Download** the generated audio file
5. **Listen** to your cloned voice speaking the text!

## 🛠️ Troubleshooting

### Common Issues:
- **"API key not set"**: Create `.env` file with your ElevenLabs API key
- **"File too large"**: Use audio files under 15MB
- **"Invalid file type"**: Use WAV, MP3, or WebM files only
- **"Server not running"**: Make sure to run `python start_api.py`

### Need Help?
1. Check the interactive docs at http://localhost:8000/docs
2. Review the complete README_VOICE_CLONE_API.md
3. Test with the provided HTML form or Python client

## 🚀 Ready to Use!

Your voice cloning API is now ready! Upload a voice sample, enter some text, and get back synthesized speech in that voice. 🎤✨