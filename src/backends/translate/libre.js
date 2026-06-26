/**
 * @param {string} text
 * @param {string} sourceLanguage
 * @param {string} targetLanguage
 * @returns {Promise<string>}
 */
export default async function LibreTranslate(text, sourceLanguage, targetLanguage) {
    const res = await fetch(`${process.env.TRANSLATE_HOST}/translate`, {
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
