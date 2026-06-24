import { getRandomName } from "../tts.js";
import { Client } from "@gradio/client";
import { readFile } from "fs/promises";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { getDuration } from "./audio.js";

let client = null;

/**
 * Makes an inference request to the Qwen3-TTS Gradio API
 * Remember: Use --temperature 0 --subtalker-temperature 0 for consistent results
 * NOTE: MORE LANGUAGES MUST BE ADDED OR USE AUTO MODE
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

    if(client == null) client = await Client.connect(process.env.CUSTOM_TTS);
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
 * Generates audio using Qwen3-TTS with voice cloning
 * @param {string} text - Text to synthesize
 * @param {number} targetDuration - Target duration for the audio
 * @param {string} outputLang - Target duration for the audio
 * @returns {Promise<string>} Path to the generated audio file, or empty string on failure
 */
export default async function OmniVoiceGenerateAudio(text, targetDuration, outputLang) {
    const randomName = getRandomName();

    const temp_file = randomName + "_temp_" + ".wav";
    const final_file = randomName + ".wav";

    const audioBuffer = await readFile(process.env.CUSTOM_TTS_SAMPLE);
    const audioData = new Blob([audioBuffer], { type: "audio/wav" });

    if(!fs.existsSync(process.env.CUSTOM_TTS_SAMPLE + ".txt")) {
        console.log(`[ERROR] Qwen3-TTS requires a file named sample.wav.txt (Expected file: ${process.env.CUSTOM_TTS_SAMPLE + ".txt"}) with the transcription of the sample audio.`);
        process.exit(0);
    }

    const audioText = fs.readFileSync(process.env.CUSTOM_TTS_SAMPLE + ".txt", "utf-8").toString();

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
                .audioFilters(`atempo=${finalSpeed}`)
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
