const fs = require("fs");

const inputTxt = fs.readFileSync("./input.txt");

String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

String.prototype.getSequenceFrom = function(index) {
    if(index < 0 || index >= this.length) {
        return [];
    }

    let seq = this.charAt(index);
    let seqIdx = 1;

    while(isNextCar(seq[seqIdx-1], this.charAt(index + seqIdx))) {
        seq += this.charAt(index + seqIdx);
        seqIdx++;
    }

    return seq;
}


const lastCharCode = "z".charCodeAt(0) + 1;
const charCodeA = "a".charCodeAt(0);
const FORBIDDEN_CAR = ["i", "l", "o"];

const PSD = inputTxt.toString().split("\n")[0];

function isNextCar(car, nextCar) {
    let newCarCode = (car.charCodeAt(0) + 1) % lastCharCode;
    return nextCar.charCodeAt(0) === newCarCode;
}

function incrementCar(car) {
    let ret = false;
    let newCarCode = (car.charCodeAt(0) + 1) % lastCharCode;
    if(newCarCode === 0) {
        ret = true;
        newCarCode = charCodeA;
    }
    let newCar = String.fromCharCode(newCarCode)

    return [newCar, ret]
}

function incrementStringOpti(str) {
    let repStr = incrementString(str);

    for(let forbidden of FORBIDDEN_CAR) {
        let forbiddenIdx = repStr.indexOf(forbidden)
        while(forbiddenIdx !== -1) {
            repStr = incrementString(repStr, forbiddenIdx);

            // When increment at forbiddenIdx, fills the rest of the string with "a"
            repStr = repStr.slice(0, forbiddenIdx+1);
            for(let carIdx = forbiddenIdx+1; carIdx < str.length; carIdx++) {
                repStr += "a";
            }

            forbiddenIdx = repStr.indexOf(forbidden);
        }
    }

    return repStr;
}

function incrementString(str, at = -1) {
    let repStr = str;
    let idxCarIncr = at === -1 ? str.length - 1 : at;

    let propagate = false;

    do {
        const incrCar = incrementCar(repStr[idxCarIncr]);
        repStr = repStr.replaceAt(idxCarIncr, incrCar[0]);

        idxCarIncr--;
        propagate = incrCar[1];
    } while(propagate && idxCarIncr >= 0);

    return repStr;
}

function checkRequirements(str) {
    for(let forbidden of FORBIDDEN_CAR) {
        if(str.indexOf(forbidden) !== -1) {
            return false;
        }
    }

    let nbPairs = 0;
    let seq3Letters = 0;
    let prevCar = ""

    for(let carIdx = 0; carIdx < str.length - 1; carIdx++) {
        if(str[carIdx] === str[carIdx + 1] && str[carIdx] !== prevCar) {
            nbPairs++;
        }

        if(str.getSequenceFrom(carIdx).length >= 3) {
            seq3Letters++;
        }

        if(nbPairs >= 2 && seq3Letters >= 1) {
            break;
        }

        prevCar = str[carIdx] ;
    }

    return nbPairs >= 2 && seq3Letters >= 1;
}

let psd = PSD;

while(!checkRequirements(psd)) {
    psd = incrementStringOpti(psd);
}

console.log(`Solution 1 : '${psd}'`);

// ---

psd = incrementStringOpti(psd);

while(!checkRequirements(psd)) {
    psd = incrementStringOpti(psd);
}

console.log(`Solution 2 : '${psd}'`);