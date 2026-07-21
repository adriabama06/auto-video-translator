import fs from "fs";
import { randomUUID } from "crypto";
import { getDuration, getSpeedFilter } from "../audio.js";
import ffmpeg from "fluent-ffmpeg";
import { getRandomName } from "../../tts.js";

export function IndexTTS15GenerateAudioCheckEnv() {
    let ENV_NOT_SET = [];
    
    for(const KEY of ["TTS_SAMPLE", "TTS_HOST"]) {
        if(!process.env[KEY]) ENV_NOT_SET.push(KEY);
    }

    if(ENV_NOT_SET.length > 0) {
        ENV_NOT_SET.forEach(KEY => console.log(`${KEY} not set, required by IndexTTS15GenerateAudio`));

        return false;
    }

    return true;
}

/**
 * @param {string} text 
 * @param {number} targetDuration
 * @returns {Promise<string>}
 */
export async function IndexTTS15GenerateAudio(text, targetDuration) {
    const randomName = getRandomName();
  
    const temp_file = randomName + "_temp_" + ".wav";
    const final_file = randomName + ".wav";

    const audioBytes = fs.readFileSync(process.env.TTS_SAMPLE);
    const audioBase64 = audioBytes.toString("base64");

    let response = await fetch(`${process.env.TTS_HOST}/synthesize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_base64: audioBase64,
        text: text
      }),
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`Server error (${response.status}): ${txt}`);
    }

    const json = await response.json();
    if (!json.output_audio_base64) throw new Error("No audio in the response");

    fs.writeFileSync(temp_file, Buffer.from(json.output_audio_base64, "base64"));

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
    fs.unlinkSync(temp_file);

    // All of this process is to make sure that the output time is close to the input audio
    return final_file;
}
