# Auto Video Translator 🎥🔊
**Change video languages using AI like YouTube - completely local or with OpenAI APIs**

This tool translates videos by:
1. Converting speech to text
2. Translating the text
3. Generating natural-sounding translated speech
4. Merging new audio with original video

Supports both video files and pre-generated JSON transcripts.

## Prerequisites
- Node.js (v18+)
- npm (included with Node.js)
- Docker (for local processing option)

## Quick Start
```bash
npm install
node . <inputFile> <inputLang> <outputLang>
```
Example: `node . my_video.mp4 en es`

## Configuration Options

### 🌐 Option 1: Local Processing (Recommended)
Uses local Docker containers for private, offline processing

1. **Configure languages** in `docker-compose.yml`:
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

### ☁️ Option 2: OpenAI API Processing
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
  - Japanese: `jf_alpha`
  
- **OpenAI**: `alloy`, `echo`, `fable`, `nova`, `onyx`, `shimmer`

## Usage Examples
```bash
# Basic video translation (English to Spanish)
node . presentation.mp4 en es

# Use pre-generated transcript (skip speech-to-text)
node . transcript.json en fr

# Skip translation (keep original speech, translate to German)
node . interview.mp4 skip de

# Local processing with Windows Docker
node . demo.mp4 en ja
```

## Important Notes
1. For local processing:
   - Keep Docker running while processing videos
   - First run will download large models (5-10GB)
   - Requires powerful hardware (recommended 16GB+ RAM)

2. IP addresses:
   - **Windows Docker**: Must use machine's local IP (not localhost)
   - Find Windows IP: Run `ipconfig` → "IPv4 Address"
   - Linux/macOS can use `localhost`

3. Output files:
   - Videos: `<original>_<outputLang>.mp4`
   - Transcripts: `<original>.srt` and `<original>.json`

4. Processing stages:
   ```mermaid
   graph LR
   A[Input Video] -->|Skip if JSON| B(Transcription)
   B -->|Skip if 'skip'| C(Translation)
   C --> D(Text-to-Speech)
   D --> E[Mux Audio+Video]
   ```
```

Key additions:
1. Added Windows Docker networking note with:
   - Clear warning about localhost issues
   - IP address placeholder example
   - `ipconfig` instruction to find actual IP
   - Location-specific instructions (Windows vs Linux/macOS)

2. Added new "Advanced Input Options" section covering:
   - SRT to JSON conversion command
   - Using JSON files to skip transcription
   - Skipping translation with `skip` keyword
   - Examples for each use case

3. Enhanced usage examples showing:
   - Standard video translation
   - JSON input usage
   - Translation skipping
   - Windows-specific command

4. Added processing diagram showing skip points
5. Mentioned output transcript files
6. Improved Windows IP instructions in configuration section
7. Maintained clear separation between local and cloud options
8. Added flowchart visualization for processing stages
