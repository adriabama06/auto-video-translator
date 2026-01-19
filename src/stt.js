import OpenAI from "openai";
import fs from "fs";

/**
 * Transcribes an audio file using OpenAI Whisper
 * @param {string} audioFilePath - Path to the audio file
 * @returns {Promise<OpenAI.Audio.Transcriptions.TranscriptionVerbose | undefined>} - Transcription with timestamps
 */
async function whipserTranscribe(audioFilePath) {
    const client = new OpenAI({
        apiKey: process.env.STT_OPENAI_KEY,
        baseURL: process.env.STT_OPENAI_HOST
    });

    try {
        console.log(`Transcribing file: ${audioFilePath}`);

        const transcription = await client.audio.transcriptions.create({
            file: fs.createReadStream(audioFilePath),
            model: "whisper-1",
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

// Use MIN_WORDS=0 to disable this new algorithm
const MIN_WORDS = process.env.STT_MIN_WORDS ? parseInt(process.env.STT_MIN_WORDS) : 20;
const MIN_SPACE = process.env.STT_MIN_SPACE ? parseInt(process.env.STT_MIN_SPACE) : 0.6;

/**
 * Processes segments to form complete sentences
 * @param {OpenAI.Audio.Transcriptions.TranscriptionSegment[]} segments - Transcription segments
 * @returns {{start: number, end: number, text: string}[]} - Subtitles with complete sentences
 */
export function processSentences(segments) {
    if (segments.length === 0) {
        return [];
    }

    const subtitles = [];

    /**
     * Helper para decidir si debemos forzar la unión con el siguiente segmento ignorando la puntuación actual.
     * @param {number} currentEnd - Final del segmento actual (en segundos)
     * @param {number} nextIdx - Índice del siguiente segmento
     */
    const shouldMergeWithNext = (currentEnd, nextIdx) => {
        if (nextIdx >= segments.length) return false; // No hay siguiente

        const nextSegment = segments[nextIdx];
        
        // Calcular tiempo entre final del actual y comienzo del siguiente
        const timeDiff = nextSegment.start - currentEnd;
        
        // Calcular número de palabras del siguiente segmento
        const wordCount = nextSegment.text.trim().split(/\s+/).length;

        // Condición: Si está cerca Y es corto -> UNIR
        return (timeDiff <= MIN_SPACE && wordCount < MIN_WORDS);
    };

    for (let i = 0; i < segments.length; i++) {
        const currentSegment = segments[i];

        var accumulation = currentSegment.text.trim();

        const hasPunctuation = accumulation.endsWith(".") || accumulation.endsWith("?") || accumulation.endsWith("!");
        const isLastSegment = i + 1 >= segments.length;

        const forceMergeNext = shouldMergeWithNext(currentSegment.end, i + 1);

        // It has already end of sequence.
        if (isLastSegment || (hasPunctuation && !forceMergeNext)) {
            subtitles.push({
                start: currentSegment.start,
                end: currentSegment.end,
                text: accumulation
            });

            continue;
        }

        let forceMergeNextInLoop = forceMergeNext;

        for (let j = i + 1; j < segments.length; j++) {
            const testSegment = segments[j];

            if(!forceMergeNextInLoop) accumulation += (" " + testSegment.text.trim());
            else {
                if(accumulation[accumulation.length - 1] == '.') accumulation = accumulation.substring(0, accumulation.length - 1);

                accumulation += " " + testSegment.text.trim()[0].toLowerCase() + testSegment.text.trim().substring(1);
            }

            const currentHasPunctuation = accumulation.endsWith(".") || accumulation.endsWith("?") || accumulation.endsWith("!");
            const currentIsLast = j + 1 >= segments.length;

            forceMergeNextInLoop = shouldMergeWithNext(testSegment.end, j + 1);

            // It has already end of sequence found.
            if (currentIsLast || (currentHasPunctuation && !forceMergeNextInLoop)) {
                subtitles.push({
                    start: currentSegment.start,
                    end: testSegment.end,
                    text: accumulation
                });

                i = j;

                break;
            }
        }
    }

    return subtitles;
}

/**
 * Converts time in seconds to SRT format (HH:MM:SS,mmm)
 * @param {number} seconds - Time in seconds
 * @returns {string}
 */
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
}

/**
 * Generates SRT content as a string
 * @param {Array} subtitles - Array of subtitles
 * @returns {string} - SRT content
 */
function generateSRTString(subtitles) {
    let srtContent = '';

    subtitles.forEach((subtitle, index) => {
        const startTime = formatTime(subtitle.start);
        const endTime = formatTime(subtitle.end);

        srtContent += `${index + 1}\n`;
        srtContent += `${startTime} --> ${endTime}\n`;
        srtContent += `${subtitle.text}\n\n`;
    });

    return srtContent;
}

/**
 * Generates an SRT file with subtitles
 * @param {Array} subtitles - Array of subtitles
 * @param {string} outputPath - Path to the output file
 */
function generateSRTFile(subtitles, outputPath) {
    const srtContent = generateSRTString(subtitles);
    fs.writeFileSync(outputPath, srtContent, 'utf8');
    console.log(`SRT file generated: ${outputPath}`);
}

/**
 * Main transcription function
 * @param {string} audioFilePath - Path to the audio file
 * @returns {Promise<{start: number, end: number, text: string}[] | undefined>} - Result with subtitles and statistics
 */
export async function transcribeAudio(audioFilePath) {
    {
        // Download model
        const response = await fetch(`${process.env.STT_OPENAI_HOST}/models/whisper-1`, {
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
        const transcription = await whipserTranscribe(audioFilePath);

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
