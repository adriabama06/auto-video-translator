import fs from "fs";
import { randomUUID } from "crypto";
import { getDuration } from "./audio.js";
import ffmpeg from "fluent-ffmpeg";
import { getRandomName } from "../tts.js";

/**
 * @param {string} text 
 * @param {number} targetDuration
 * @returns {Promise<string>}
 */
export default async function IndexTTSGenerateAudio(text, targetDuration) {
    const randomName = getRandomName();
  
    const temp_file = randomName + "_temp_" + ".wav";
    const final_file = randomName + ".wav";

    const audioBytes = fs.readFileSync(process.env.CUSTOM_TTS_SAMPLE);
    const audioBase64 = audioBytes.toString("base64");

    let response = await fetch(`${process.env.CUSTOM_TTS}/synthesize`, {
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
            .audioFilters(`atempo=${finalSpeed}`)
            .on("end", resolve)
            .on("error", reject)
            .save(final_file);
    });

    // Cleanup
    fs.unlinkSync(temp_file);

    // All of this process is to make sure that the output time is close to the input audio
    return final_file;
}
