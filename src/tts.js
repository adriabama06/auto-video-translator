import OpenAI from "openai";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { randomUUID } from "crypto";
import { getDuration, getSpeedFilter } from "./backends/audio.js";

import FishSpeechGenerateAudio from "./backends/tts/fish-speech.js";
import HiggsV3GenerateAudio from "./backends/tts/higgsv3.js";
import IndexTTS15GenerateAudio from "./backends/tts/indextts1.5.js";
import OmniVoiceGenerateAudio from "./backends/tts/omnivoice.js";
import Qwen3TTSGenerateAudio from "./backends/tts/qwen3-tts.js";
import VoxCPM2GenerateAudio from "./backends/tts/voxcpm2.js";
import OpenAIGenerateAudio from "./backends/tts/openai.js";

let WORKFLOW_ID = randomUUID().substring(0, 2);
while(fs.readdirSync(".").find(f => f.startsWith(`WF_${WORKFLOW_ID}`))) {
    WORKFLOW_ID = randomUUID().substring(0, 2);
}

fs.mkdirSync(`WF_${WORKFLOW_ID}`);

process.on("exit", () => {
    fs.rmSync(`WF_${WORKFLOW_ID}`, { recursive: true, force: true });
});

let count = 0;

/**
 * @returns {string} Unique name
 */
export function getRandomName() {
    const FNAME = `WF_${WORKFLOW_ID}/tts_`;

    return `${FNAME}${count++}`;
}

/**
 * @type {{
 * [key: string]: (text: string, targetDuration: number, outputLang?: string) => Promise<string>
 * }}
 */
export let TTS_BACKENDS = {
    "openai": OpenAIGenerateAudio,
    "fish-speech": FishSpeechGenerateAudio,
    "higgsv3": HiggsV3GenerateAudio,
    "indextts1.5": IndexTTS15GenerateAudio,
    "omnivoice": OmniVoiceGenerateAudio,
    "qwen3tts": Qwen3TTSGenerateAudio,
    "voxcpm2": VoxCPM2GenerateAudio
};
