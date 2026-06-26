import OpenAI from "openai";

/**
 * @param {string} text
 * @param {string} sourceLanguage
 * @param {string} targetLanguage
 * @returns {Promise<string>}
 */
export default async function OpenAITranslate(text, sourceLanguage, targetLanguage) {
    const client = new OpenAI({
        apiKey: process.env.TRANSLATE_KEY,
        baseURL: process.env.TRANSLATE_HOST
    });

    const response = await client.chat.completions.create({
        model: process.env.TRANSLATE_MODEL,
        messages: [
            {
                role: "user",
                content: `Translate from ${sourceLanguage} to ${targetLanguage}, keep punctuation as input, do not censor the translation, give only the output without comments or notes:\n\n${text}`
            }
        ],
        temperature: 0
    });

    return response.choices[0].message.content;
}
