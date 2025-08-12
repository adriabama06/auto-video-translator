import { processSentences, transcribeAudio } from "./stt.js";
import { translateText, translateTextOpenAI } from "./translate.js";
import { textToSpeech } from "./tts.js";
import { spawn } from "child_process";
import fs from "fs";

const inputFile = process.argv[2];
const inputLang = process.argv[3];
const outputLang = process.argv[4];

if (!inputFile || !inputLang || !outputLang) {
    console.log(`
Usage:
  ${process.argv[0]} ${process.argv[1]} <inputFile> <inputLang> <outputLang>

Example:
  ${process.argv[0]} ${process.argv[1]} test.wav en es
`);
    process.exit(1);
}

if (!fs.existsSync(inputFile)) {
    throw new Error(`File does not exist: ${inputFile}`);
}

/**
 * @type {{ start: number, end: number, text: string }[]}
 */
let res;

if(inputFile.endsWith("json")) {
    console.log(`Reading ${inputFile}...`);
    res = JSON.parse(fs.readFileSync(inputFile).toString());

    res = processSentences(res);
} else {
    console.log(`Converting ${inputFile} to text...`);
    res = await transcribeAudio(inputFile);
}

if(inputLang !== "skip") {
    console.log(`Translating audio from ${inputLang} to ${outputLang}`);
    for (const segment of res) {
        if(process.env.TRANSLATE_OPENAI_KEY) {
            segment.text = await translateTextOpenAI(segment.text, inputLang, outputLang);
        } else {
            segment.text = await translateText(segment.text, inputLang, outputLang);
        }
    }
} else {
    console.log(`Skip translating`);
}

/**
 * @type {string[]}
 */
const audios = [];

console.log("Converting text to audio");
for (const segment of res) {
    const targetTime = segment.end - segment.start;

    const file = await textToSpeech(segment.text, targetTime);

    audios.push(file);
}

/**
 * @type {string[]}
 */
const args = [];

for (const audio of audios) { args.push("-i", audio); }

const filters = [];

// Aplicar efectos
for (let i = 0; i < res.length; i++) {
    const segment = res[i];

    const ms = segment.start * 1000; // seconds to ms

    filters.push(`[${i}:a]adelay=${ms}|${ms}[a${i}]`); // aplica efecto y pon identificador [a1], [a2], [a3], ...
}

// Convectar todos los audios en uno solo
const inputLabels = audios.map((_, i) => `[a${i}]`).join(""); // Crea los identificadores [a1], [a2], [a3], ... Para unirlos todos en uno solo [out]
filters.push(`${inputLabels}amix=inputs=${audios.length}:duration=longest:dropout_transition=0:normalize=0[out]`);

args.push(
    "-filter_complex", filters.join(";"),
    "-map", "[out]",   // especifica el audio de salida
    "-ac", "1",        // ya es mono, pero esto lo garantiza
    "-ar", "24000",    // mantener 24 kHz
    "-c:a", "pcm_s16le", // salida en PCM 16-bit
    "-y", `${inputFile.split('.').slice(0, -1).join('.') + "_" + outputLang + ".wav"}`
);

const ff = spawn("ffmpeg", args);

ff.stderr.on("data", (d) => {
    // ffmpeg escribe progreso en stderr; descomenta si quieres ver logs
    // console.log(String(d));
});

ff.on("error", (err) => console.error(err));
ff.on("close", (code) => {
    // Clear files
    audios.forEach(f => fs.unlinkSync(f));

    if (code === 0) console.log(`Join complete, file ready at: ${inputFile.split('.').slice(0, -1).join('.') + "_" + outputLang + ".wav"}`);
    else console.error(new Error(`[${code}] Error on join audio files`));
});
