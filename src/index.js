import { STT_BACKENDS } from "./stt.js";
import { TRANSLATE_BACKENDS } from "./translate.js";
import { TTS_BACKENDS } from "./tts.js";
import { spawn } from "child_process";
import fs from "fs";
import { TimeLog } from "./timelog.js";
import { loadArgs } from "./args.js";
import { checkEnv } from "./envcheck.js";

async function main() {
    const inputFile = process.argv[2];
    const inputLang = process.argv[3];
    const outputLang = process.argv[4];
    
    loadArgs();

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

    checkEnv();

    /**
     * @type {import("./textprocessor.js").AVTSegment[]}
     */
    let res;

    if (inputFile.endsWith("json")) {
        console.log(`Reading ${inputFile}...`);
        res = JSON.parse(fs.readFileSync(inputFile).toString());
    } else {
        console.log(`Converting ${inputFile} to text...`);
        res = await STT_BACKENDS[process.env.STT_BACKEND].run(inputFile);
    }

    if (inputLang !== "skip") {
        console.log(`Translating audio from ${inputLang} to ${outputLang}`);
        const translateLog = new TimeLog(res.length);
        for (const segment of res) {
            segment.text = await TRANSLATE_BACKENDS[process.env.TRANSLATE_BACKEND].run(segment.text, inputLang, outputLang);
            translateLog.next();
        }
    } else {
        console.log(`Skip translating`);
    }

    /**
     * @type {string[]}
     */
    const audios = [];

    console.log("Converting text to audio");
    const ttsLog = new TimeLog(res.length);
    for (const segment of res) {
        const targetTime = segment.end - segment.start;

        let file = await TTS_BACKENDS[process.env.TTS_BACKEND].run(segment.text, targetTime, outputLang);

        audios.push(file);
        ttsLog.next();
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
        "-y", process.env.OUTPUT ?? `${inputFile.split('.').slice(0, -1).join('.') + "_" + outputLang + ".wav"}`
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

        if (code === 0) console.log(`Join complete, file ready at: ${process.env.OUTPUT ?? inputFile.split('.').slice(0, -1).join('.') + "_" + outputLang + ".wav"}`);
        else console.error(new Error(`[${code}] Error on join audio files`));
    });
}

/* Now await is not allowed on top-level */
main();
