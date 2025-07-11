#!/usr/bin/env python3
"""
Voice Clone API Startup Script
This script checks dependencies, sets up the environment, and starts the FastAPI server.
"""

import os
import sys
import subprocess
import importlib.util
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Error: Python 3.8 or higher is required")
        print(f"Current version: {sys.version}")
        return False
    print(f"✅ Python version: {sys.version.split()[0]}")
    return True

def check_dependencies():
    """Check if required packages are installed"""
    required_packages = [
        'fastapi',
        'uvicorn',
        'requests',
        'pydantic',
        'python-multipart'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        spec = importlib.util.find_spec(package)
        if spec is None:
            missing_packages.append(package)
        else:
            print(f"✅ {package} is installed")
    
    if missing_packages:
        print(f"❌ Missing packages: {', '.join(missing_packages)}")
        print("Installing missing packages...")
        
        try:
            subprocess.check_call([
                sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
            ])
            print("✅ Dependencies installed successfully")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install dependencies")
            return False
    
    return True

def check_environment():
    """Check environment variables and create directories"""
    print("\n🔧 Setting up environment...")
    
    # Check for API key
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key or api_key == "your-elevenlabs-api-key-here":
        print("⚠️  Warning: ELEVENLABS_API_KEY not set")
        print("   Create a .env file with your ElevenLabs API key:")
        print("   ELEVENLABS_API_KEY=your-actual-api-key")
        print("   Get your API key from: https://elevenlabs.io")
    else:
        print("✅ ElevenLabs API key is configured")
    
    # Create directories
    directories = [
        "uploads/voice_samples",
        "outputs/generated_speech"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✅ Created directory: {directory}")
    
    return True

def start_server():
    """Start the FastAPI server"""
    print("\n🚀 Starting Voice Clone API server...")
    print("   API will be available at: http://localhost:8000")
    print("   Interactive docs: http://localhost:8000/docs")
    print("   Test form: Open test_form.html in your browser")
    print("\n   Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        # Import and run the FastAPI app
        from voice_clone_api import app
        import uvicorn
        
        uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
        
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return False
    
    return True

def main():
    """Main startup function"""
    print("🎤 Voice Clone API Startup")
    print("=" * 40)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Check environment
    if not check_environment():
        sys.exit(1)
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()