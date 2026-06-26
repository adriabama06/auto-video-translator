import OpenAIGenerateTranscription from "./backends/stt/openai.js";

/**
 * @type {{
 * [key: string]: (audioFilePath: string) => Promise<import("./textprocessor.js").AVTSegment[] | undefined>
 * }}
 */
export let STT_BACKENDS = {
    "openai": OpenAIGenerateTranscription
};
