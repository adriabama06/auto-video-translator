import ffmpeg from "fluent-ffmpeg";

/**
 * @param {string} path 
 * @returns {Promise<number | undefined>}
 */
export async function getDuration(path) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(path, (err, metadata) => {
            if (err) return reject(err);
            resolve(metadata.format.duration);
        });
    });
}

/**
 * @param {number} speed
 * @returns {string}
 */
export function getSpeedFilter(speed) {
    const effect = process.env.FFMPEG_SPEED_EFFECT;
    if (effect === "rubberband") {
        return `rubberband=tempo=${speed}`;
    }
    return `atempo=${speed}`;
}
