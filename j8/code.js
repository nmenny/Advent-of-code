const fs = require("fs");
const readline = require("readline");
const events = require("events");

function processString(str) {
    let currNbCar = 1;
    let currNbInMemCar = 0;
    let nbCarEncoded = 6;

    while(currNbCar < str.length-1) {
        const currCar = str[currNbCar++];

        if(["\\", "\""].indexOf(currCar) !== -1) {
            nbCarEncoded += 2;
            const nextCar = str[currNbCar++];
            if(nextCar == 'x') {
                nbCarEncoded += 2
                currNbCar += 2
            } else if(nextCar == '\\' || nextCar == '\"') {
                nbCarEncoded++;
            }
        }

        nbCarEncoded++;
        currNbInMemCar++;
    }

    return [str.length, currNbInMemCar, nbCarEncoded]
}

(async () => {

    const rl = readline.createInterface({ input: fs.createReadStream("./input.txt") });

    let nbTotCar = 0;
    let nbTotCarInMem = 0;
    let nbTotCarEncoded = 0;

    rl.on("line", (line) => {
        const res = processString(line);
        nbTotCar += res[0];
        nbTotCarInMem += res[1];
        nbTotCarEncoded += res[2];
    });

    await events.once(rl, "close");

    console.log(`Solution 1 : ${nbTotCar - nbTotCarInMem}`)
    console.log(`Solution 2 : ${nbTotCarEncoded - nbTotCar}`)

})();