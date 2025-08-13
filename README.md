# Auto Video Translator 🎥🔊
**Change video languages using AI like YouTube - completely local or with OpenAI APIs**

This tool translates videos by:
1. Converting speech to text
2. Translating the text
3. Generating natural-sounding translated speech
4. Merging new audio in a single audio file that matches the times of the original audio

Supports both video files and pre-generated JSON transcripts.

## Prerequisites
- Node.js (v18+)
- npm (included with Node.js)
- Docker (for local processing options)

## Quick Start
```bash
npm install
node . <inputFile> <inputLang> <outputLang>
```
Example: `node . my_video.wav en es` to convert from english to spanish

## Configuration Options

### 🌐 Option 1: Local Processing (Recommended)
Uses local Docker containers for private, offline processing

1. **Configure languages** in `compose.yml`:
   ```yaml
   environment:
     LT_LOAD_ONLY: en,es,fr,de  # Add your languages here
   ```

2. **Start services**:
   ```bash
   docker compose up -d
   ```

3. **Set environment variables**:

   **Windows (CMD/PowerShell)**:
   ```cmd
   :: Use your machine's local IP (not localhost) for Docker on Windows
   set STT_OPENAI_HOST=http://192.168.1.100:8881/v1
   set TTS_OPENAI_HOST=http://192.168.1.100:8882/v1
   set TTS_OPENAI_VOICE=af_bella
   set RETRANSLATE_HOST=http://192.168.1.100:8883
   ```

   **Linux/macOS**:
   ```bash
   export STT_OPENAI_HOST=http://localhost:8881/v1
   export TTS_OPENAI_HOST=http://localhost:8882/v1
   export TTS_OPENAI_VOICE=af_bella
   export RETRANSLATE_HOST=http://localhost:8883
   ```

   > **Windows Docker Note**: Replace `192.168.1.100` with your actual local IP address. Find it with `ipconfig` (look for IPv4 Address). Localhost may not work with Docker on Windows.

### 🎤 Option 2: Custom TTS (Voice Cloning)
Use your own voice for translations (requires modification to Docker setup)

1. **Modify docker-compose.yml**:
   - Remove `kokoro-tts` service
   - Uncomment/activate `customtts` service
   ```yaml
   services:
     # Remove or comment out kokoro-tts:
     # kokoro-tts:
     #   ports:
     #     - 8882:8880
     
     # Uncomment indextts:
     customtts:
        ports:
        - 8882:8000
       # ... (keep existing configuration)
   ```

2. **Restart services**:
   ```bash
   docker compose up -d --force-recreate
   ```

3. **Set environment variables**:
   ```cmd
   :: Windows
   set CUSTOM_TTS=true
   set CUSTOM_TTS_SAMPLE=C:\path\to\your\voice_sample.wav
   ```
   ```bash
   # Linux/macOS
   export CUSTOM_TTS=true
   export CUSTOM_TTS_SAMPLE=/path/to/your/voice_sample.wav
   ```

   > **Voice Sample Requirements**:
   > - 8-20 seconds duration
   > - Clean, clear, noise-free audio
   > - WAV format
   > - Must be in the **target output language** (Recommended)

### ☁️ Option 3: OpenAI API Processing
Uses OpenAI's cloud services (requires API keys)

Set these environment variables:

**Windows**:
```cmd
set STT_OPENAI_KEY=sk-xxxxxxxx
set STT_OPENAI_HOST=https://api.openai.com/v1

set TTS_OPENAI_KEY=sk-xxxxxxxx
set TTS_OPENAI_HOST=https://api.openai.com/v1
set TTS_OPENAI_VOICE=alloy  # or nova, shimmer, echo

set TRANSLATE_OPENAI_KEY=sk-xxxxxxxx
set TRANSLATE_OPENAI_HOST=https://api.openai.com/v1
set TRANSLATE_OPENAI_MODEL=gpt-4-turbo
```

**Linux/macOS**:
```bash
export STT_OPENAI_KEY=sk-xxxxxxxx
export STT_OPENAI_HOST=https://api.openai.com/v1

export TTS_OPENAI_KEY=sk-xxxxxxxx
export TTS_OPENAI_HOST=https://api.openai.com/v1
export TTS_OPENAI_VOICE=alloy

export TRANSLATE_OPENAI_KEY=sk-xxxxxxxx
export TRANSLATE_OPENAI_HOST=https://api.openai.com/v1
export TRANSLATE_OPENAI_MODEL=gpt-4-turbo
```

## Advanced Input Options

### Using Pre-generated Transcripts
1. Convert SRT to JSON:
   ```bash
   node convert_srt_to_json.js <input.srt> <output.json>
   ```
   
2. Use JSON as input to skip transcription:
   ```bash
   node . transcript.json <inputLang> <outputLang>
   ```

### Skipping Processing Stages
- **Skip transcription**: Provide JSON file instead of video
- **Skip translation**: Use `skip` as input language
  ```bash
  node . input.mp4 skip es  # Keeps original speech, translates to Spanish
  ```

## Voice Selection Guide
- **Local processing**: [Browse available voices](https://github.com/remsky/Kokoro-FastAPI/tree/master/api/src/voices/v1_0)
  - English: `af_bella`
  - Spanish: `ef_dora`
  - Japanese: `gf_kokoro`
  
- **OpenAI**: `alloy`, `echo`, `fable`, `nova`, `onyx`, `shimmer`
  
- **Custom TTS**: Use your own voice sample

## Usage Examples
```bash
# Basic video translation (English to Spanish)
node . presentation.wav en es

# Use pre-generated transcript (skip speech-to-text)
node . transcript.json en fr

# Skip translation (keep original speech, translate to German)
node . interview.wav skip de

# Local processing with Windows Docker
node . demo.wav en ja

# Use custom voice cloning (after Docker setup)
node . vlog.wav en fr  # Uses your voice_sample.wav for French
```

## Important Notes
1. For local processing:
   - Keep Docker running while processing audios
   - First run will download large models (5-10GB)
   - Requires powerful hardware (recommended 16GB+ RAM and 8GB+ VRAM)

2. IP addresses:
   - **Windows Docker**: Must use machine's local IP (not localhost)
   - Find Windows IP: Run `ipconfig` → "IPv4 Address"
   - Linux/macOS can use `localhost`

3. Output files:
   - Audios: `<original>_<outputLang>.wav`
   - Transcripts: `<original>.srt` and `<original>.json`

4. Custom TTS requirements:
   - Voice samples must be high-quality recordings
   - Samples must match target language
   - First run will take longer to train voice model
   - Requires additional GPU resources for best results
