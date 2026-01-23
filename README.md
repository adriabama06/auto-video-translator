# Auto Video Translator 🎥🔊
**Change video languages using AI like YouTube - completely local or with OpenAI APIs**

## New model: Qwen3-TTS for voice cloning! Better quality and lower VRAM usage than Fish-Speech!
[Click here to see Qwen3-TTS voice cloning instructions](#-qwen3-tts-new)

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

## Language Support
> This list may vary depending on the model used. 

| Input Languages (Speech-to-Text) | Output Languages (Text-to-Speech) |
|----------------------------------|-----------------------------------|
| [Full list of Whisper v3 languages](https://huggingface.co/openai/whisper-large-v3) | [OpenAudio S1 Mini languages](https://huggingface.co/fishaudio/openaudio-s1-mini) |
| - English (en)                   | - English (en)                    |
| - Chinese (zh)                   | - Chinese (zh)                    |
| - German (de)                    | - Japanese (ja)                   |
| - Spanish (es)                   | - German (de)                     |
| - Russian (ru)                   | - French (fr)                     |
| - Korean (ko)                    | - Spanish (es)                    |
| - French (fr)                    | - Korean (ko)                     |
| - Japanese (ja)                  | - Arabic (ar)                     |
| - Portuguese (pt)                | - Russian (ru)                    |
| - Turkish (tr)                   | - Dutch (nl)                      |
| - Polish (pl)                    | - Italian (it)                    |
| - Catalan (ca)                   | - Polish (pl)                     |
| - Dutch (nl)                     | - Portuguese (pt)                 |
| - Arabic (ar)                    |                                   |
| - Swedish (sv)                   |                                   |
| - Italian (it)                   |                                   |
| - Indonesian (id)                |                                   |
| - Hindi (hi)                     |                                   |
| - Finnish (fi)                   |                                   |
| - Vietnamese (vi)                |                                   |
| - Hebrew (he)                    |                                   |
| - Ukrainian (uk)                 |                                   |
| - Greek (el)                     |                                   |
| - Malay (ms)                     |                                   |
| - Czech (cs)                     |                                   |
| - Romanian (ro)                  |                                   |
| - Danish (da)                    |                                   |
| - Hungarian (hu)                 |                                   |
| - Tamil (ta)                     |                                   |
| - Norwegian (no)                 |                                   |
| - Thai (th)                      |                                   |
| - Urdu (ur)                      |                                   |
| - Croatian (hr)                  |                                   |
| - Bulgarian (bg)                 |                                   |
| - Lithuanian (lt)                |                                   |
| - Latin (la)                     |                                   |
| - Maori (mi)                     |                                   |
| - Malayalam (ml)                 |                                   |
| - Welsh (cy)                     |                                   |
| - Slovak (sk)                    |                                   |
| - Telugu (te)                    |                                   |
| - Persian (fa)                   |                                   |
| - Latvian (lv)                   |                                   |
| - Bengali (bn)                   |                                   |
| - Serbian (sr)                   |                                   |
| - Azerbaijani (az)               |                                   |
| - Slovenian (sl)                 |                                   |
| - Kannada (kn)                   |                                   |
| - Estonian (et)                  |                                   |
| - Macedonian (mk)                |                                   |
| - Breton (br)                    |                                   |
| - Basque (eu)                    |                                   |
| - Icelandic (is)                 |                                   |
| - Armenian (hy)                  |                                   |
| - Nepali (ne)                    |                                   |
| - Mongolian (mn)                 |                                   |
| - Bosnian (bs)                   |                                   |
| - Kazakh (kk)                    |                                   |
| - Albanian (sq)                  |                                   |
| - Swahili (sw)                   |                                   |
| - Galician (gl)                  |                                   |
| - Marathi (mr)                   |                                   |
| - Punjabi (pa)                   |                                   |
| - Sinhala (si)                   |                                   |
| - Khmer (km)                     |                                   |
| - Shona (sn)                     |                                   |
| - Yoruba (yo)                    |                                   |
| - Somali (so)                    |                                   |
| - Afrikaans (af)                 |                                   |
| - Occitan (oc)                   |                                   |
| - Georgian (ka)                  |                                   |
| - Belarusian (be)                |                                   |
| - Tajik (tg)                     |                                   |
| - Sindhi (sd)                    |                                   |
| - Gujarati (gu)                  |                                   |
| - Amharic (am)                   |                                   |
| - Yiddish (yi)                   |                                   |
| - Lao (lo)                       |                                   |
| - Uzbek (uz)                     |                                   |
| - Faroese (fo)                   |                                   |
| - Haitian Creole (ht)            |                                   |
| - Pashto (ps)                    |                                   |
| - Turkmen (tk)                   |                                   |
| - Nynorsk (nn)                   |                                   |
| - Maltese (mt)                   |                                   |
| - Sanskrit (sa)                  |                                   |
| - Luxembourgish (lb)             |                                   |
| - Burmese (my)                   |                                   |
| - Tibetan (bo)                   |                                   |
| - Tagalog (tl)                   |                                   |
| - Malagasy (mg)                  |                                   |
| - Assamese (as)                  |                                   |
| - Tatar (tt)                     |                                   |
| - Hawaiian (haw)                 |                                   |
| - Lingala (ln)                   |                                   |
| - Hausa (ha)                     |                                   |
| - Bashkir (ba)                   |                                   |
| - Javanese (jw)                  |                                   |
| - Sundanese (su)                 |                                   |

## Configuration Options

### 🌐 Option 1: Local Processing (Recommended)
Uses local Docker containers for private, offline processing

1. **Start specific services**:
   ```bash
   # Start only the services you need
   docker compose up -d whisper-stt libretranslate kokoro-tts
   ```

2. **Set environment variables**:

   **Windows (CMD/PowerShell)**:
   ```cmd
   :: Use your machine's local IP (not localhost) for Docker on Windows
   set STT_OPENAI_KEY=-
   set STT_OPENAI_HOST=http://192.168.1.100:8881/v1
   set TTS_OPENAI_KEY=-
   set TTS_OPENAI_HOST=http://192.168.1.100:8882/v1
   set TTS_OPENAI_VOICE=af_bella
   set RETRANSLATE_HOST=http://192.168.1.100:8883
   ```

   **Linux/macOS**:
   ```bash
   export STT_OPENAI_KEY=-
   export STT_OPENAI_HOST=http://localhost:8881/v1
   export TTS_OPENAI_KEY=-
   export TTS_OPENAI_HOST=http://localhost:8882/v1
   export TTS_OPENAI_VOICE=af_bella
   export RETRANSLATE_HOST=http://localhost:8883
   ```

   > **Important**: Even in local mode, you must set dummy values for both `STT_OPENAI_KEY` and `TTS_OPENAI_KEY`:
   > - `STT_OPENAI_KEY=-` (dummy value)
   > - `TTS_OPENAI_KEY=-` (dummy value)
   > These are required for the tool to work properly in local mode.

   > **Windows Docker Note**: Replace `192.168.1.100` with your actual local IP address. Find it with `ipconfig` (look for IPv4 Address). Localhost may not work with Docker on Windows.

### 🎤 Option 2: Custom TTS (Voice Cloning)
Use your own voice for translations with one of these models:

#### IndexTTS
- Requires: Audio sample only
- Port: 8882

1. **Start services**:
   ```bash
   docker compose up -d whisper-stt libretranslate indextts
   ```

2. **Set environment variables**:
   ```cmd
   :: Windows
   set CUSTOM_TTS=http://192.168.1.100:8882
   set CUSTOM_TTS_MODEL=indextts
   set CUSTOM_TTS_SAMPLE=C:\\path\\to\\your\\voice_sample.wav
   ```
   ```bash
   # Linux/macOS
   export CUSTOM_TTS=http://localhost:8882
   export CUSTOM_TTS_MODEL=indextts
   export CUSTOM_TTS_SAMPLE=/path/to/your/voice_sample.wav
   ```

#### Fish-Speech (OpenAudio-S1-Mini)
- Requires: Audio sample + transcription file
- Port: 8882

1. **Start services**:
   ```bash
   docker compose up -d whisper-stt libretranslate openaudio-s1-mini
   ```

2. **Set environment variables**:
   ```cmd
   :: Windows
   set CUSTOM_TTS=http://192.168.1.100:8882
   set CUSTOM_TTS_MODEL=fishspeech
   set CUSTOM_TTS_SAMPLE=C:\\path\\to\\your\\voice_sample.wav
   ```
   ```bash
   # Linux/macOS
   export CUSTOM_TTS=http://localhost:8882
   export CUSTOM_TTS_MODEL=fishspeech
   export CUSTOM_TTS_SAMPLE=/path/to/your/voice_sample.wav
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

#### ⭐ Qwen3-TTS (NEW!)
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
   set CUSTOM_TTS=http://192.168.1.100:8882
   set CUSTOM_TTS_MODEL=qwen3tts
   set CUSTOM_TTS_SAMPLE=C:\\path\\to\\your\\voice_sample.wav
   ```
   ```bash
   # Linux/macOS
   export CUSTOM_TTS=http://localhost:8882
   export CUSTOM_TTS_MODEL=qwen3tts
   export CUSTOM_TTS_SAMPLE=/path/to/your/voice_sample.wav
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

5. Hardware Compatibility and Requirements:
   - **This tool has only been tested on Nvidia (CUDA)**: For CPU-only processing, it should work without issues but may be slower.
   - **AMD GPU users**: Setting up ROCm might be more complex, and some models may not work properly. In such cases, using CPU is recommended.
   - **VRAM Recommendations**:
     - For running individual services (e.g., only speech-to-text or text-to-speech), at least **6 GB of VRAM** is recommended.
     - For running the complete workflow with multiple services simultaneously, at least **10 GB of VRAM** is recommended.

## Other interesting models that could be added:
### Zero-Shot:
- https://github.com/k2-fsa/ZipVoice - Good results (Enlgish, Chinese) - Apache-2.0 :D
- https://github.com/bytedance/MegaTTS3 - Good results (Enlgish, Chinese) - Apache-2.0 :D
- https://github.com/boson-ai/higgs-audio - Very good results (English, Chinese Only?) (Warning: Very big) - Apache-2.0 :D
- https://github.com/fishaudio/fish-speech - Very good results (Chinese, English, German, Japanese, French, Spanish, Korean, Arabic, Dutch, Russian, Italian, Polish, Portuguese) - cc-by-nc-sa-4.0 :c

```
Warning! Any of the audios found in this repository cannot be used for anything other than personal and private use to test the code, non-private and personal use, that is, generating an audio that is uploaded to the internet, shared, sent to someone, even with the purpose of doing harm or not, even if it is just for fun is illegal. You cannot use another person's voices without their consent (in this case my voice), the improper use of their voice will be an infringement of identity theft and can end in serious legal problems, even facing prison sentences of several months or years, this message is only to warn about the use of my voice in this repository and in my YouTube videos, this message also affects previous commits.
```
