import { processSentences } from "../src/stt.js";

const test_sequence_in_multiple_lines = [
    {
        "start": 0.25,
        "end": 4.12,
        "text": "Este será el audio de prueba que voy a estar usando durante todo el desarrollo"
    },
    {
        "start": 6.35,
        "end": 5,
        "text": "para ver si consigo hacer que"
    },
    {
        "start": 5.1,
        "end": 9.94,
        "text": "funcione el programa o no lo consigo."
    },
    {
        "start": 10.82,
        "end": 12.341,
        "text": "Yo solo espero. Que funcione de verdad."
    }
];

console.log(
    processSentences(test_sequence_in_multiple_lines)
);

const test_dots = [
    {
        "start": 0.25,
        "end": 4.12,
        "text": "Este será el audio de prueba que voy... A estar usando durante todo el desarrollo"
    },
    {
        "start": 6.35,
        "end": 9.94,
        "text": "para ver si consigo hacer que funcione el programa o no lo consigo."
    },
    {
        "start": 10.82,
        "end": 12.341,
        "text": "Yo solo espero. Que funcione de verdad."
    }
];

console.log(
    processSentences(test_dots)
);

const test_dots_in_multiples_sentences = [
    {
        "start": 0.25,
        "end": 4.12,
        "text": "Este será el audio de prueba que voy a estar usando durante todo el desarrollo"
    },
    {
        "start": 6.35,
        "end": 9.94,
        "text": "para ver si consigo hacer que... funcione el programa o no lo consigo."
    },
    {
        "start": 10.82,
        "end": 12.341,
        "text": "Yo solo espero. Que funcione de verdad."
    }
];

console.log(
    processSentences(test_dots_in_multiples_sentences)
);