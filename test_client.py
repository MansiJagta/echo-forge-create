import requests
import os
from pathlib import Path

# API Configuration
API_BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test the health check endpoint"""
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        print(f"Health Check: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_voice_cloning(text: str, voice_sample_path: str):
    """Test the voice cloning endpoint"""
    try:
        # Check if voice sample file exists
        if not os.path.exists(voice_sample_path):
            print(f"Voice sample file not found: {voice_sample_path}")
            return False
        
        # Prepare the request
        url = f"{API_BASE_URL}/clone-voice"
        
        with open(voice_sample_path, "rb") as audio_file:
            files = {
                "voice_sample": (os.path.basename(voice_sample_path), audio_file, "audio/wav")
            }
            
            data = {
                "text": text
            }
            
            print(f"Sending request to: {url}")
            print(f"Text: {text}")
            print(f"Voice sample: {voice_sample_path}")
            
            response = requests.post(url, files=files, data=data)
            
            print(f"Response Status: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"Success! Response: {result}")
                
                # Download the generated audio
                if result.get("audio_url"):
                    audio_url = f"{API_BASE_URL}{result['audio_url']}"
                    download_response = requests.get(audio_url)
                    
                    if download_response.status_code == 200:
                        output_filename = f"generated_speech_{result.get('voice_id', 'test')}.mp3"
                        with open(output_filename, "wb") as f:
                            f.write(download_response.content)
                        print(f"Audio downloaded as: {output_filename}")
                    else:
                        print(f"Failed to download audio: {download_response.status_code}")
                
                return True
            else:
                print(f"Error: {response.status_code}")
                print(f"Error Response: {response.text}")
                return False
                
    except Exception as e:
        print(f"Error testing voice cloning: {e}")
        return False

def test_list_voices():
    """Test listing available voices"""
    try:
        response = requests.get(f"{API_BASE_URL}/voices")
        print(f"List Voices: {response.status_code}")
        if response.status_code == 200:
            voices = response.json()
            print(f"Available voices: {len(voices.get('voices', []))}")
            for voice in voices.get('voices', [])[:3]:  # Show first 3 voices
                print(f"  - {voice.get('name', 'Unknown')} (ID: {voice.get('voice_id', 'Unknown')})")
        else:
            print(f"Error: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error listing voices: {e}")
        return False

def create_sample_audio():
    """Create a sample audio file for testing (if no real audio is available)"""
    try:
        # This is a placeholder - in a real scenario, you'd have an actual audio file
        sample_path = "sample_voice.wav"
        
        if not os.path.exists(sample_path):
            print(f"Sample audio file not found: {sample_path}")
            print("Please provide a WAV, MP3, or WebM audio file for testing")
            print("You can record a short audio clip (5-15 seconds) and save it as 'sample_voice.wav'")
            return None
        
        return sample_path
    except Exception as e:
        print(f"Error creating sample audio: {e}")
        return None

def main():
    """Main test function"""
    print("=== Voice Clone API Test Client ===")
    print()
    
    # Test health check
    print("1. Testing health check...")
    if not test_health_check():
        print("❌ Health check failed. Make sure the API server is running.")
        return
    print("✅ Health check passed!")
    print()
    
    # Test listing voices
    print("2. Testing voice listing...")
    test_list_voices()
    print()
    
    # Test voice cloning
    print("3. Testing voice cloning...")
    sample_audio = create_sample_audio()
    
    if sample_audio:
        test_text = "Hello! This is a test of the voice cloning API. I hope this works well!"
        success = test_voice_cloning(test_text, sample_audio)
        
        if success:
            print("✅ Voice cloning test completed successfully!")
        else:
            print("❌ Voice cloning test failed!")
    else:
        print("⚠️  No sample audio file found. Skipping voice cloning test.")
        print("To test voice cloning:")
        print("1. Create a short audio file (5-15 seconds) named 'sample_voice.wav'")
        print("2. Run this test script again")
    
    print()
    print("=== Test Complete ===")

if __name__ == "__main__":
    main()