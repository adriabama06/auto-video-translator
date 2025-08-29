import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { randomUUID } from "crypto";
import { getDuration } from "./audio.js";

/**
 * @typedef {Object} FishSpeechReferenceAudio
 * @property {string} audio - Base64 encoded audio data
 * @property {string} text - Transcript of the reference audio
 */

/**
 * @typedef {Object} FishSpeechData
 * @property {string} text - Text to synthesize
 * @property {FishSpeechReferenceAudio[]} [references] - Reference audios for voice cloning
 * @property {string} [reference_id] - ID of a previously used reference
 * @property {"wav"|"mp3"|"flac"} format - Audio format for output
 * @property {number} max_new_tokens - Maximum number of tokens to generate
 * @property {number} chunk_length - Length of audio chunks
 * @property {number} top_p - Nucleus sampling parameter
 * @property {number} repetition_penalty - Penalty for repeated tokens
 * @property {number} temperature - Sampling temperature
 * @property {boolean} streaming - Whether to stream the response
 * @property {"on"|"off"} use_memory_cache - Whether to use memory cache
 * @property {boolean} normalize - Whether to normalize audio
 * @property {number|undefined} seed - Random seed for generation
 */

/**
 * Creates a default FishSpeechData object with default values
 * @returns {FishSpeechData} Default FishSpeechData object
 */
const FishSpeechDataDefault = () => ({
    text: "",
    format: "wav",
    max_new_tokens: 1024,
    chunk_length: 300,
    top_p: 0.8,
    repetition_penalty: 1.1,
    temperature: 0.8,
    streaming: false,
    use_memory_cache: "off",
    normalize: true,
    seed: undefined
});

/**
 * Makes an inference request to the FishSpeech API
 * @param {FishSpeechData} data - The data to send to the API
 * @returns {Promise<ArrayBuffer>} The audio data as ArrayBuffer
 */
const FishSpeechInference = async (data) => {
    const response = await fetch(`${process.env.CUSTOM_TTS}/v1/tts`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.TTS_OPENAI_KEY ?? "-"}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        console.log(await response.text());
        process.exit(0);
    }

    return await response.arrayBuffer();
};

/**
 * Generates audio using FishSpeech with voice cloning
 * @param {string} text - Text to synthesize
 * @param {number} targetDuration - Target duration for the audio
 * @returns {Promise<string>} Path to the generated audio file, or empty string on failure
 */
export default async function FishSpeechGenerateAudio(text, targetDuration) {
    const temp_file = randomUUID() + ".wav";
    const final_file = randomUUID() + ".wav";

    const audioBuffer = fs.readFileSync(process.env.CUSTOM_TTS_SAMPLE);
    const audioData = audioBuffer.toString("base64");

    if(!fs.existsSync(process.env.CUSTOM_TTS_SAMPLE + ".txt")) {
        console.log(`[ERROR] FishSpeech requires a file named sample.wav.txt (Expected file: ${process.env.CUSTOM_TTS_SAMPLE + ".txt"}) with the transcription of the sample audio.`);
        process.exit(0);
    }

    const audioText = fs.readFileSync(process.env.CUSTOM_TTS_SAMPLE + ".txt", "utf-8").toString();

    /**
     * @type {FishSpeechData}
     */
    const data = {
        ...FishSpeechDataDefault(),
        text: text.trim(),
        references: [
            {
                audio: audioData,
                text: audioText
            }
        ],
        format: "wav"
    };

    try {
        const audio = await FishSpeechInference(data);

        fs.writeFileSync(temp_file, Buffer.from(audio));

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
