import OpenAI from "openai";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { randomUUID } from "crypto";
import { getDuration } from "./backends/audio.js";

import IndexTTSGenerateAudio from "./backends/indextts.js";
import FishSpeechGenerateAudio from "./backends/fish-speech.js";

let WORKFLOW_ID = randomUUID().substring(0, 2);
while(fs.readdirSync(".").find(f => f.startsWith(`tts_tmp_${WORKFLOW_ID}_`))) {
    WORKFLOW_ID = randomUUID().substring(0, 2);
}
fs.writeFileSync("tts_tmp_" + WORKFLOW_ID + "_init", "");

process.on("exit", () => {
    const files = fs.readdirSync(".").filter(f => f.startsWith(`tts_tmp_${WORKFLOW_ID}_`));
    for(const file of files) {
        fs.unlinkSync(file);
    }
});


/**
 * @returns {string} Unique name
 */
export function getRandomName() {
    const PREFIX = `tts_tmp_${WORKFLOW_ID}_`;
    let count = 0;

    const files = fs.readdirSync(".").filter(f => f.startsWith(PREFIX));

    while(files.find(f => f.replace(".wav", '') == `${PREFIX}${count}`)) {
        count++;
    }

    return `${PREFIX}${count}`;
}

/**
 * @param {string} text 
 * @param {number} targetDuration
 * @returns {Promise<string>}
 */
export async function textToSpeechOpenAI(text, targetDuration) {
    const client = new OpenAI({
        apiKey: process.env.TTS_OPENAI_KEY,
        baseURL: process.env.TTS_OPENAI_HOST
    });

    const randomName = getRandomName();

    const test_file = randomName + "_test_" + ".wav";
    const temp_file = randomName + "_temp_" + ".wav";
    const final_file = randomName + ".wav";

    let response = await client.audio.speech.create({
        model: "tts-1",
        voice: process.env.TTS_OPENAI_VOICE,
        input: text,
        response_format: "wav"
    });

    fs.writeFileSync(test_file, Buffer.from(await response.arrayBuffer()));

    const duration_test = await getDuration(test_file);

    const newSpeed = duration_test ? duration_test / targetDuration : 1;

    response = await client.audio.speech.create({
        model: "tts-1",
        voice: process.env.TTS_OPENAI_VOICE,
        input: text,
        response_format: "wav",
        speed: newSpeed.toFixed(2)
    });

    fs.writeFileSync(temp_file, Buffer.from(await response.arrayBuffer()));

    const duration_temp = await getDuration(temp_file);

    let finalSpeed = duration_temp / targetDuration;

    // Fix atempo limits
    if(finalSpeed < 0.5) {
        finalSpeed = 0.5;
    }
    if(finalSpeed > 2) { // This is in really 100, but I prefer silence time than a high speed up
        finalSpeed = 2;
    }

    await new Promise((resolve, reject) => {
        ffmpeg(temp_file)
            .audioFilters(`atempo=${finalSpeed}`)
            .on("end", resolve)
            .on("error", reject)
            .save(final_file);
    });

    // Cleanup
    fs.unlinkSync(test_file);
    fs.unlinkSync(temp_file);

    // All of this process is to make sure that the output time is close to the input audio
    return final_file;
}

export {
    IndexTTSGenerateAudio,
    FishSpeechGenerateAudio
};
