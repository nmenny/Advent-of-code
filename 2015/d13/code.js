const fs = require("fs");
const readline = require("readline");
const events = require("events");

function getArrangement(arr) {

    if(arr.length === 0) {
        return [[]];
    }

    return arr.flatMap(x => {
        return getArrangement(arr.filter(v => {
            return v !== x;
        })).map(v => { 
            return [x, ...v] 
        });
    });
}

class Table {
    constructor() {
        this.invited = {}
    }

    addInvited(invitedName) {
        if(!(invitedName in this.invited)) {
            this.invited[invitedName] = {}
        }
    }

    addHappinessInfluence(invited, happinessGain, nextTo) {
        if(!(invited in this.invited)) {
            this.addInvited(invited);
        }
        this.invited[invited][nextTo] = happinessGain;
    }

    allTablePossible() {
        const arr = getArrangement(Object.keys(this.invited));

        const happiness = [];

        for(let oneArr of arr) {
            happiness.push(this.checkHappiness(oneArr));
        }

        return [arr, happiness];
    }

    checkHappiness(arr) {
        let happiness = 0;

        for(let arrIdx = 0; arrIdx < arr.length; arrIdx++) {
            happiness += this.happinessLevel(arr[arrIdx], arr[(arrIdx + 1) % arr.length]);
        }

        return happiness;
    }

    happinessLevel(invited1, invited2) {
        return this.invited[invited1][invited2] + this.invited[invited2][invited1];
    }

    tableWithBestHappiness() {
        const allTable = this.allTablePossible();

        let idxBest = 0;
        for(let hapIdx = 0; hapIdx < allTable[1].length; hapIdx++) {
            if(allTable[1][hapIdx] > allTable[1][idxBest]) {
                idxBest = hapIdx;
            }
        }

        return [allTable[0][idxBest], allTable[1][idxBest]];
    }
}

function decode(line) {
    const lineSplit = line.split(" ");

    const invited1 = lineSplit[0];
    let invited2 = lineSplit[lineSplit.length - 1];
    invited2 = invited2.slice(0, invited2.length-1);

    const gainOrLose = lineSplit[2];
    let happiness = parseInt(lineSplit[3], 10);

    if(gainOrLose === "lose") {
        happiness *= -1;
    }

    return [invited1, happiness, invited2];
}

(async () => {

    const rl = readline.createInterface({ input: fs.createReadStream("./input.txt") });

    const table = new Table();

    rl.on("line", (line) => {
        const decodedLine = decode(line);

        if(line.length === 0) {
            return;
        }

        table.addHappinessInfluence(...decodedLine);
    });

    await events.once(rl, "close");

    console.log(`Solution 1 : ${table.tableWithBestHappiness()}`);

    // ---

    for(const invited in table.invited) {
        if(invited === "Me") continue;
        const strOtherGain = `${invited} would gain 0 happiness units by sitting next to Me.`;
        const strMyGain = `Me would gain 0 happiness units by sitting next to ${invited}.`;

        for(const str of [strOtherGain, strMyGain]) {
            const decodedLine = decode(str);
    
            table.addHappinessInfluence(...decodedLine);
        }
    }

    console.log(`Solution 2 : ${table.tableWithBestHappiness()}`);

})();