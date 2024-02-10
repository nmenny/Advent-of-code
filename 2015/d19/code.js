const fs = require("fs");
const readline = require("readline");
const events = require("events");

class CalibrationMachine {
    constructor() {
        this.rules = {};
    }

    addReplacementRule(head, tail) {
        if(!(head in this.rules)) {
            this.rules[head] = [];
        }

        this.rules[head].push(tail);
    }

    *replacementsForHeadAt(molecule, headIdx) {
        const nbCarInHead = Math.max(...Object.keys(this.rules).map(v => v.length));
        let head = molecule[headIdx];

        let exploreIdx = 0;

        do {
            if(head in this.rules) {
                for(const tail of this.rules[head]) {
                    yield [tail, exploreIdx];
                }
            }
            exploreIdx++;
            head = molecule.slice(headIdx, headIdx+exploreIdx+1);
        } while(exploreIdx < nbCarInHead);
    }

    *computeAllReplacement(molecule, history = new Set()) {
        for(let idx = 0; idx < molecule.length; idx++) {
            for(const newHead of this.replacementsForHeadAt(molecule, idx)) {
                const newMolecule = molecule.slice(0, idx) + newHead[0] + molecule.slice(idx+1+newHead[1]);
                if(!history.has(newMolecule)) {
                    history.add(newMolecule);
                    yield newMolecule;
                }
            }
        }
    }
}

function extractRule(line) {
    const splitted = line.split("=>");

    if(splitted.length !== 2) throw new Error(`${line} is not a correct rule`);

    return { head: splitted[0].trim(), tail: splitted[1].trim() };
}

function fabricate(molecule, calibrationMachine, maxDepth=1000) {
    const toExplore = ["e"];
    const trace = {"e" : undefined};
    const history = new Set(toExplore);
    let depth = 0;

    while(!history.has(molecule) && depth < maxDepth) {
        depth++;
        const nbNodesToExplore = toExplore.length;

        for(let exploredCnt = 0; exploredCnt < nbNodesToExplore; exploredCnt++) {
            const nodeToExplore = toExplore.shift();
            history.add(nodeToExplore);

            for(let newMolecule of calibrationMachine.computeAllReplacement(nodeToExplore, history)) {
                toExplore.push(newMolecule);
                trace[newMolecule] = nodeToExplore;
            }
        }
    }

    // showTrace(trace, molecule);

    return depth;
}

function showTrace(trace, from) {

    console.log("\n----- Process to make molecule -----");

    let prevNode = from in trace ? trace[from] : undefined;
    const show = [];
    
    show.push(prevNode ? `${prevNode} => ${from}` : `${from}`);
    while(prevNode) {
        const temp = prevNode in trace ? trace[prevNode] : undefined;
        show.push(temp ? `${temp} => ${prevNode}` : `${prevNode}`);
        prevNode = temp;
    }

    for(let showIdx = show.length - 1; showIdx >= 0; showIdx--) {
        console.log(show[showIdx]);
    }

    console.log("\n");
}

(async () => {
    const rl = readline.createInterface(fs.createReadStream("./input.txt"));

    const cal = new CalibrationMachine();
    let calibrationMolecule = "";

    rl.on("line", line => {
        if(line.length === 0) return;
        
        try {
            const rule = extractRule(line);
            cal.addReplacementRule(rule.head, rule.tail);
        }catch(e) {
            calibrationMolecule = line.trim();
        }

    });

    await events.once(rl, "close");

    let nbTotRepl = 0;
    for(const _ of cal.computeAllReplacement(calibrationMolecule)) {
        nbTotRepl++;
    }

    console.log(`Solution 1 : ${nbTotRepl}`);
    console.log(`Solution 2 : ${fabricate(calibrationMolecule, cal)}`);

})();