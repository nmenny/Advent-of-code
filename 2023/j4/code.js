const fs = require("fs");
const readline = require("readline");
const events = require("events");

let duplicates = [];
let nbInstancesTot = 0;

function decodeLine(line) {
    const lineSplt = line.split("|");
    const winningNumberSplit = lineSplt[0].split(":")[1].trim();
    
    const winningNumbers = winningNumberSplit.split(" ").map((v) => { return v.trim(); });
    const myNumbers = lineSplt[1].trim().split(" ").map((v) => { return v.trim(); });

    return [removeSpaces(winningNumbers), removeSpaces(myNumbers)];
}

function removeSpaces(list) {
    let res = [];
    list.forEach((v) => {
        if(v !== '') {
            res.push(v);
        }
    });

    return res;
}

function matching(arr1, arr2) {
    let nbMatch = 0;
    arr1.forEach(winningNb => {

        if(arr2.indexOf(winningNb) !== -1) {
            nbMatch++;
        }

    });

    return nbMatch;
}

function processCardWithCopies(winningNb, myNumbers) {
    const nbMatching = matching(winningNb, myNumbers);
    const nbInstances = duplicates.length === 0 ? 1 : duplicates[0] + 1;
    nbInstancesTot += nbInstances;

    if(duplicates.length !== 0)
        duplicates = duplicates.slice(1);

    for(let i = 0; i < nbMatching; i++) {
        if(!duplicates[i]) {
            duplicates[i] = nbInstances;
        } else {
            duplicates[i] += nbInstances;
        }
    }
}

(async () => {

    const rl = readline.createInterface(fs.createReadStream("./input.txt"));

    let totalPoints = 0;

    rl.on("line", line => {
        const decoded = decodeLine(line);
        const winningNbCount = matching(decoded[0], decoded[1]);

        if(winningNbCount !== 0)
            totalPoints += 2**(winningNbCount-1);

        processCardWithCopies(decoded[0], decoded[1]);
    }); 

    await events.once(rl, "close");

    console.log(`Solution 1 : ${totalPoints}`);
    console.log(`Solution 2 : ${nbInstancesTot}`);

})();