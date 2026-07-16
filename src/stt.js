import { OpenAIGenerateTranscription, OpenAIGenerateTranscriptionCheckEnv } from "./backends/stt/openai.js";

/**
 * @type {{
 * [key: string]: {
 *      run: (audioFilePath: string) => Promise<import("./textprocessor.js").AVTSegment[] | undefined>,
 *      check: () => boolean
 *  }
 * }}
 */
export let STT_BACKENDS = {
    "openai": { run: OpenAIGenerateTranscription, check: OpenAIGenerateTranscriptionCheckEnv }
};
