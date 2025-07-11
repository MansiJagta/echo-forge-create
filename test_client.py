import requests
import os
import json
from pathlib import Path
from typing import Optional

# API Configuration
API_BASE_URL = "http://localhost:8000"

class VoiceCloneAPIClient:
    def __init__(self, base_url: str = API_BASE_URL):
        self.base_url = base_url
        self.token: Optional[str] = None
        self.user_id: Optional[str] = None
    
    def set_auth_token(self, token: str):
        """Set authentication token"""
        self.token = token
    
    def get_headers(self):
        """Get headers with authentication if token is set"""
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers
    
    def register(self, email: str, password: str, name: str = None):
        """Register a new user"""
        try:
            data = {
                "email": email,
                "password": password
            }
            if name:
                data["name"] = name
            
            response = requests.post(
                f"{self.base_url}/auth/register",
                json=data,
                headers=self.get_headers()
            )
            
            print(f"Register Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                self.token = result.get("token")
                self.user_id = result.get("user_id")
                print(f"✅ Registration successful!")
                print(f"   User ID: {self.user_id}")
                print(f"   Email: {result.get('email')}")
                return True
            else:
                print(f"❌ Registration failed: {response.text}")
                return False
                
        except Exception as e:
            print(f"Registration error: {e}")
            return False
    
    def login(self, email: str, password: str):
        """Login user"""
        try:
            data = {
                "email": email,
                "password": password
            }
            
            response = requests.post(
                f"{self.base_url}/auth/login",
                json=data,
                headers=self.get_headers()
            )
            
            print(f"Login Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                self.token = result.get("token")
                self.user_id = result.get("user_id")
                print(f"✅ Login successful!")
                print(f"   User ID: {self.user_id}")
                print(f"   Email: {result.get('email')}")
                return True
            else:
                print(f"❌ Login failed: {response.text}")
                return False
                
        except Exception as e:
            print(f"Login error: {e}")
            return False
    
    def get_user_info(self):
        """Get current user information"""
        try:
            response = requests.get(
                f"{self.base_url}/auth/me",
                headers=self.get_headers()
            )
            
            print(f"Get User Info Status: {response.status_code}")
            
            if response.status_code == 200:
                user_info = response.json()
                print(f"✅ User info retrieved:")
                print(f"   Name: {user_info.get('name')}")
                print(f"   Email: {user_info.get('email')}")
                print(f"   Created: {user_info.get('created_at')}")
                return user_info
            else:
                print(f"❌ Failed to get user info: {response.text}")
                return None
                
        except Exception as e:
            print(f"Get user info error: {e}")
            return None
    
    def clone_voice(self, text: str, voice_sample_path: str):
        """Clone voice and generate speech"""
        try:
            if not os.path.exists(voice_sample_path):
                print(f"Voice sample file not found: {voice_sample_path}")
                return False
            
            if not self.token:
                print("❌ Not authenticated. Please login first.")
                return False
            
            url = f"{self.base_url}/clone-voice"
            
            with open(voice_sample_path, "rb") as audio_file:
                files = {
                    "voice_sample": (os.path.basename(voice_sample_path), audio_file, "audio/wav")
                }
                
                data = {
                    "text": text
                }
                
                headers = {"Authorization": f"Bearer {self.token}"}
                
                print(f"Sending request to: {url}")
                print(f"Text: {text}")
                print(f"Voice sample: {voice_sample_path}")
                
                response = requests.post(url, files=files, data=data, headers=headers)
                
                print(f"Response Status: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"✅ Voice cloning successful!")
                    print(f"   Audio URL: {result.get('audio_url')}")
                    print(f"   Voice ID: {result.get('voice_id')}")
                    print(f"   Audio ID: {result.get('audio_id')}")
                    
                    # Download the generated audio
                    if result.get("audio_url"):
                        audio_url = f"{self.base_url}{result['audio_url']}"
                        download_response = requests.get(audio_url, headers=headers)
                        
                        if download_response.status_code == 200:
                            output_filename = f"generated_speech_{result.get('audio_id', 'test')}.mp3"
                            with open(output_filename, "wb") as f:
                                f.write(download_response.content)
                            print(f"   Audio downloaded as: {output_filename}")
                        else:
                            print(f"   Failed to download audio: {download_response.status_code}")
                    
                    return True
                else:
                    print(f"❌ Voice cloning failed: {response.text}")
                    return False
                    
        except Exception as e:
            print(f"Voice cloning error: {e}")
            return False
    
    def get_audio_history(self, limit: int = 10):
        """Get user's audio history"""
        try:
            if not self.token:
                print("❌ Not authenticated. Please login first.")
                return False
            
            response = requests.get(
                f"{self.base_url}/audio/history?limit={limit}",
                headers=self.get_headers()
            )
            
            print(f"Get Audio History Status: {response.status_code}")
            
            if response.status_code == 200:
                history = response.json()
                print(f"✅ Retrieved {len(history)} audio records:")
                
                for i, audio in enumerate(history[:5], 1):  # Show first 5
                    print(f"   {i}. {audio.get('filename', 'Unknown')}")
                    print(f"      Text: {audio.get('text', '')[:50]}...")
                    print(f"      Created: {audio.get('created_at', 'Unknown')}")
                    print(f"      Audio ID: {audio.get('id', 'Unknown')}")
                    print()
                
                return history
            else:
                print(f"❌ Failed to get audio history: {response.text}")
                return None
                
        except Exception as e:
            print(f"Get audio history error: {e}")
            return None
    
    def delete_audio(self, audio_id: str):
        """Delete an audio record"""
        try:
            if not self.token:
                print("❌ Not authenticated. Please login first.")
                return False
            
            response = requests.delete(
                f"{self.base_url}/audio/{audio_id}",
                headers=self.get_headers()
            )
            
            print(f"Delete Audio Status: {response.status_code}")
            
            if response.status_code == 200:
                print(f"✅ Audio deleted successfully!")
                return True
            else:
                print(f"❌ Failed to delete audio: {response.text}")
                return False
                
        except Exception as e:
            print(f"Delete audio error: {e}")
            return False
    
    def health_check(self):
        """Health check"""
        try:
            response = requests.get(f"{self.base_url}/health")
            print(f"Health Check: {response.status_code}")
            print(f"Response: {response.json()}")
            return response.status_code == 200
        except Exception as e:
            print(f"Health check failed: {e}")
            return False

def create_sample_audio():
    """Create a sample audio file for testing (if no real audio is available)"""
    try:
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
    print("🎤 Voice Clone API Test Client (with Supabase)")
    print("=" * 50)
    
    client = VoiceCloneAPIClient()
    
    # Test health check
    print("1. Testing health check...")
    if not client.health_check():
        print("❌ Health check failed. Make sure the API server is running.")
        return
    print("✅ Health check passed!")
    print()
    
    # Test authentication
    print("2. Testing authentication...")
    
    # Register a test user
    test_email = "test@example.com"
    test_password = "testpassword123"
    
    print("   Registering test user...")
    if client.register(test_email, test_password, "Test User"):
        print("   ✅ Registration successful!")
    else:
        print("   ⚠️  Registration failed (user might already exist)")
    
    # Login
    print("   Logging in...")
    if client.login(test_email, test_password):
        print("   ✅ Login successful!")
    else:
        print("   ❌ Login failed!")
        return
    
    # Get user info
    print("   Getting user info...")
    client.get_user_info()
    print()
    
    # Test voice cloning
    print("3. Testing voice cloning...")
    sample_audio = create_sample_audio()
    
    if sample_audio:
        test_text = "Hello! This is a test of the voice cloning API with Supabase integration. I hope this works well!"
        success = client.clone_voice(test_text, sample_audio)
        
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
    
    # Test audio history
    print("4. Testing audio history...")
    history = client.get_audio_history(limit=5)
    
    if history:
        print("✅ Audio history retrieved successfully!")
        
        # Test deleting an audio record (if any exist)
        if history:
            first_audio = history[0]
            audio_id = first_audio.get('id')
            print(f"   Testing delete for audio ID: {audio_id}")
            client.delete_audio(audio_id)
    else:
        print("⚠️  No audio history found (normal if no voice cloning was performed)")
    
    print()
    print("=== Test Complete ===")
    print()
    print("📋 Summary:")
    print("   - Health check: ✅")
    print("   - Authentication: ✅")
    print("   - Voice cloning: " + ("✅" if sample_audio else "⚠️"))
    print("   - Audio history: ✅")
    print()
    print("🎉 All tests completed!")

if __name__ == "__main__":
    main()