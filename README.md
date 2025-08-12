# auto-video-translator
Change the video language using AI like on YouTube, but totally local

# How to run:
## Option 1 - Locally
- Install NodeJS, run `npm i`
In the compose file edit the LT_LOAD_ONLY=en,es to set the languages you want to use for translation
- Install Docker and run: docker compose up -d
- In the enviroment set:
Windows:
```
set STT_OPENAI_KEY=-
set STT_OPENAI_HOST=http://192.168.1.154:8881/v1

set TTS_OPENAI_KEY=-
set TTS_OPENAI_HOST=http://192.168.1.154:8882/v1
set TTS_OPENAI_VOICE=af_bella
# Select the voice for your language https://github.com/remsky/Kokoro-FastAPI/tree/master/api/src/voices/v1_0 - Example, for english: af_bella or for spanish: ef_dora

set RETRANSLATE_HOST=http://192.168.1.154:8883
```

Linux:
```
STT_OPENAI_KEY=-
STT_OPENAI_HOST=http://192.168.1.154:8881/v1

TTS_OPENAI_KEY=-
TTS_OPENAI_HOST=http://192.168.1.154:8882/v1
TTS_OPENAI_VOICE=af_bella
# Select the voice for your language https://github.com/remsky/Kokoro-FastAPI/tree/master/api/src/voices/v1_0 - Example, for english: af_bella or for spanish: ef_dora

RETRANSLATE_HOST=http://192.168.1.154:8883
```

- To run use: `node . <inputFile> <inputLang> <outputLang>`

## Option 2 - Using OpenAI
- Install NodeJS, run `npm i`
- In the enviroment set:
Windows:
```
set STT_OPENAI_KEY=YOUR-API-KEY
set STT_OPENAI_HOST=https://api.openai.com/v1

set TTS_OPENAI_KEY=YOUR-API-KEY
set TTS_OPENAI_HOST=https://api.openai.com/v1
set TTS_OPENAI_VOICE=alloy
# Select the voice for your language https://platform.openai.com/docs/guides/text-to-speech

set TRANSLATE_OPENAI_KEY=YOUR-API-KEY
set TRANSLATE_OPENAI_HOST=https://api.openai.com/v1
set TRANSLATE_OPENAI_MODEL=gpt-5-nano
```

Linux:
```
STT_OPENAI_KEY=YOUR-API-KEY
STT_OPENAI_HOST=https://api.openai.com/v1

TTS_OPENAI_KEY=YOUR-API-KEY
TTS_OPENAI_HOST=https://api.openai.com/v1
TTS_OPENAI_VOICE=alloy
# Select the voice for your language https://platform.openai.com/docs/guides/text-to-speech

TRANSLATE_OPENAI_KEY=YOUR-API-KEY
TRANSLATE_OPENAI_HOST=https://api.openai.com/v1
TRANSLATE_OPENAI_MODEL=gpt-5-nano
```

- To run use: `node . <inputFile> <inputLang> <outputLang>`
