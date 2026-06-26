/**
 * @typedef {{start: number, end: number, text: string}} AVTSegment
 */

// Use MIN_WORDS=0 to disable this new algorithm
const MIN_WORDS = process.env.STT_MIN_WORDS ? parseInt(process.env.STT_MIN_WORDS) : 20;
// Use MAX_WORDS=999999 to disable this new algorithm
const MAX_WORDS = process.env.STT_MAX_WORDS ? parseInt(process.env.STT_MAX_WORDS) : 80;
const MIN_SPACE = process.env.STT_MIN_SPACE ? parseInt(process.env.STT_MIN_SPACE) : 0.6;

/**
 * Processes segments to form complete sentences
 * @param {OpenAI.Audio.Transcriptions.TranscriptionSegment[]} segments - Transcription segments
 * @returns {AVTSegment[]} - Subtitles with complete sentences
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

            if (!forceMergeNextInLoop) accumulation += (" " + testSegment.text.trim());
            else {
                if (accumulation[accumulation.length - 1] == '.') accumulation = accumulation.substring(0, accumulation.length - 1);

                accumulation += " " + testSegment.text.trim()[0].toLowerCase() + testSegment.text.trim().substring(1);
            }

            const currentHasPunctuation = accumulation.endsWith(".") || accumulation.endsWith("?") || accumulation.endsWith("!");
            const currentIsLast = j + 1 >= segments.length;
            const wordsCount = accumulation.trim().split(/\s+/).length;

            forceMergeNextInLoop = shouldMergeWithNext(testSegment.end, j + 1);

            // It has already end of sequence found.
            if (currentIsLast || (currentHasPunctuation && !forceMergeNextInLoop) || wordsCount >= MAX_WORDS) {
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
