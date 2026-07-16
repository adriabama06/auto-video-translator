import { STT_BACKENDS } from "./stt.js";
import { TRANSLATE_BACKENDS } from "./translate.js";
import { TTS_BACKENDS } from "./tts.js";

export function checkEnv() {
    const stt_backend = process.env["STT_BACKEND"];
    const tts_backend = process.env["TTS_BACKEND"];
    const translate_backend = process.env["TRANSLATE_BACKEND"];

    if(stt_backend) {
        if(!STT_BACKENDS[stt_backend]) {
            console.log(`${stt_backend} is not a valid backend, please set STT_BACKEND to any of:`);
            Object.keys(STT_BACKENDS).forEach(k => console.log(` - ${k}`));
            process.exit(0);
        }

        if(!STT_BACKENDS[stt_backend].check()) process.exit(0);
    }

    if(tts_backend) {
        if(!TTS_BACKENDS[tts_backend]) {
            console.log(`${tts_backend} is not a valid backend, please set TTS_BACKEND to any of:`);
            Object.keys(TTS_BACKENDS).forEach(k => console.log(` - ${k}`));
            process.exit(0);
        }

        if(!TTS_BACKENDS[tts_backend].check()) process.exit(0);
    }

    if(translate_backend) {
        if(!TRANSLATE_BACKENDS[translate_backend]) {
            console.log(`${translate_backend} is not a valid backend, please set TRANSLATE_BACKEND to any of:`);
            Object.keys(TRANSLATE_BACKENDS).forEach(k => console.log(` - ${k}`));
            process.exit(0);
        }

        if(!TRANSLATE_BACKENDS[translate_backend].check()) process.exit(0);
    }

    if(!tts_backend) {
        console.log("TTS Backend is required to work");

        process.exit(0);
    }
}
