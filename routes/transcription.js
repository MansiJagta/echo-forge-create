const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/audio';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check if file is audio
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  }
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here',
});

/**
 * @swagger
 * /api/transcribe:
 *   post:
 *     summary: Transcribe audio file
 *     description: Upload an audio file and get its transcription
 *     tags: [Transcription]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: Audio file to transcribe
 *     responses:
 *       200:
 *         description: Transcription successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier for the transcription
 *                 text:
 *                   type: string
 *                   description: Transcribed text
 *                 duration:
 *                   type: number
 *                   description: Duration of the audio in seconds
 *                 filename:
 *                   type: string
 *                   description: Original filename
 *       400:
 *         description: Bad request - invalid file or missing file
 *       500:
 *         description: Internal server error
 */
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log('Processing audio file:', req.file.filename);

    // Create a readable stream from the uploaded file
    const audioStream = fs.createReadStream(req.file.path);

    // Transcribe using OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: audioStream,
      model: "whisper-1",
      response_format: "text",
    });

    // Get file duration (this is a simplified approach)
    // In a production environment, you might want to use a library like ffprobe
    const duration = 0; // Placeholder - would need audio analysis library

    // Clean up the uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    const result = {
      id: Date.now().toString(),
      text: transcription,
      duration: duration,
      filename: req.file.originalname,
      timestamp: new Date().toISOString(),
    };

    console.log('Transcription completed successfully');
    res.json(result);

  } catch (error) {
    console.error('Transcription error:', error);
    
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    res.status(500).json({ 
      error: 'Transcription failed', 
      details: error.message 
    });
  }
});

/**
 * @swagger
 * /api/transcribe/history:
 *   get:
 *     summary: Get transcription history
 *     description: Retrieve a list of recent transcriptions
 *     tags: [Transcription]
 *     responses:
 *       200:
 *         description: List of transcriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   filename:
 *                     type: string
 *                   text:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *                   duration:
 *                     type: number
 */
router.get('/history', (req, res) => {
  // This would typically fetch from a database
  // For now, return empty array
  res.json([]);
});

module.exports = router;