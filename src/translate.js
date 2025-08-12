import OpenAI from "openai";

/**
 * @param {string} text 
 * @param {string} sourceLanguage 
 * @param {string} targetLanguage 
 * @returns {Promise<string>}
 */
export async function translateTextOpenAI(text, sourceLanguage, targetLanguage) {
    const client = new OpenAI({
        apiKey: process.env.TRANSLATE_OPENAI_KEY,
        baseURL: process.env.TRANSLATE_OPENAI_HOST
    });

    const response = await client.chat.completions.create({
        model: process.env.TRANSLATE_OPENAI_MODEL,
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

/**
 * @param {string} text 
 * @param {string} sourceLanguage 
 * @param {string} targetLanguage 
 * @returns {Promise<string>}
 */
export async function translateText(text, sourceLanguage, targetLanguage) {
    const res = await fetch(`${process.env.RETRANSLATE_HOST}/translate`, {
        method: "POST",
        body: JSON.stringify({
            q: text,
            source: sourceLanguage,
            target: targetLanguage,
            format: "text",
            alternatives: 0,
            api_key: ""
        }),
        headers: { "Content-Type": "application/json" }
    });

    return (await res.json()).translatedText;
}
