const fs = require("fs");
const readline = require("readline");
const events = require("events");

const sueSendsGift = {
    children: 3,
    cats: 7,
    samoyeds: 2,
    pomeranians: 3,
    akitas: 0,
    vizslas: 0,
    goldfish: 5,
    trees: 3,
    cars: 2,
    perfumes: 1
}

class MFCSAM {
    constructor() {
        this.searchInfo = {};
    }

    defineSearchData(autSueInfo) {
        this.searchInfo = autSueInfo;
    }

    isCompliant(autSueInfo) {
        for(const autSueCaract in autSueInfo) {
            if(autSueInfo[autSueCaract] !== this.searchInfo[autSueCaract])
                return false
        }

        return true;
    }

    isCompliantV2(autSueInfo) {
        for(const autSueCaract in autSueInfo) {
            let isOk = false;
            switch(autSueCaract) {
                case "cats":
                case "trees":
                    isOk = autSueInfo[autSueCaract] > this.searchInfo[autSueCaract];
                    break;
                case "pomeranians":
                case "goldfish":
                    isOk = autSueInfo[autSueCaract] < this.searchInfo[autSueCaract];
                    break;
                default:
                    isOk = autSueInfo[autSueCaract] === this.searchInfo[autSueCaract];
            }

            if(!isOk) return false
        }

        return true;
    }
}

function extractData(line) {
    const whichSue = line.slice(0, line.indexOf(":"));
    const sueCaracteristics = line.slice(line.indexOf(":")+1);
    
    const convertedData = {};
    for(const caract of sueCaracteristics.split(",")) {
        const splittedCaract = caract.split(":");
        convertedData[splittedCaract[0].trim()] = parseInt(splittedCaract[1]);
    }

    return [parseInt(whichSue.split(" ")[1]), convertedData];
}

(async () => {
    const rl = readline.createInterface({ input: fs.createReadStream("./input.txt") });
    const dataExtractor = new MFCSAM();
    dataExtractor.defineSearchData(sueSendsGift);

    rl.on("line", (line) => {
        if(line.length === 0) return;

        const autSueInfo = extractData(line);

        if(dataExtractor.isCompliant(autSueInfo[1])) {
            console.log(`Solution 1 : ${autSueInfo[0]}`);
        }

        if(dataExtractor.isCompliantV2(autSueInfo[1])) {
            console.log(`Solution 2 : ${autSueInfo[0]}`);
        }

    });

    await events.once(rl, "close");
})();