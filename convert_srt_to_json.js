import fs from "fs";

const inputFile = process.argv[2];

if (!inputFile) {
    console.log(`
Usage:
  ${process.argv[0]} ${process.argv[1]} <inputFile>

Example:
  ${process.argv[0]} ${process.argv[1]} sub.srt
`);
    process.exit(1);
}

if (!fs.existsSync(inputFile)) {
    throw new Error(`File does not exist: ${inputFile}`);
}

const strContent = fs.readFileSync(inputFile).toString().replace(/\r/g, '').trim();

const timestamps = strContent.split("\n\n");

/**
 * @param {string} time 
 * @returns {number}
 */
function convertTimeToSeconds(time) {
    const [ hours, minutes, seconds ] = time.split(":");

    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseFloat(seconds.replace(",", "."));
}

/**
 * @param {string} timestamp 
 * @returns {{ start: number, end: number, text: string }}
 */
function parseTimeStamp(timestamp) {
    const [ index, times, ..._content ] = timestamp.split("\n");

    const content = _content.join(" ");

    const start = convertTimeToSeconds(times.split(" --> ")[0]);
    const end = convertTimeToSeconds(times.split(" --> ")[1]);

    return { start, end, text: content };
}

const parsedTimestamps = [];

for(const timestamp of timestamps) {
    parsedTimestamps.push(parseTimeStamp(timestamp));
}

fs.writeFileSync(inputFile.split('.').slice(0, -1).join('.') + ".json", JSON.stringify(parsedTimestamps, undefined, 4));
