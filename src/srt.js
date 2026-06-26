import fs from "fs";

/**
 * Converts time in seconds to SRT format (HH:MM:SS,mmm)
 * @param {number} seconds - Time in seconds
 * @returns {string}
 */
export function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
}

/**
 * Generates SRT content as a string
 * @param {import("./textprocessor.js").AVTSegment[]} subtitles - Array of subtitles
 * @returns {string} - SRT content
 */
export function generateSRTString(subtitles) {
    let srtContent = '';

    subtitles.forEach((subtitle, index) => {
        const startTime = formatTime(subtitle.start);
        const endTime = formatTime(subtitle.end);

        srtContent += `${index + 1}\n`;
        srtContent += `${startTime} --> ${endTime}\n`;
        srtContent += `${subtitle.text}\n\n`;
    });

    return srtContent;
}

/**
 * Generates an SRT file with subtitles
 * @param {import("./textprocessor.js").AVTSegment[]} subtitles - Array of subtitles
 * @param {string} outputPath - Path to the output file
 */
export function generateSRTFile(subtitles, outputPath) {
    const srtContent = generateSRTString(subtitles);
    fs.writeFileSync(outputPath, srtContent, 'utf8');
    console.log(`SRT file generated: ${outputPath}`);
}
