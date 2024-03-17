const fs = require("fs");

const inputTxt = fs.readFileSync("./input.txt");

const gameStart = inputTxt.toString().split("\n")[0];
const NB_TURN_V1 = 40;
const NB_TURN_V2 = 50;

let gameString1 = gameStart;

function nextSequence(val) {
    let newSeq = "";
    let uniqueCarSeq = "";

    for (let car of val) {
        if (uniqueCarSeq.length === 0) {
            uniqueCarSeq = car;
            continue;
        }

        if (car !== uniqueCarSeq[0]) {
            newSeq += `${uniqueCarSeq.length}${uniqueCarSeq[0]}`;
            uniqueCarSeq = car;
        } else {
            uniqueCarSeq += car;
        }
    }

    if (uniqueCarSeq.length !== 0) newSeq += `${uniqueCarSeq.length}${uniqueCarSeq[0]}`;

    return newSeq;
}

for (let turn = 1; turn <= NB_TURN_V1; turn++) {
    gameString1 = nextSequence(gameString1);
}

let gameString2 = gameStart;

for (let turn = 1; turn <= NB_TURN_V2; turn++) {
    gameString2 = nextSequence(gameString2);
}

console.log(`Solution 1 : ${gameString1.length}`);
console.log(`Solution 2 : ${gameString2.length}`);
