import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import OpenAI from "openai";

import { getRandomName } from "../../tts.js";
import { getDuration, getSpeedFilter } from "../audio.js";

export function OpenAIGenerateAudioCheckEnv() {
    let ENV_NOT_SET = [];
    
    for(const KEY of ["TTS_HOST", "TTS_VOICE"]) {
        if(!process.env[KEY]) ENV_NOT_SET.push(KEY);
    }

    if(ENV_NOT_SET.length > 0) {
        ENV_NOT_SET.forEach(KEY => console.log(`${KEY} not set, required by OpenAIGenerateAudio`));

        return false;
    }

    if(!process.env.TTS_KEY) console.log('TTS_KEY not set, by default this code uses "-"');

    return true;
}

/**
 * @param {string} text 
 * @param {number} targetDuration
 * @returns {Promise<string>}
 */
export async function OpenAIGenerateAudio(text, targetDuration) {
    const client = new OpenAI({
        apiKey: process.env.TTS_KEY ?? "-",
        baseURL: process.env.TTS_HOST
    });

    const randomName = getRandomName();

    const test_file = randomName + "_test_" + ".wav";
    const temp_file = randomName + "_temp_" + ".wav";
    const final_file = randomName + ".wav";

    let response = await client.audio.speech.create({
        model: "tts-1",
        voice: process.env.TTS_VOICE,
        input: text,
        response_format: "wav"
    });

    fs.writeFileSync(test_file, Buffer.from(await response.arrayBuffer()));

    const duration_test = await getDuration(test_file);

    const newSpeed = duration_test ? duration_test / targetDuration : 1;

    response = await client.audio.speech.create({
        model: "tts-1",
        voice: process.env.TTS_VOICE,
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
            .audioFilters(getSpeedFilter(finalSpeed))
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
