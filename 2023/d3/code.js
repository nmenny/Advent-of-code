const fs = require("fs");
const readline = require("readline");
const events = require("events");

// List of indexes used in the arrays

// For numbers
const VALUE = 0;
const Y = 1;
const Xs = 2;

// For symbols
const X = 0;
const CAR = 2;
const NB_ADJACENT = 3;
const PROD_NB_ADJACENT = 4;

class DataProcessor {
    constructor() {
        this.sumPartNb = 0;
        this.sumGears = 0;
        this.currY = -1;
        this.symbols = [];
        this.numbers = [];
    }

    processLine(line) {
        this.currY++;
        let number = [0, -1, []];
        for (let currX in line) {
            const car = line[currX];
            if (car === ".") {
                if (number[Xs].length !== 0) {
                    this.numbers.push(number);
                    number = [0, -1, []];
                }
                continue;
            }

            const carInt = parseInt(car, 10);
            if (!isNaN(carInt)) {
                number[VALUE] = number[0] * 10 + carInt;
                number[Y] = this.currY;
                number[Xs].push(parseInt(currX, 10));
            } else {
                if (number[Xs].length !== 0) {
                    this.numbers.push(number);
                    number = [0, -1, []];
                }
                this.symbols.push([parseInt(currX, 10), this.currY, car, 0, 1]);
            }
        }

        if (number[Xs].length !== 0) {
            this.numbers.push(number);
        }

        this.checkAroundNumbers();
    }

    checkAroundNumbers() {
        this.emptyUnusedLines();

        for (let sbIdx in this.symbols) {
            const adjacentNumbersIdx = this.checkAroundSymbolAt(sbIdx);

            for (let nbIdx of adjacentNumbersIdx) {
                this.sumPartNb += this.numbers[nbIdx][VALUE];
            }

            this.removeNumbersIn(adjacentNumbersIdx);
        }
    }

    checkAroundSymbolAt(idxSymb) {
        if (idxSymb < 0 || idxSymb >= this.symbols.length) {
            return [];
        }

        let adjacentNbIdx = [];
        const symb = this.symbols[idxSymb];
        const symbX = symb[X];
        const symbY = symb[Y];
        for (let y of [symbY - 1, symbY, symbY + 1]) {
            if (y < 0) continue;

            for (let x of [symbX - 1, symbX, symbX + 1]) {
                if (x < 0 || (y == symbY && x == symbX)) continue;

                const nbAtXY = this.numberAt(x, y);
                if (nbAtXY !== -1 && adjacentNbIdx.indexOf(nbAtXY) === -1) {
                    this.symbols[idxSymb][NB_ADJACENT]++;
                    this.symbols[idxSymb][PROD_NB_ADJACENT] *= this.numbers[nbAtXY][VALUE];
                    adjacentNbIdx.push(nbAtXY);
                }
            }
        }

        return adjacentNbIdx;
    }

    numberAt(x, y) {
        for (let nbIdx in this.numbers) {
            if (this.numbers[nbIdx][Y] == y && this.numbers[nbIdx][Xs].indexOf(x) !== -1) {
                return parseInt(nbIdx, 10);
            }
        }
        return -1;
    }

    // Just keep in memory two lines - the current one and the one above
    emptyUnusedLines() {
        const ym = this.currY - 1;
        let nbIdxToRm = [];
        let sbIdxToRm = [];

        for (let nbIdx in this.numbers) {
            if (this.numbers[nbIdx][Y] < ym) {
                nbIdxToRm.push(nbIdx);
            }
        }

        for (let sbIdx in this.symbols) {
            if (this.symbols[sbIdx][Y] < ym) {
                if (this.symbols[sbIdx][CAR] === "*" && this.symbols[sbIdx][NB_ADJACENT] === 2) {
                    this.sumGears += this.symbols[sbIdx][PROD_NB_ADJACENT];
                }
                sbIdxToRm.push(sbIdx);
            }
        }

        this.removeNumbersIn(nbIdxToRm);

        this.removeSymbolsIn(sbIdxToRm);
    }

    computeRestOfLinesForGearsRatio() {
        for (let sbIdx in this.symbols) {
            if (this.symbols[sbIdx][CAR] === "*" && this.symbols[sbIdx][NB_ADJACENT] === 2) {
                this.sumGears += this.symbols[sbIdx][PROD_NB_ADJACENT];
            }
        }
    }

    removeNumbersIn(numbersToRmIdx) {
        this.removeFromList(this.numbers, numbersToRmIdx);
    }

    removeSymbolsIn(symbolsToRmIdx) {
        this.removeFromList(this.symbols, symbolsToRmIdx);
    }

    removeFromList(list, idxToRm) {
        let nbRm = 0;
        for (let snToRm of idxToRm) {
            list.splice(snToRm - nbRm, 1);
            nbRm++;
        }
    }

    toString() {
        return [this.numbers, this.symbols];
    }

    print() {
        console.log("Numbers :");
        for (let nb of this.numbers) {
            console.log(nb);
        }

        console.log("Symbols :");
        for (let sb of this.symbols) {
            console.log(sb);
        }
    }
}

(async () => {
    const rl = readline.createInterface(fs.createReadStream("./input.txt"));

    const dp = new DataProcessor();

    rl.on("line", (line) => {
        dp.processLine(line);
    });

    await events.once(rl, "close");

    dp.computeRestOfLinesForGearsRatio();

    console.log(`Solution 1 : ${dp.sumPartNb}`);
    console.log(`Solution 2 : ${dp.sumGears}`);
})();
