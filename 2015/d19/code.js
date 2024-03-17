const fs = require("fs");
const readline = require("readline");
const events = require("events");

class CalibrationMachine {
    constructor() {
        this.rules = {};
        this.reverse = {};
    }

    get reverseReplacements() {
        return this.reverse;
    }

    addReplacementRule(head, tail) {
        if (!(head in this.rules)) {
            this.rules[head] = [];
        }

        this.rules[head].push(tail);
        this.reverse[tail] = head;
    }

    *replacementsForHeadAt(molecule, headIdx) {
        const nbCarInHead = Math.max(...Object.keys(this.rules).map((v) => v.length));
        let head = molecule[headIdx];

        let exploreIdx = 0;

        do {
            if (head in this.rules) {
                for (const tail of this.rules[head]) {
                    yield [tail, exploreIdx];
                }
            }
            exploreIdx++;
            head = molecule.slice(headIdx, headIdx + exploreIdx + 1);
        } while (exploreIdx < nbCarInHead);
    }
}

function extractRule(line) {
    const splitted = line.split("=>");

    if (splitted.length !== 2) throw new Error(`${line} is not a correct rule`);

    return { head: splitted[0].trim(), tail: splitted[1].trim() };
}

function getNbAllReplacements(molecule, calibrationMachine) {
    const history = new Set();
    let nbRepl = 0;
    for (let idx = 0; idx < molecule.length; idx++) {
        for (const newHead of calibrationMachine.replacementsForHeadAt(molecule, idx)) {
            const newMolecule = molecule.slice(0, idx) + newHead[0] + molecule.slice(idx + 1 + newHead[1]);
            if (!history.has(newMolecule)) {
                history.add(newMolecule);
                nbRepl++;
            }
        }
    }

    return nbRepl;
}

function randomReverseResearch(molecule, calibrationMachine, maxStep = 1000) {
    const replacements = Object.keys(calibrationMachine.reverseReplacements);

    let nbPerm = 0;
    let step = 0;
    let currMol = molecule;

    while (step < maxStep && currMol !== "e") {
        const alea = Math.floor(Math.random() * replacements.length);
        const rempl = replacements[alea];

        currMol = currMol.replace(rempl, (match) => {
            nbPerm++;
            return calibrationMachine.reverseReplacements[match];
        });

        step++;
    }

    return currMol === "e" ? nbPerm : undefined;
}

function monteCarloSearch(molecule, calibrationMachine, nbIt = 500) {
    let minNbPerm = Infinity;
    for (let it = 0; it < nbIt; it++) {
        const searchRes = randomReverseResearch(molecule, calibrationMachine);
        if (searchRes !== undefined) minNbPerm = Math.min(minNbPerm, searchRes);
    }

    return minNbPerm;
}

(async () => {
    const rl = readline.createInterface(fs.createReadStream("./input.txt"));

    const cal = new CalibrationMachine();
    let calibrationMolecule = "";

    rl.on("line", (line) => {
        if (line.length === 0) return;

        try {
            const rule = extractRule(line);
            cal.addReplacementRule(rule.head, rule.tail);
        } catch (e) {
            calibrationMolecule = line.trim();
        }
    });

    await events.once(rl, "close");

    console.log(`Solution 1 : ${getNbAllReplacements(calibrationMolecule)}`);
    console.log(`Solution 2 : ${monteCarloSearch(calibrationMolecule, cal)}`);
})();
