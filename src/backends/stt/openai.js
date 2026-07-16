import OpenAI from "openai";
import fs from "fs";

import { processSentences } from "../../textprocessor.js";

export function OpenAIGenerateTranscriptionCheckEnv() {
    let ENV_NOT_SET = [];
    
    for(const KEY of ["STT_HOST", "STT_KEY"]) {
        if(!process.env[KEY]) ENV_NOT_SET.push(KEY);
    }

    if(ENV_NOT_SET.length > 0) {
        ENV_NOT_SET.forEach(KEY => console.log(`${KEY} not set, required by OpenAIGenerateTranscription`));

        return false;
    }

    if(!process.env.STT_MODEL) console.log('STT_MODEL not set, by default this code uses "whisper-1"');

    return true;
}

/**
 * Transcribes an audio file using OpenAI Whisper or anyother compatible model
 * @param {string} audioFilePath - Path to the audio file
 * @returns {Promise<OpenAI.Audio.Transcriptions.TranscriptionVerbose | undefined>} - Transcription with timestamps
 */
async function OpenAIInference(audioFilePath) {
    const client = new OpenAI({
        apiKey: process.env.STT_KEY,
        baseURL: process.env.STT_HOST
    });

    try {
        console.log(`Transcribing file: ${audioFilePath}`);

        const transcription = await client.audio.transcriptions.create({
            file: fs.createReadStream(audioFilePath),
            model: process.env.STT_MODEL ?? "whisper-1",
            response_format: "verbose_json",
            timestamp_granularities: ["segment"],
            temperature: 0
        });

        console.log('Transcription completed');
        return transcription;
    } catch (error) {
        console.error('Error transcribing audio:', error);
        return undefined;
    }
}

/**
 * Main transcription function
 * @param {string} audioFilePath - Path to the audio file
 * @returns {Promise<import("../../textprocessor.js").AVTSegment[] | undefined>} - Result with subtitles and statistics
 */
export async function OpenAIGenerateTranscription(audioFilePath) {
    {
        // Download model (speaches) & check model
        const response = await fetch(`${process.env.STT_HOST}/models/${process.env.STT_MODEL ?? "whisper-1"}`, {
            method: "POST"
        });

        const text = await response.text();

        console.log(text);
    }

    try {
        // Validate that the file exists
        if (!fs.existsSync(audioFilePath)) {
            throw new Error(`File does not exist: ${audioFilePath}`);
        }

        // Transcribe audio
        const transcription = await OpenAIInference(audioFilePath);

        if (!transcription) return;

        // Process complete sentences
        const subtitles = processSentences(transcription.segments);

        console.log(`Generated ${subtitles.length} segment`);

        return subtitles;
    } catch (error) {
        console.error('Error in processing:', error);
        throw undefined;
    }
}
