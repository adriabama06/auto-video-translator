export function LibreTranslateCheckEnv() {
    let ENV_NOT_SET = [];
    
    for(const KEY of ["TRANSLATE_HOST"]) {
        if(!process.env[KEY]) ENV_NOT_SET.push(KEY);
    }

    if(ENV_NOT_SET.length > 0) {
        ENV_NOT_SET.forEach(KEY => console.log(`${KEY} not set, required by LibreTranslate`));

        return false;
    }

    return true;
}

/**
 * @param {string} text
 * @param {string} sourceLanguage
 * @param {string} targetLanguage
 * @returns {Promise<string>}
 */
export async function LibreTranslate(text, sourceLanguage, targetLanguage) {
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
