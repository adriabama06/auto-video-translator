import OpenAITranslate from "./backends/translate/openai.js";
import LibreTranslate from "./backends/translate/libre.js";

/**
 * @type {{
 * [key: string]: (text: string, sourceLanguage: string, targetLanguage: string) => Promise<string>
 * }}
 */
export let TRANSLATE_BACKENDS = {
    "openai": OpenAITranslate,
    "libre": LibreTranslate
};
