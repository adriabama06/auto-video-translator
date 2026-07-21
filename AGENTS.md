# Supported AI Agents & Backends

Auto Video Translator operates as a pipeline comprising three core processing steps: Speech-to-Text (STT), Translation, and Text-to-Speech (TTS). Each step utilizes pluggable backend **agents** (local Docker-based services or cloud APIs). 

This document details the configuration, expected APIs, requirements, and features of each supported agent.

---

## Table of Contents
- [1. Speech-to-Text (STT) Agents](#1-speech-to-text-stt-agents)
  - [OpenAI Whisper / Speaches-AI (openai)](#openai-whisper--speaches-ai-openai)
- [2. Translation Agents](#2-translation-agents)
  - [OpenAI Chat Completions (openai)](#openai-chat-completions-openai)
  - [LibreTranslate (libre)](#libretranslate-libre)
- [3. Text-to-Speech (TTS) Agents](#3-text-to-speech-tts-agents)
  - [OpenAI TTS / Kokoro (openai)](#openai-tts--kokoro-openai)
  - [Fish-Speech (fish-speech)](#fish-speech-fish-speech)
  - [HiggsAudio v3 (higgsv3)](#higgsaudio-v3-higgsv3)
  - [IndexTTS 1.5 (indextts1.5)](#indextts-15-indextts15)
  - [OmniVoice (omnivoice)](#omnivoice-omnivoice)
  - [Qwen3-TTS (qwen3tts)](#qwen3-tts-qwen3tts)
  - [VoxCPM2 (voxcpm2)](#voxcpm2-voxcpm2)

---

## 1. Speech-to-Text (STT) Agents

STT agents transcribe input audio into timed segments containing text along with timestamps.

### OpenAI Whisper / Speaches-AI (`openai`)
This backend calls an OpenAI-compliant audio transcription endpoint. Locally, it runs via the `whisper-stt` service (using the highly optimized `speaches-ai` docker image).

* **API Endpoint Used:** `POST ${STT_HOST}/audio/transcriptions`
* **Format:** Expects `verbose_json` response with segment timestamps.
* **Relevant Variables:**
  * `STT_BACKEND=openai`
  * `STT_HOST`: API base URL (e.g., `https://api.openai.com/v1` or local `http://localhost:8881/v1`).
  * `STT_KEY`: API authentication key (use a dummy value like `-` for local setup).
  * `STT_MODEL`: Whisper model name (defaults to `whisper-1`).
  * `STT_MIN_WORDS`: Minimum words per segment (default: `20`).
  * `STT_MAX_WORDS`: Maximum words per segment (default: `80`).
  * `STT_MIN_SPACE`: Minimum space between segments (default: `0.6`).

---

## 2. Translation Agents

Translation agents translate the transcribed segment text from the source language to the target output language.

### OpenAI Chat Completions (`openai`)
Uses LLM-based translation via OpenAI or any compatible local LLM API (e.g. LocalAI, Ollama, vLLM).

* **API Endpoint Used:** `POST ${TRANSLATE_HOST}/chat/completions`
* **Prompting Strategy:** System prompt forces translation maintaining punctuation, avoiding censorship, and returning only the translation without prefix/suffix notes.
* **Relevant Variables:**
  * `TRANSLATE_BACKEND=openai`
  * `TRANSLATE_HOST`: API base URL (e.g., `https://api.openai.com/v1`).
  * `TRANSLATE_KEY`: API authentication key.
  * `TRANSLATE_MODEL`: LLM model name (e.g., `gpt-4-turbo`).

### LibreTranslate (`libre`)
An open-source, fully offline translation engine service running locally in Docker.

* **API Endpoint Used:** `POST ${TRANSLATE_HOST}/translate`
* **Payload Type:** JSON with keys: `{ q, source, target, format: "text", alternatives: 0, api_key: "" }`.
* **Relevant Variables:**
  * `TRANSLATE_BACKEND=libre`
  * `TRANSLATE_HOST`: API base URL (local default: `http://localhost:8883`).

---

## 3. Text-to-Speech (TTS) Agents

TTS agents convert translated text segments back into spoken audio. To keep the video and audio synchronized, the pipeline automatically processes the output audio using FFmpeg speed filters (such as `atempo`) to ensure the generated segment closely fits the original segment's `targetDuration`.

### OpenAI TTS / Kokoro (`openai`)
Compatible with OpenAI's official speech API or local equivalents like `kokoro-tts` (which runs extremely fast on GPU).

* **API Endpoint Used:** `POST ${TTS_HOST}/audio/speech`
* **Features:** Robust, high-speed, standard quality, supports standard OpenAI voices (`alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`) or Kokoro-specific voice names (e.g., `af_bella`).
* **Relevant Variables:**
  * `TTS_BACKEND=openai`
  * `TTS_HOST`: API base URL (e.g., `https://api.openai.com/v1` or local `http://localhost:8882/v1`).
  * `TTS_KEY`: API authentication key (use a dummy value like `-` for local setup).
  * `TTS_VOICE`: Voice identifier (e.g., `alloy` or `af_bella`).

### Fish-Speech (`fish-speech`)
An open-source reference-based voice synthesis system (OpenAudio-S1-Mini) capable of zero-shot voice cloning.

* **API Endpoint Used:** `POST ${TTS_HOST}/v1/tts`
* **Requirements:**
  * Clean WAV audio sample (8-20 seconds duration).
  * A text transcription file named `<sample_filename>.wav.txt` containing the exact spoken words in the sample audio.
* **Relevant Variables:**
  * `TTS_BACKEND=fish-speech`
  * `TTS_HOST`: API base URL (local default: `http://localhost:8882`).
  * `TTS_KEY`: API authorization key.
  * `TTS_SAMPLE`: Absolute path to your reference `.wav` file.

### HiggsAudio v3 (`higgsv3`)
Uses the 4-billion parameter Higgs-Audio v3 model via a `vllm-openai` or `vllm-omni` local server. Provides extremely realistic voice cloning.

* **API Endpoint Used:** `POST ${TTS_HOST}/v1/audio/speech`
* **Model Name:** `bosonai/higgs-audio-v3-tts-4b`
* **Requirements:**
  * Clean WAV audio sample.
  * A text transcription file named `<sample_filename>.wav.txt` containing the transcription.
  * GPU memory of ~7 GB VRAM.
* **Relevant Variables:**
  * `TTS_BACKEND=higgsv3`
  * `TTS_HOST`: API base URL (local default: `http://localhost:8882`).
  * `TTS_KEY`: API authentication key.
  * `TTS_SAMPLE`: Absolute path to your reference `.wav` file.

### IndexTTS 1.5 (`indextts1.5`)
Provides high-performance voice cloning with simple configurations.

* **API Endpoint Used:** `POST ${TTS_HOST}/synthesize`
* **Features:** Takes base64 encoded reference audio and synthesizes audio. Does not require a separate `.txt` transcription file.
* **Relevant Variables:**
  * `TTS_BACKEND=indextts1.5`
  * `TTS_HOST`: API base URL (local default: `http://localhost:8882`).
  * `TTS_SAMPLE`: Absolute path to your reference `.wav` file.

### OmniVoice (`omnivoice`)
Optimized for GPUs with limited VRAM (~2.1 GB base VRAM), utilizing Gradio-based python endpoints.

* **API Endpoint Used:** Gradio WebSocket connect to `_clone_fn` on `${TTS_HOST}`.
* **Requirements:**
  * Clean WAV audio sample (5-20 seconds duration).
  * A text transcription file named `<sample_filename>.wav.txt` containing the transcription.
* **Relevant Variables:**
  * `TTS_BACKEND=omnivoice`
  * `TTS_HOST`: API base URL (local default: `http://localhost:8882`).
  * `TTS_SAMPLE`: Absolute path to your reference `.wav` file.

### Qwen3-TTS (`qwen3tts`)
High-quality voice cloning with a smaller memory footprint than Fish-Speech, utilizing Gradio-based python endpoints.

* **API Endpoint Used:** Gradio WebSocket connect to `/run_voice_clone` on `${TTS_HOST}`.
* **Requirements:**
  * Clean WAV audio sample (10-20 seconds duration, max 60s).
  * A text transcription file named `<sample_filename>.wav.txt` containing the transcription.
* **Relevant Variables:**
  * `TTS_BACKEND=qwen3tts`
  * `TTS_HOST`: API base URL (local default: `http://localhost:8882`).
  * `TTS_SAMPLE`: Absolute path to your reference `.wav` file.

### VoxCPM2 (`voxcpm2`)
A multilingual voice-cloning model running over a custom local `vllm-omni` OpenAI-compliant server.

* **API Endpoint Used:** `POST ${TTS_HOST}/v1/audio/speech`
* **Model Name:** `openbmb/VoxCPM2`
* **Requirements:**
  * Reference WAV audio sample (maximum 30 seconds).
  * A text transcription file named `<sample_filename>.wav.txt` containing the transcription.
* **Relevant Variables:**
  * `TTS_BACKEND=voxcpm2`
  * `TTS_HOST`: API base URL (local default: `http://localhost:8882`).
  * `TTS_KEY`: API authentication key.
  * `TTS_SAMPLE`: Absolute path to your reference `.wav` file.
