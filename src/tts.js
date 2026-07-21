import OpenAI from "openai";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { randomUUID } from "crypto";
import { getDuration, getSpeedFilter } from "./backends/audio.js";

import { FishSpeechGenerateAudio, FishSpeechGenerateAudioCheckEnv } from "./backends/tts/fish-speech.js";
import { HiggsV3GenerateAudio, HiggsV3GenerateAudioCheckEnv } from "./backends/tts/higgsv3.js";
import { IndexTTS15GenerateAudio, IndexTTS15GenerateAudioCheckEnv } from "./backends/tts/indextts1.5.js";
import { OmniVoiceGenerateAudio, OmniVoiceGenerateAudioCheckEnv } from "./backends/tts/omnivoice.js";
import { Qwen3TTSGenerateAudio, Qwen3TTSGenerateAudioCheckEnv } from "./backends/tts/qwen3-tts.js";
import { VoxCPM2GenerateAudio, VoxCPM2GenerateAudioCheckEnv } from "./backends/tts/voxcpm2.js";
import { OpenAIGenerateAudio, OpenAIGenerateAudioCheckEnv } from "./backends/tts/openai.js";

let WORKFLOW_ID = randomUUID().substring(0, 2);
while(fs.readdirSync(".").find(f => f.startsWith(`WF_${WORKFLOW_ID}`))) {
    WORKFLOW_ID = randomUUID().substring(0, 2);
}

fs.mkdirSync(`WF_${WORKFLOW_ID}`);

process.on("exit", () => {
    if(!(process.env.KEEP_WORKFLOW && process.env.KEEP_WORKFLOW == "true")) fs.rmSync(`WF_${WORKFLOW_ID}`, { recursive: true, force: true });
});

process.on("SIGINT", () => {
    if(!(process.env.KEEP_WORKFLOW && process.env.KEEP_WORKFLOW == "true")) fs.rmSync(`WF_${WORKFLOW_ID}`, { recursive: true, force: true });
    process.exit(0);
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
 * [key: string]: {
 *      run: (text: string, targetDuration: number, outputLang?: string) => Promise<string>,
 *      check: () => boolean
 *  }
 * }}
 */
export let TTS_BACKENDS = {
    "openai": { run: OpenAIGenerateAudio, check: OpenAIGenerateAudioCheckEnv },
    "fish-speech": { run: FishSpeechGenerateAudio, check: FishSpeechGenerateAudioCheckEnv },
    "higgsv3": { run: HiggsV3GenerateAudio, check: HiggsV3GenerateAudioCheckEnv },
    "indextts1.5": { run: IndexTTS15GenerateAudio, check: IndexTTS15GenerateAudioCheckEnv },
    "omnivoice": { run: OmniVoiceGenerateAudio, check: OmniVoiceGenerateAudioCheckEnv },
    "qwen3tts": { run: Qwen3TTSGenerateAudio, check: Qwen3TTSGenerateAudioCheckEnv },
    "voxcpm2": { run: VoxCPM2GenerateAudio, check: VoxCPM2GenerateAudioCheckEnv }
};
