import { getRandomName } from "../../tts.js";
import { readFile } from "fs/promises";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { getDuration, getSpeedFilter } from "../audio.js";

export function HiggsV3GenerateAudioCheckEnv() {
    let ENV_NOT_SET = [];
    
    for(const KEY of ["TTS_SAMPLE", "TTS_HOST"]) {
        if(!process.env[KEY]) ENV_NOT_SET.push(KEY);
    }

    if(ENV_NOT_SET.length > 0) {
        ENV_NOT_SET.forEach(KEY => console.log(`${KEY} not set, required by HiggsV3GenerateAudio`));

        return false;
    }

    if(!process.env.TTS_KEY) console.log('TTS_KEY not set, by default this code uses "-"');

    return true;
}

const HiggsV3Inference = async (ref, ref_text, text) => {
    const response = await fetch(`${process.env.TTS_HOST}/v1/audio/speech`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.TTS_KEY ?? "-"}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "bosonai/higgs-audio-v3-tts-4b",
            input: text,
            response_format: "wav",
            ref_audio: ref,
            ref_text: ref_text,
            max_new_tokens: 2048
        })
    });

    if (!response.ok) {
        console.log(await response.text());
        process.exit(0);
    }

    return await response.arrayBuffer();
};

/**
 * Generates audio using VoxCPM2 via vLLM-Omni with voice cloning
 * @param {string} text - Text to synthesize
 * @param {number} targetDuration - Target duration for the audio
 * @param {string} outputLang - Target duration for the audio
 * @returns {Promise<string>} Path to the generated audio file, or empty string on failure
 */
export async function HiggsV3GenerateAudio(text, targetDuration, outputLang) {
    const randomName = getRandomName();

    const temp_file = randomName + "_temp_" + ".wav";
    const final_file = randomName + ".wav";

    const audioBuffer = await readFile(process.env.TTS_SAMPLE);
    const audioBase64 = audioBuffer.toString("base64");
    const refAudioDataUrl = `data:audio/wav;base64,${audioBase64}`;

    if(!fs.existsSync(process.env.TTS_SAMPLE + ".txt")) {
        console.log(`[ERROR] Is recommended to use a file named sample.wav.txt (Expected file: ${process.env.TTS_SAMPLE + ".txt"}) with the transcription of the sample audio.`);
        process.exit(0);
    }

    const audioText = fs.readFileSync(process.env.TTS_SAMPLE + ".txt", "utf-8").toString();

    try {
        const arrayBuffer = await HiggsV3Inference(refAudioDataUrl, audioText, text);

        fs.writeFileSync(temp_file, Buffer.from(arrayBuffer));

        const duration_temp = await getDuration(temp_file);

        let finalSpeed = duration_temp / targetDuration;

        // Fix atempo limits
        if (finalSpeed < 0.5) {
            finalSpeed = 0.5;
        }
        if (finalSpeed > 2) { // This is in really 100, but I prefer silence time than a high speed up
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
        fs.unlinkSync(temp_file);

        // All of this process is to make sure that the output time is close to the input audio
        return final_file;
    } catch (err) {
        console.log(err);

        return "";
    }
};
