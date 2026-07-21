import { STT_BACKENDS } from "./stt.js";
import { TTS_BACKENDS } from "./tts.js";
import { TRANSLATE_BACKENDS } from "./translate.js";

import fs from "fs";

const packageConfig = JSON.parse(fs.readFileSync("package.json").toString());

const section_arguments = [
    {
        title: "Speech-to-Text",
        options: [
            { arg: "STT_BACKEND", desc: `Set backend for speech to text, available: ${Object.keys(STT_BACKENDS).join(", ")}`, example: Object.keys(STT_BACKENDS)[0] },
            { arg: "STT_KEY", desc: "API key for STT backend", example: "-" },
            { arg: "STT_HOST", desc: "Host URL for STT backend", example: "http://192.168.1.100:8881/v1" },
            { arg: "STT_MODEL", desc: "STT model name, default: whisper-1", example: "whisper-1" },
            { arg: "STT_MIN_WORDS", desc: "Minimum words per segment, default: 20", example: "20" },
            { arg: "STT_MAX_WORDS", desc: "Maximum words per segment, default: 80", example: "80" },
            { arg: "STT_MIN_SPACE", desc: "Minimum space between segments, default: 0.6", example: "0.6" }
        ]
    },
    {
        title: "Translation",
        options: [
            { arg: "TRANSLATE_BACKEND", desc: `Set backend for translation, available: ${Object.keys(TRANSLATE_BACKENDS).join(", ")}`, example: Object.keys(TRANSLATE_BACKENDS)[0] },
            { arg: "TRANSLATE_KEY", desc: "API key for translation backend", example: "-" },
            { arg: "TRANSLATE_HOST", desc: "Host URL for translation backend", example: "http://192.168.1.100:8883" },
            { arg: "TRANSLATE_MODEL", desc: "Translation model to use", example: "gpt-5.4-mini-2026-03-17" }
        ]
    },
    {
        title: "Text-to-Speech",
        options: [
            { arg: "TTS_BACKEND", desc: `Set backend for text to speech, available: ${Object.keys(TTS_BACKENDS).join(", ")}`, example: Object.keys(TTS_BACKENDS)[0] },
            { arg: "TTS_KEY", desc: "API key for TTS backend", example: "-" },
            { arg: "TTS_HOST", desc: "Host URL for TTS backend", example: "http://192.168.1.100:8882/v1" },
            { arg: "TTS_SAMPLE", desc: "Path to sample audio file for voice cloning (It may be required depending on the model or backend and it might also require an extra .wav.txt transcript file depending on the model or backend)", example: "C:\\path\\to\\voice_sample.wav / /path/to/voice_sample.wav" },
            { arg: "TTS_VOICE", desc: "Voice name for OpenAI TTS (It may be required depending on the model or backend)", example: "af_bella" }
        ]
    },
    {
        title: "FFmpeg",
        options: [
            { arg: "FFMPEG_SPEED_EFFECT", desc: "FFmpeg speed effect string, available: rubberband, atempo; default: atempo", example: "atempo" }
        ]
    }
]

function printSpaces(minuslen) {
    let toreturn = "";
    for (let i = 0; i < 22 - minuslen; i++) {
        toreturn += " ";
    }
    return toreturn;
}

function printHelp() {
    console.log(
`auto-video-translator v${packageConfig.version} - ${packageConfig.description}
Url: ${packageConfig.homepage}
Usage: ${process.argv[0]} ${process.argv[1]} <inputFile> <inputLang> <outputLang>
Example: ${process.argv[0]} ${process.argv[1]} test.wav en es

Main arguments:
    --help, -h${printSpaces("help, -h".length)} -> Print this message
    --output, -o${printSpaces("output, -o".length)} -> Set custom output file | example: -o out.wav

${section_arguments.map(
    section => `${section.title}:\n${section.options.map(
        opt => `    --${opt.arg.toLowerCase().replace(/_/g, "-")}${printSpaces(opt.arg.length)} -> ${opt.desc} | example: ${opt.example}`
    ).join("\n")}`
).join("\n\n")}


`.trim()
    );
}

export function loadArgs() {
    // i = 5 to skip: ["node", "file.js", "<inputFile>", "<inputLang>", "<outputLang>"]
    for (let i = 5; i < process.argv.length; i++) {
        let option = process.argv[i];
        
        if(["--help", "-h"].includes(option)) { printHelp(); process.exit(0); }
        if(["-o"].includes(option)) option = "--output";

        const option_value = process.argv[++i];

        if(!option_value) { printHelp(); console.log(`No argument for ${option}`); process.exit(0); }

        process.env[option.slice(2).toUpperCase().replace(/-/g, "_")] = option_value;
    }

    if(process.argv.length <= 5) { printHelp(); process.exit(0); }
}

loadArgs();
