import { OpenAITranslate, OpenAITranslateCheckEnv } from "./backends/translate/openai.js";
import { LibreTranslate, LibreTranslateCheckEnv } from "./backends/translate/libre.js";

/**
 * @type {{
 * [key: string]: {
 *      run: (text: string, sourceLanguage: string, targetLanguage: string) => Promise<string>,
 *      check: () => boolean
 *  }
 * }}
 */
export let TRANSLATE_BACKENDS = {
    "openai": { run: OpenAITranslate, check: () => OpenAITranslateCheckEnv },
    "libre": { run: LibreTranslate, check: () => LibreTranslateCheckEnv }
};
