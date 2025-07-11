# Voice Clone API with Supabase Integration

A FastAPI-based service for voice cloning and speech synthesis using ElevenLabs API with Supabase for user authentication and audio history storage. This service allows you to upload a voice sample and generate speech from text using that voice, with full user management and audio history tracking.

## Features

- ✅ **Voice Cloning**: Upload a voice sample and create a voice clone
- ✅ **Speech Synthesis**: Generate speech from text using the cloned voice
- ✅ **Multiple Audio Formats**: Support for WAV, MP3, and WebM files
- ✅ **File Validation**: Automatic validation of audio files and size limits
- ✅ **Download Generated Audio**: Download generated speech as MP3 files
- ✅ **Voice Management**: List and delete voice clones
- ✅ **RESTful API**: Clean, documented API endpoints
- ✅ **CORS Support**: Cross-origin resource sharing enabled
- ✅ **Error Handling**: Comprehensive error handling and logging

## Prerequisites

- Python 3.8 or higher
- ElevenLabs API key (get one at [elevenlabs.io](https://elevenlabs.io))
- Supabase account and project (create one at [supabase.com](https://supabase.com))

## Installation

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up Supabase**:
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Go to your project's SQL editor
   - Run the SQL commands from `supabase_schema.sql` to create the required tables
   - Note your project URL and anon key from the project settings

4. **Set up environment variables**:
   Create a `.env` file in the project root:
   ```env
   ELEVENLABS_API_KEY=your-elevenlabs-api-key-here
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key-here
   JWT_SECRET=your-jwt-secret-key-here
   ```

4. **Create required directories**:
   ```bash
   mkdir -p uploads/voice_samples outputs/generated_speech
   ```

## Usage

### Starting the Server

```bash
python voice_clone_api.py
```

The server will start on `http://localhost:8000`

### API Documentation

Once the server is running, you can access:
- **Interactive API docs**: http://localhost:8000/docs
- **ReDoc documentation**: http://localhost:8000/redoc

## API Endpoints

### Authentication Endpoints

#### 1. Register User
**POST** `/auth/register`

Register a new user account.

**Parameters:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"  // optional
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user_id": "user_uuid",
  "email": "user@example.com"
}
```

#### 2. Login User
**POST** `/auth/login`

Login with existing credentials.

**Parameters:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user_id": "user_uuid",
  "email": "user@example.com"
}
```

#### 3. Get Current User
**GET** `/auth/me`

Get current user information (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "user_id": "user_uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Voice Cloning Endpoints

#### 4. Clone Voice
**POST** `/clone-voice`

Clone a voice and generate speech from text (requires authentication).

**Parameters:**
- `text` (string, required): Text to convert to speech (max 5000 characters)
- `voice_sample` (file, required): Audio file containing voice sample (WAV, MP3, WebM, max 15MB)

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "message": "Voice cloned and speech generated successfully",
  "status": "success",
  "audio_url": "/download/generated_speech_abc123.mp3",
  "voice_id": "voice_id_from_elevenlabs",
  "audio_id": "audio_record_uuid"
}
```

**Example using curl:**
```bash
curl -X POST "http://localhost:8000/clone-voice" \
  -H "Content-Type: multipart/form-data" \
  -F "text=Hello, this is a test of voice cloning!" \
  -F "voice_sample=@sample_voice.wav"
```

### Audio History Endpoints

#### 5. Get Audio History
**GET** `/audio/history`

Get user's audio history (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Parameters:**
- `limit` (integer, optional): Number of records to return (default: 20)
- `offset` (integer, optional): Number of records to skip (default: 0)

**Response:**
```json
[
  {
    "id": "audio_uuid",
    "user_id": "user_uuid",
    "filename": "voice_sample.wav",
    "text": "Hello, this is a test!",
    "voice_id": "elevenlabs_voice_id",
    "audio_url": "/download/generated_speech_abc123.mp3",
    "created_at": "2024-01-01T00:00:00Z",
    "duration": 3.5
  }
]
```

#### 6. Delete Audio Record
**DELETE** `/audio/{audio_id}`

Delete an audio record (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Parameters:**
- `audio_id` (string, required): ID of the audio record to delete

**Response:**
```json
{
  "message": "Audio deleted successfully"
}
```

### File Management Endpoints

#### 7. Download Generated Audio
**GET** `/download/{filename}`

Download a generated audio file.

**Parameters:**
- `filename` (string, required): Name of the audio file to download

**Response:** Audio file (MP3 format)

### Voice Management Endpoints

#### 8. List Voices
**GET** `/voices`

List all available voices in your ElevenLabs account.

**Response:**
```json
{
  "voices": [
    {
      "voice_id": "voice_id",
      "name": "Voice Name",
      "description": "Voice description"
    }
  ]
}
```

#### 9. Delete Voice
**DELETE** `/voices/{voice_id}`

Delete a voice clone from your ElevenLabs account.

**Parameters:**
- `voice_id` (string, required): ID of the voice to delete

**Response:**
```json
{
  "message": "Voice deleted successfully"
}
```

### System Endpoints

#### 10. Health Check
**GET** `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "healthy",
  "message": "Voice Clone API with Supabase is running"
}
```

## Testing

### Using the Test Client

1. **Start the API server**:
   ```bash
   python voice_clone_api.py
   ```

2. **Run the test client**:
   ```bash
   python test_client.py
   ```

3. **Prepare a test audio file**:
   - Create a short audio file (5-15 seconds) named `sample_voice.wav`
   - The file should contain clear speech in WAV, MP3, or WebM format

The test client will:
- Test authentication (register/login)
- Test voice cloning with authentication
- Test audio history retrieval
- Test audio deletion

### Using the HTML Test Form

1. **Open the HTML test form**:
   ```bash
   # Open in your browser
   open test_form.html
   # Or simply double-click the file
   ```

2. **Features of the HTML form**:
   - User registration and login
   - Voice cloning with file upload
   - Audio history viewing and management
   - Audio playback and download
   - Tabbed interface for easy navigation

### Manual Testing with curl

```bash
# Health check
curl http://localhost:8000/health

# Register a user
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "name": "Test User"}'

# Login
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Get user info (replace TOKEN with the token from login)
curl -H "Authorization: Bearer TOKEN" http://localhost:8000/auth/me

# Clone voice (replace TOKEN with the token from login)
curl -X POST "http://localhost:8000/clone-voice" \
  -H "Authorization: Bearer TOKEN" \
  -F "text=Hello, this is a test!" \
  -F "voice_sample=@your_voice_sample.wav"

# Get audio history (replace TOKEN with the token from login)
curl -H "Authorization: Bearer TOKEN" "http://localhost:8000/audio/history?limit=10"

# Download generated audio
curl -O http://localhost:8000/download/generated_speech_abc123.mp3
```

## File Requirements

### Voice Sample Requirements:
- **Format**: WAV, MP3, or WebM
- **Duration**: 5-15 seconds recommended
- **Quality**: Clear speech, minimal background noise
- **Size**: Maximum 15MB
- **Content**: Should contain natural speech (not music or effects)

### Generated Audio:
- **Format**: MP3
- **Quality**: High quality speech synthesis
- **Download**: Available via the `/download/{filename}` endpoint

## Supabase Setup

### Database Schema

The application uses two main tables:

1. **user_profiles**: Stores user information
   - `id`: UUID (references auth.users)
   - `email`: User's email address
   - `name`: User's display name
   - `created_at`: Account creation timestamp

2. **audio_history**: Stores generated audio records
   - `id`: UUID (primary key)
   - `user_id`: UUID (references user_profiles)
   - `filename`: Original voice sample filename
   - `text`: Text that was converted to speech
   - `voice_id`: ElevenLabs voice ID
   - `audio_url`: URL to download the generated audio
   - `duration`: Audio duration (optional)
   - `created_at`: Record creation timestamp

### Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Supabase handles password security
- **CORS Protection**: Configured for cross-origin requests
- **File Validation**: Strict validation of uploaded files

### Environment Variables

Required environment variables:

```env
# ElevenLabs API
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT Secret (generate a secure random string)
JWT_SECRET=your_jwt_secret_key
```

## Error Handling

The API includes comprehensive error handling for:

- **Authentication errors**: Invalid tokens, expired sessions
- **Authorization errors**: Access denied to resources
- **Invalid file types**: Only audio files are accepted
- **File size limits**: Maximum 15MB per file
- **Empty text**: Text input cannot be empty
- **Text length limits**: Maximum 5000 characters
- **Database errors**: Connection issues, constraint violations
- **API errors**: ElevenLabs API errors are properly handled
- **Network issues**: Connection timeouts and failures

## Configuration

### Environment Variables:
- `ELEVENLABS_API_KEY`: Your ElevenLabs API key (required)

### File Paths:
- `uploads/voice_samples/`: Temporary storage for uploaded voice samples
- `outputs/generated_speech/`: Storage for generated audio files

### Limits:
- **File size**: 15MB maximum
- **Text length**: 5000 characters maximum
- **Audio duration**: 5-15 seconds recommended for voice samples

## Security Considerations

- **API Key**: Keep your ElevenLabs API key secure
- **File Uploads**: Files are validated and cleaned up after processing
- **CORS**: Configure CORS settings for production use
- **Rate Limiting**: Consider implementing rate limiting for production

## Production Deployment

### Using uvicorn:
```bash
uvicorn voice_clone_api:app --host 0.0.0.0 --port 8000
```

### Using Docker:
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "voice_clone_api:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Setup:
```bash
# Production environment variables
export ELEVENLABS_API_KEY=your-production-api-key
export PYTHONPATH=/app
```

## Troubleshooting

### Common Issues:

1. **"Failed to create voice" error**:
   - Check your ElevenLabs API key
   - Ensure the audio file is valid and contains clear speech
   - Verify the file size is under 15MB

2. **"Invalid audio file" error**:
   - Ensure the file is in WAV, MP3, or WebM format
   - Check that the file is actually an audio file
   - Verify the file size is under 15MB

3. **"Text too long" error**:
   - Reduce the text length to under 5000 characters

4. **Connection errors**:
   - Check your internet connection
   - Verify the ElevenLabs API is accessible
   - Check firewall settings

### Logs:
The API includes comprehensive logging. Check the console output for detailed error messages.

## Support

For issues and questions:
1. Check the API documentation at `/docs`
2. Review the error messages in the logs
3. Test with the provided test client
4. Verify your ElevenLabs API key and account status

## License

This project is provided as-is for educational and development purposes.