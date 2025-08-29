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
