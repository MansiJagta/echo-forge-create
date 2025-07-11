# VoiceForge - AI Voice Cloning & Audio Transcription Platform

A comprehensive AI-powered platform for voice cloning and audio transcription with advanced features and multi-language support.

## Features

### Voice Cloning
- **5-Second Voice Clone**: Create voice clones from just 5 seconds of audio
- **Multi-Language Support**: Support for 15+ languages
- **Team Collaboration**: Work together on voice projects
- **Advanced API**: Integrate with famous voice APIs

### Audio Transcription
- **File Upload**: Support for MP3, WAV, M4A, and other audio formats
- **Real-time Processing**: Instant transcription using OpenAI Whisper
- **Download Results**: Download transcription as text files
- **Recent History**: View and manage your transcription history
- **File Size Limit**: Up to 25MB per file

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key (for transcription feature)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd voiceforge
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development server:
```bash
# Start the frontend (Vite)
npm run dev

# Start the backend server (in a separate terminal)
node server.js
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api-docs

## Usage

### Voice Cloning
1. Navigate to `/generator`
2. Upload or record your voice sample
3. Enter the text you want to convert to speech
4. Generate your voice clone

### Audio Transcription
1. Navigate to `/audio-transcription`
2. Upload an audio file (MP3, WAV, M4A, etc.)
3. Wait for the transcription to complete
4. Download the text result
5. View your transcription history

## API Endpoints

### Transcription API
- `POST /api/transcribe` - Upload and transcribe audio file
- `GET /api/transcribe/history` - Get transcription history

### Voice Generation API
- `POST /api/generate` - Generate voice from text
- `GET /api/voices` - Get available voices

## Project Structure

```
├── src/
│   ├── components/          # React components
│   ├── pages/              # Page components
│   │   └── AudioTranscription.tsx  # Audio transcription page
│   ├── lib/                # Utility functions
│   └── App.tsx            # Main app component
├── routes/                 # Backend API routes
│   └── transcription.js    # Transcription API endpoints
├── server.js              # Express server
└── package.json           # Dependencies
```

## Technologies Used

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui components
- React Router DOM

### Backend
- Node.js
- Express.js
- OpenAI API (Whisper)
- Multer (file uploads)
- Swagger (API documentation)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue on GitHub.
