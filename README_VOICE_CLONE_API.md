# Voice Clone API

A FastAPI-based service for voice cloning and speech synthesis using ElevenLabs API. This service allows you to upload a voice sample and generate speech from text using that voice.

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

## Installation

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   Create a `.env` file in the project root:
   ```env
   ELEVENLABS_API_KEY=your-elevenlabs-api-key-here
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

### 1. Clone Voice
**POST** `/clone-voice`

Clone a voice and generate speech from text.

**Parameters:**
- `text` (string, required): Text to convert to speech (max 5000 characters)
- `voice_sample` (file, required): Audio file containing voice sample (WAV, MP3, WebM, max 15MB)

**Response:**
```json
{
  "message": "Voice cloned and speech generated successfully",
  "status": "success",
  "audio_url": "/download/generated_speech_abc123.mp3",
  "voice_id": "voice_id_from_elevenlabs"
}
```

**Example using curl:**
```bash
curl -X POST "http://localhost:8000/clone-voice" \
  -H "Content-Type: multipart/form-data" \
  -F "text=Hello, this is a test of voice cloning!" \
  -F "voice_sample=@sample_voice.wav"
```

### 2. Download Generated Audio
**GET** `/download/{filename}`

Download a generated audio file.

**Parameters:**
- `filename` (string, required): Name of the audio file to download

**Response:** Audio file (MP3 format)

### 3. List Voices
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

### 4. Delete Voice
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

### 5. Health Check
**GET** `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "healthy",
  "message": "Voice Clone API is running"
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

### Manual Testing with curl

```bash
# Health check
curl http://localhost:8000/health

# List voices
curl http://localhost:8000/voices

# Clone voice
curl -X POST "http://localhost:8000/clone-voice" \
  -F "text=Hello, this is a test!" \
  -F "voice_sample=@your_voice_sample.wav"

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

## Error Handling

The API includes comprehensive error handling for:

- **Invalid file types**: Only audio files are accepted
- **File size limits**: Maximum 15MB per file
- **Empty text**: Text input cannot be empty
- **Text length limits**: Maximum 5000 characters
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