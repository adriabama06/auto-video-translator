import fs from "fs";

const inputFile = process.argv[2];

if (!inputFile) {
    console.log(`
Usage:
  ${process.argv[0]} ${process.argv[1]} <inputFile>

Example:
  ${process.argv[0]} ${process.argv[1]} sub.json
`);
    process.exit(1);
}

if (!fs.existsSync(inputFile)) {
    throw new Error(`File does not exist: ${inputFile}`);
}

/**
  * @type {{ start: number, end: number, text: string }[]}
  */
const data = JSON.parse(fs.readFileSync(inputFile).toString());

const outputStream = fs.createWriteStream(inputFile + ".srt");

for (let i = 0; i < data.length; i++) {
    const segment = data[i];

    const start_hours = Math.floor(segment.start / 3600);
    const start_minutes = Math.floor((segment.start - (start_hours * 3600)) / 60);
    const start_seconds = segment.start - (start_hours * 3600) - (start_minutes * 60);

    const end_hours = Math.floor(segment.end / 3600);
    const end_minutes = Math.floor((segment.end - (end_hours * 3600)) / 60);
    const end_seconds = segment.end - (end_hours * 3600) - (end_minutes * 60);

    const pad2 = n => n.toString().padStart(2, '0');

    const content = `${i + 1}\n`
    + `${pad2(start_hours)}:${pad2(start_minutes)}:${start_seconds.toFixed(3).replace('.', ',')} --> ${pad2(end_hours)}:${pad2(end_minutes)}:${end_seconds.toFixed(3).replace('.', ',')}\n`
    + segment.text + "\n\n";

    outputStream.write(content);
}

outputStream.write("\n");

outputStream.close();
