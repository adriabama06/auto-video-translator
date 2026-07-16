# Auto Video Translator 🎥🔊
**Change video languages using AI like YouTube - completely local or with OpenAI APIs**

## Table of Contents
- [Quick Start](#quick-start)
- [Example workflow](#example-workflow)
- [Local Processing (Recommended)](#-option-1-local-processing-recommended)
- [Custom TTS (Voice Cloning)](#-option-2-custom-tts-voice-cloning)
  - [IndexTTS](#indextts)
  - [Fish-Speech](#fish-speech-openaudio-s1-mini)
  - [Qwen3-TTS](#-qwen3-tts)
  - [OmniVoice](#-omnivoice)
  - [VoxCPM2](#-voxcpm2)
  - [HiggsAudio v3 TTS](#-higgsaudio-v3-tts)
- [OpenAI API Processing](#-option-3-openai-api-processing)

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

## Example workflow
`If you are in Linux/Mac change set ..., to export ...`  
`If you are in Linux/Mac you can use localhost, if you are on windows use your local ip (windows docker don't work with localhost or 127.0.0.1, idk why)`
### Full automatic + kokorotts
```cmd
npm i
docker compose up -d whisper-stt libretranslate omnivoice

set STT_BACKEND=openai
set STT_KEY=-
set STT_HOST=http://192.168.1.100:8881/v1
set TRANSLATE_BACKEND=libre
set TRANSLATE_HOST=http://192.168.1.100:8883
set TTS_BACKEND=openai
set TTS_KEY=-
set TTS_HOST=http://192.168.1.100:8882/v1
set TTS_VOICE=af_bella

:: node . <inputFile> <inputLang> <outputLang>, example:
node . test.wav es en

:: Or now, you can use CLI arguments and skip using env variables just like this:
node . test.wav es en --stt-backend openai --stt-key - --stt-host http://192.168.1.100:8881/v1 --translate-backend libre --translate-host http://192.168.1.100:8883 --tts-backend openai --tts-key - --tts-host http://192.168.1.100:8882/v1 --tts-voice af_bella
```

### Full automatic + omnivoice (voice cloning)
```cmd
npm i
docker compose up -d whisper-stt libretranslate omnivoice

set STT_BACKEND=openai
set STT_KEY=-
set STT_HOST=http://192.168.1.100:8881/v1
set TRANSLATE_BACKEND=libre
set TRANSLATE_HOST=http://192.168.1.100:8883
set TTS_BACKEND=omnivoice
set TTS_HOST=http://192.168.1.100:8882
set TTS_SAMPLE=C:\Users\adriabama06\github\auto-video-translator\adri_sample_en.wav :: Or .\adri_sample_en.wav

node . test.wav es en
```

### Manual, only omnivoice (voice cloning)
```cmd
npm i
docker compose up -d omnivoice

set TTS_BACKEND=omnivoice
set TTS_HOST=http://192.168.1.100:8882
set TTS_SAMPLE=C:\Users\adriabama06\github\auto-video-translator\adri_sample_en.wav :: Or .\adri_sample_en.wav

node convert_srt_to_json.js test_en.srt

node . test_en.json skip en

:: Or using only CLI arguments:

node . test_en.json skip en --tts-backend omnivoice --tts-host http://192.168.1.100:8882 --tts-sample .\adri_sample_en.wav
```

Remember on end use:
```
docker compose down
```
To stop the containers, use `--rmi all` to also delete the images

## Language Support

All input languages are supported by Whisper (Speech-to-Text) and all output languages are supported by OmniVoice (Text-to-Speech).

> **Note**: Available languages may vary depending on the model used. Check the specific model's documentation for supported languages.

## Configuration Options

### 🌐 Option 1: Local Processing (Recommended)
Uses local Docker containers for private, offline processing

1. **Start specific services**:
   ```bash
   # Start only the services you need
   docker compose up -d whisper-stt libretranslate kokoro-tts
   ```

2. **Set environment variables**:

   **Windows (CMD)**:
   ```cmd
   :: Use your machine's local IP (not localhost) for Docker on Windows
   set STT_BACKEND=openai
   set STT_KEY=-
   set STT_HOST=http://192.168.1.100:8881/v1
   set TRANSLATE_BACKEND=libre
   set TRANSLATE_HOST=http://192.168.1.100:8883
   set TTS_BACKEND=openai
   set TTS_KEY=-
   set TTS_HOST=http://192.168.1.100:8882/v1
   set TTS_VOICE=af_bella
   ```

   **Linux/macOS**:
   ```bash
   export STT_BACKEND=openai
   export STT_KEY=-
   export STT_HOST=http://localhost:8881/v1
   export TRANSLATE_BACKEND=libre
   export TRANSLATE_HOST=http://localhost:8883
   export TTS_BACKEND=openai
   export TTS_KEY=-
   export TTS_HOST=http://localhost:8882/v1
   export TTS_VOICE=af_bella
   ```

   > **Important**: Even in local mode, you must set dummy values for both `STT_KEY` and `TTS_KEY`:
   > - `STT_KEY=-` (dummy value)
   > - `TTS_KEY=-` (dummy value)
   > These are required for the tool to work properly in local mode.

   > **Windows Docker Note**: Replace `192.168.1.100` with your actual local IP address. Find it with `ipconfig` (look for IPv4 Address). Localhost may not work with Docker on Windows.

### 🎤 Option 2: Custom TTS (Voice Cloning)
Use your own voice for translations with one of these models:

#### IndexTTS 1.5
- Requires: Audio sample only
- Port: 8882

1. **Start services**:
   ```bash
   docker compose up -d whisper-stt libretranslate indextts1.5
   ```

2. **Set environment variables**:
   ```cmd
   :: Windows
   set TTS_BACKEND=indextts1.5
   set TTS_HOST=http://192.168.1.100:8882
   set TTS_SAMPLE=C:\path\to\your\voice_sample.wav
   ```
   ```bash
   # Linux/macOS
   export TTS_BACKEND=indextts1.5
   export TTS_HOST=http://localhost:8882
   export TTS_SAMPLE=/path/to/your/voice_sample.wav
   ```

#### Fish-Speech (OpenAudio-S1-Mini)
- Requires: Audio sample + transcription file
- Port: 8882

1. **Start services**:
   ```bash
   docker compose up -d whisper-stt libretranslate fish-speech
   ```

2. **Set environment variables**:
   ```cmd
   :: Windows
   set TTS_BACKEND=fishspeech
   set TTS_HOST=http://192.168.1.100:8882
   set TTS_SAMPLE=C:\path\to\your\voice_sample.wav
   ```
   ```bash
   # Linux/macOS
   export TTS_BACKEND=fishspeech
   export TTS_HOST=http://localhost:8882
   export TTS_SAMPLE=/path/to/your/voice_sample.wav
   ```

   > **Voice Sample Requirements**:
   > - 8-20 seconds duration
   > - Clean, clear, noise-free audio
   > - WAV format
   > - Must be in the **target output language** (Recommended)
   > 
   > **Fish-Speech Additional Requirement**:
   > - Create a transcription file with the same name as your audio sample but with `.txt` extension
   > - Example: If your sample is `voice_sample.wav`, create `voice_sample.wav.txt` with the transcription

#### ⭐ Qwen3-TTS
**Voice cloning with improved quality and lower VRAM usage** — Uses the same voice cloning approach as Fish-Speech but with better audio quality and approximately 1-2 GB less VRAM consumption. Note: Processing is slower than Fish-Speech but produces higher quality output.

- Requires: Audio sample + transcription file
- Port: 8882
- VRAM: ~2 GB less than Fish-Speech
- Quality: Higher audio quality
- **Speed Tip**: For faster processing (but a little bit lower quality), you can switch from the **1.7B** model to the **0.6B** model (replace `Qwen3-TTS-12Hz-1.7B-Base` with `Qwen3-TTS-12Hz-0.6B-Base` in `util/entrypoint.qwen3tts.sh`).

1. **Start services**:
   ```bash
   docker compose up -d whisper-stt libretranslate qwen3tts
   ```

2. **Set environment variables**:
   ```cmd
   :: Windows
   set TTS_BACKEND=qwen3tts
   set TTS_HOST=http://192.168.1.100:8882
   set TTS_SAMPLE=C:\path\to\your\voice_sample.wav
   ```
   ```bash
   # Linux/macOS
   export TTS_BACKEND=qwen3tts
   export TTS_HOST=http://localhost:8882
   export TTS_SAMPLE=/path/to/your/voice_sample.wav
   ```

   > **Voice Sample Requirements**:
   > - 10-20 seconds duration (Max 60s)
   > - Clean, clear, noise-free audio
   > - WAV format
   > - If possible be in the **target output language** (Recommended)
   > 
   > **Qwen3-TTS Additional Requirement**:
   > - Create a transcription file with the same name as your audio sample but with `.txt` extension
   > - Example: If your sample is `voice_sample.wav`, create `voice_sample.wav.txt` with the transcription

#### ⭐⭐⭐ OmniVoice
**Voice cloning with optimized VRAM usage** — Uses the same voice cloning approach as Qwen3-TTS with a more efficient model. Base VRAM usage is approximately 2.1 GB, making it suitable for GPUs with limited VRAM.

- Requires: Audio sample + transcription file
- Port: 8882
- Base VRAM: ~2.1 GB
- VRAM per second of input: ~0.3 GB/s
- Example: 16s of reference voice input uses of extra ~5 GB VRAM (7.1 GB of VRAM in total)
- **RTX 3080 10GB**: Maximum recommended reference audio is 16s (7.1 GB VRAM usage fits within 10GB)

1. **Start services**:
   ```bash
   docker compose up -d whisper-stt libretranslate omnivoice
   ```

2. **Set environment variables**:
   ```cmd
   :: Windows
   set TTS_BACKEND=omnivoice
   set TTS_HOST=http://192.168.1.100:8882
   set TTS_SAMPLE=C:\path\to\your\voice_sample.wav
   ```
   ```bash
   # Linux/macOS
   export TTS_BACKEND=omnivoice
   export TTS_HOST=http://localhost:8882
   export TTS_SAMPLE=/path/to/your/voice_sample.wav
   ```

   > **Voice Sample Requirements**:
   > - 5-20 seconds duration (recommended 5s to <20s)
   > - Clean, clear, noise-free audio
   > - WAV format
   > - If possible be in the **target output language** (Recommended)
   > 
   > **OmniVoice Additional Requirement**:
   > - Create a transcription file with the same name as your audio sample but with `.txt` extension
   > - Example: If your sample is `voice_sample.wav`, create `voice_sample.wav.txt` with the transcription

#### ⭐⭐ VoxCPM2
**Voice cloning with support for multiple languages** — Similar to Qwen3-TTS and OmniVoice in terms of setup and usage.

- Requires: Audio sample + transcription file
- Port: 8882
- **Important**: Maximum input audio duration is **30 seconds**. Do not exceed this limit.
- **Memory Error Solution**: If you encounter memory errors when running VoxCPM2, try increasing `--gpu-memory-utilization` in the Docker Compose file.

1. **Start services**:
   ```bash
   docker compose up -d whisper-stt libretranslate voxcpm2
   ```

2. **Set environment variables**:
   ```cmd
   :: Windows
   set TTS_BACKEND=voxcpm2
   set TTS_HOST=http://192.168.1.100:8882
   set TTS_SAMPLE=C:\path\to\your\voice_sample.wav
   ```
   ```bash
   # Linux/macOS
   export TTS_BACKEND=voxcpm2
   export TTS_HOST=http://localhost:8882
   export TTS_SAMPLE=/path/to/your/voice_sample.wav
   ```

   > **Voice Sample Requirements**:
   > - Maximum 30 seconds duration (shorter is recommended)
   > - Clean, clear, noise-free audio
   > - WAV format
   > - If possible be in the **target output language** (Recommended)
   > 
> **VoxCPM2 Additional Requirement**:
> - Create a transcription file with the same name as your audio sample but with `.txt` extension
> - Example: If your sample is `voice_sample.wav`, create `voice_sample.wav.txt` with the transcription

#### ⭐ HiggsAudio v3 TTS
**Voice cloning with HiggsAudio v3 TTS 4B** — Similar to Qwen3-TTS in terms of setup and usage. Uses approximately 7 GB of VRAM in total.

- Requires: Audio sample + transcription file
- Port: 8882
- VRAM: ~7 GB total

1. **Start services**:
   ```bash
   docker compose up -d whisper-stt libretranslate higgsv3
   ```

2. **Set environment variables**:
   ```cmd
   :: Windows
   set TTS_BACKEND=higgsv3
   set TTS_HOST=http://192.168.1.100:8882
   set TTS_SAMPLE=C:\path\to\your\voice_sample.wav
   ```
   ```bash
   # Linux/macOS
   export TTS_BACKEND=higgsv3
   export TTS_HOST=http://localhost:8882
   export TTS_SAMPLE=/path/to/your/voice_sample.wav
   ```

   > **Voice Sample Requirements**:
   > - Clean, clear, noise-free audio
   > - WAV format
   > - If possible be in the **target output language** (Recommended)
   > 
   > **HiggsAudio v3 Additional Requirement**:
   > - Create a transcription file with the same name as your audio sample but with `.txt` extension
   > - Example: If your sample is `voice_sample.wav`, create `voice_sample.wav.txt` with the transcription

### ☁️ Option 3: OpenAI API Processing
Uses OpenAI's cloud services (requires API keys)

Set these environment variables:

**Windows**:
```cmd
set STT_BACKEND=openai
set STT_KEY=sk-xxxxxxxx
set STT_HOST=https://api.openai.com/v1

set TTS_BACKEND=openai
set TTS_KEY=sk-xxxxxxxx
set TTS_HOST=https://api.openai.com/v1
set TTS_VOICE=alloy  # or nova, shimmer, echo

set TRANSLATE_BACKEND=openai
set TRANSLATE_KEY=sk-xxxxxxxx
set TRANSLATE_HOST=https://api.openai.com/v1
set TRANSLATE_MODEL=gpt-4-turbo
```

**Linux/macOS**:
```bash
export STT_BACKEND=openai
export STT_KEY=sk-xxxxxxxx
export STT_HOST=https://api.openai.com/v1

export TTS_BACKEND=openai
export TTS_KEY=sk-xxxxxxxx
export TTS_HOST=https://api.openai.com/v1
export TTS_VOICE=alloy

export TRANSLATE_BACKEND=openai
export TRANSLATE_KEY=sk-xxxxxxxx
export TRANSLATE_HOST=https://api.openai.com/v1
export TRANSLATE_MODEL=gpt-4-turbo
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
  node . input.wav skip es  # Keeps original speech, translates to Spanish
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
1. Windows:
   - I recommend using CMD over PowerShell; PowerShell requires different commands to set environment variables.

1. For local processing:
   - Keep Docker running while processing audios
   - First run will download large models (5-10GB)
   - Requires powerful hardware (recommended 16GB+ RAM and 8GB+ VRAM)

1. IP addresses:
   - **Windows Docker**: Must use machine's local IP (not localhost)
   - Find Windows IP: Run `ipconfig` → "IPv4 Address"
   - Linux/macOS can use `localhost`

1. Output files:
   - Audios: `<original>_<outputLang>.wav`
   - Transcripts: `<original>.srt` and `<original>.json`

1. Custom TTS requirements:
   - Voice samples must be high-quality recordings
   - Samples must match target language
   - First run will take longer to train voice model
   - Requires additional GPU resources for best results

1. Hardware Compatibility and Requirements:
   - **This tool has only been tested on Nvidia (CUDA)**: For CPU-only processing, it should work without issues but may be slower.
   - **AMD GPU users**: Setting up ROCm might be more complex, and some models may not work properly. In such cases, using CPU is recommended.
   - **VRAM Recommendations**:
     - For running individual services (e.g., only speech-to-text or text-to-speech), at least **6 GB of VRAM** is recommended.
     - For running the complete workflow with multiple services simultaneously, at least **10 GB of VRAM** is recommended.

## Other interesting models that could be added:
### Zero-Shot:
- https://github.com/k2-fsa/ZipVoice - Good results (English, Chinese) - Apache-2.0 :D
- https://github.com/bytedance/MegaTTS3 - Good results (English, Chinese) - Apache-2.0 :D

```
Warning! Any of the audios found in this repository cannot be used for anything other than personal and private use to test the code, non-private and personal use, that is, generating an audio that is uploaded to the internet, shared, sent to someone, even with the purpose of doing harm or not, even if it is just for fun is illegal. You cannot use another person's voices without their consent (in this case my voice), the improper use of their voice will be an infringement of identity theft and can end in serious legal problems, even facing prison sentences of several months or years, this message is only to warn about the use of my voice in this repository and in my YouTube videos, this message also affects previous commits.
```
