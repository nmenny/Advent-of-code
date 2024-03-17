const fs = require("fs");
const readline = require("readline");
const events = require("events");

const vowels = "aeiou";
const forbiddenStr = ["ab", "cd", "pq", "xy"];

const NB_MIN_VOWELS = 3;
const NB_MIN_REP = 1;
const NB_MIN_PAIRS = 1;

function isNiceStrV1(str) {
    let isNice = true;

    let nbRep = 0;
    let nbVowels = 0;

    // Check if the string does not contain one of the forbidden string
    isNice &= forbiddenStr.every((forbidden) => {
        return str.indexOf(forbidden) == -1;
    });

    if (!isNice) return false;

    isNice = false;

    for (let carIdx = 0; carIdx < str.length && !isNice; carIdx++) {
        if (vowels.indexOf(str[carIdx]) != -1) nbVowels++;

        if (carIdx < str.length - 1 && str[carIdx] == str[carIdx + 1]) {
            nbRep++;
        }

        isNice |= nbVowels >= NB_MIN_VOWELS && nbRep >= NB_MIN_REP;
    }

    return isNice;
}

function isNiceStrV2(str) {
    let isNice = false;

    let nbRep = 0;
    let nbPair = 0;

    for (let carIdx = 0; carIdx < str.length && !isNice; carIdx++) {
        if (carIdx >= str.length - 2) break;

        if (str[carIdx] == str[carIdx + 2]) {
            nbRep++;
        }

        if (str.indexOf(str[carIdx] + str[carIdx + 1], carIdx + 2) != -1) {
            nbPair++;
        }

        isNice |= nbPair >= NB_MIN_PAIRS && nbRep >= NB_MIN_REP;
    }

    return isNice;
}

(async () => {
    const rl = readline.createInterface({
        input: fs.createReadStream("./input.txt"),
    });

    let nbNice1 = 0;
    let nbNice2 = 0;

    rl.on("line", (line) => {
        nbNice1 += isNiceStrV1(line) ? 1 : 0;
        nbNice2 += isNiceStrV2(line) ? 1 : 0;
    });

    await events.once(rl, "close");

    console.log(`Solution 1 : ${nbNice1}`);
    console.log(`Solution 2 : ${nbNice2}`);
})();
