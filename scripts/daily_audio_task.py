import os
import json
import requests
import wave
from datetime import datetime
from google import genai
from google.genai import types

# Load configuration from environment variables
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID")

# Models
TEXT_MODEL = "gemini-2.0-flash"
TTS_MODEL = "gemini-2.5-flash-preview-tts"
VOICE_NAME = "Achird"

def send_telegram(text, audio_file):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("⚠️ Telegram credentials missing. Skipping notification.")
        return

    print(f"🚀 Sending to Telegram chat {TELEGRAM_CHAT_ID}...")

    # 1. Send Text
    try:
        url_msg = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        # Escape simplified Markdown special characters if needed, or just send plain text if complexity is high.
        # For now, let's try plain text to avoid parse errors, or minimal formatting.
        payload = {
            'chat_id': TELEGRAM_CHAT_ID,
            'text': f"📅 Daily Story\n\n{text}"
        }
        r = requests.post(url_msg, data=payload)
        if r.status_code != 200:
            print(f"❌ Failed to send text: {r.text}")
    except Exception as e:
        print(f"❌ Error sending text: {e}")

    # 2. Send Audio
    try:
        url_audio = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendAudio"
        with open(audio_file, 'rb') as f:
            files = {'audio': f}
            data = {'chat_id': TELEGRAM_CHAT_ID, 'title': 'Daily Story'}
            r = requests.post(url_audio, files=files, data=data)
            if r.status_code == 200:
                print("✅ Audio sent successfully.")
            else:
                print(f"❌ Failed to send audio: {r.text}")
    except Exception as e:
        print(f"❌ Error sending audio: {e}")

def main():
    if not GEMINI_API_KEY:
        print("❌ GEMINI_API_KEY is missing.")
        return

    print("🏁 Starting Daily Audio Task...")

    # 1. Read Daily Words
    daily_words_path = 'public/api/daily-words.json'
    if not os.path.exists(daily_words_path):
        print(f"❌ {daily_words_path} not found. Run generate-daily-words.js first.")
        return

    with open(daily_words_path, 'r') as f:
        data = json.load(f)
    
    words = [w['word'] for w in data['words']]
    words_str = ", ".join(words)
    print(f"📚 Today's Words ({len(words)}): {words_str}")

    client = genai.Client(api_key=GEMINI_API_KEY)

    # 2. Generate Story (Text)
    print(f"✍️ Generating story using {TEXT_MODEL}...")
    try:
        prompt = f"""
        Write a short, engaging, and cohesive story (about 100-150 words) that naturally incorporates the following English words: 
        {words_str}
        
        The story should be suitable for English learners. 
        Highlight the used words in the text if possible (e.g., by capitalizing them or just ensuring they fit naturally).
        Return ONLY the story text.
        """
        
        story_resp = client.models.generate_content(
            model=TEXT_MODEL,
            contents=prompt
        )
        story_text = story_resp.text.strip()
        print("✅ Story generated.")
        
        # Save story
        story_path = 'public/api/daily-story.json'
        with open(story_path, 'w') as f:
            json.dump({
                "date": data['date'],
                "generated_at": datetime.now().isoformat(),
                "words": words,
                "story": story_text
            }, f, indent=2)
        print(f"💾 Story saved to {story_path}")

    except Exception as e:
        print(f"❌ Error generating story: {e}")
        return

    # 3. Generate Audio (TTS)
    print(f"🗣️ Generating audio using {TTS_MODEL} ({VOICE_NAME})...")
    try:
        audio_resp = client.models.generate_content(
            model=TTS_MODEL,
            contents=story_text,
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name=VOICE_NAME
                        )
                    )
                )
            )
        )

        audio_data = None
        if hasattr(audio_resp, 'audio') and hasattr(audio_resp.audio, 'raw_data'):
             audio_data = audio_resp.audio.raw_data
        
        # Fallback check
        if not audio_data and hasattr(audio_resp, 'candidates'):
             for candidate in audio_resp.candidates:
                 for part in candidate.content.parts:
                     if part.inline_data:
                         audio_data = part.inline_data.data
                         break

        output_wav = "daily_story.wav"
        if audio_data:
            with wave.open(output_wav, 'wb') as wav_file:
                wav_file.setnchannels(1)
                wav_file.setsampwidth(2)
                wav_file.setframerate(24000)
                wav_file.writeframes(audio_data)
            print(f"✅ Audio saved to {output_wav}")
            
            # Send to Telegram
            send_telegram(story_text, output_wav)
            
            # Optional: Move to public folder if we want to host it
            # shutil.move(output_wav, 'public/audio/daily-story.wav') 
            
        else:
            print("❌ No audio data received from Gemini.")
            print(audio_resp)

    except Exception as e:
        print(f"❌ Error generating audio: {e}")

if __name__ == "__main__":
    main()
