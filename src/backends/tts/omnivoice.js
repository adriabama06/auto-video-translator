import { getRandomName } from "../../tts.js";
import { Client } from "@gradio/client";
import { readFile } from "fs/promises";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { getDuration, getSpeedFilter } from "../audio.js";

export function OmniVoiceGenerateAudioCheckEnv() {
    let ENV_NOT_SET = [];
    
    for(const KEY of ["TTS_HOST_SAMPLE", "TTS_HOST"]) {
        if(!process.env[KEY]) ENV_NOT_SET.push(KEY);
    }

    if(ENV_NOT_SET.length > 0) {
        ENV_NOT_SET.forEach(KEY => console.log(`${KEY} not set, required by OmniVoiceGenerateAudio`));

        return false;
    }

    return true;
}

let client = null;

/**
 * Makes an inference request to the OmniVoice Gradio API
 * NOTE: MORE LANGUAGES MUST BE ADDED OR USE AUTO MODE
 * Auto mode menas that outputLang is "Auto"
 */
const OmniVoiceInference = async (ref, ref_text, outputLang, text, targetDuration) => {
    if(outputLang == "en") outputLang = "English";
    if(outputLang == "zh") outputLang = "Chinese";
    if(outputLang == "jp") outputLang = "Japanese";
    if(outputLang == "kr") outputLang = "Korean";
    if(outputLang == "de") outputLang = "German";
    if(outputLang == "fr") outputLang = "French";
    if(outputLang == "ru") outputLang = "Russian";
    if(outputLang == "pt") outputLang = "Portuguese";
    if(outputLang == "es") outputLang = "Spanish";
    if(outputLang == "it") outputLang = "Italian";

    if(client == null) client = await Client.connect(process.env.TTS_HOST);
    const result = await client.predict("/_clone_fn", {
		text: text,
		lang: outputLang,
		ref_aud: ref,
		ref_text: ref_text,
		instruct: "",
		ns: 32,
		gs: 2.0,
		dn: true,
		sp: 1.0,
		du: targetDuration, // 0 to disable
		pp: true,
		po: true
    });

    return result.data;
};

/**
 * Generates audio using OmniVoice with voice cloning
 * @param {string} text - Text to synthesize
 * @param {number} targetDuration - Target duration for the audio
 * @param {string} outputLang - Target duration for the audio
 * @returns {Promise<string>} Path to the generated audio file, or empty string on failure
 */
export async function OmniVoiceGenerateAudio(text, targetDuration, outputLang) {
    const randomName = getRandomName();

    const temp_file = randomName + "_temp_" + ".wav";
    const final_file = randomName + ".wav";

    const audioBuffer = await readFile(process.env.TTS_HOST_SAMPLE);
    const audioData = new Blob([audioBuffer], { type: "audio/wav" });

    if(!fs.existsSync(process.env.TTS_HOST_SAMPLE + ".txt")) {
        console.log(`[ERROR] OmniVoice requires a file named sample.wav.txt (Expected file: ${process.env.TTS_HOST_SAMPLE + ".txt"}) with the transcription of the sample audio.`);
        process.exit(0);
    }

    const audioText = fs.readFileSync(process.env.TTS_HOST_SAMPLE + ".txt", "utf-8").toString();

    try {
        const audio = await OmniVoiceInference(audioData, audioText, outputLang, text, targetDuration);
        
        if(!audio[0].url || typeof audio[0].url != "string" || audio[1] != "Done.") throw Error("OmniVoice Gradio server has not return a audio url.");

        const response = await fetch(audio[0].url);
        const arrayBuffer = await response.arrayBuffer();

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
