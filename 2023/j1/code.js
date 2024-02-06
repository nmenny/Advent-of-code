const fs = require("fs");
const readline = require("readline");
const events = require("events");

const numberStr = {
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9,
}

function getFirstAndLastNumberV1(str)  {
    const res = [-1, -1];

    for(let carIdx = 0; carIdx < str.length; carIdx += 1) {
        const car = str[carIdx];
        const carInt = parseInt(car, 10);

        // If the caractere is a number
        if(!isNaN(carInt)) {
            if(res[0] === -1) {
                res[0] = carInt;
            }

            res[1] = carInt;
        }
    }

    return res;
}

function getFirstAndLastNumberV2(str)  {
    const res = [-1, -1];

    for(let carIdx = 0; carIdx < str.length; carIdx += 1) {
        const car = str[carIdx];
        const carInt = parseInt(car, 10);

        // If the caractere is a number
        if(!isNaN(carInt)) {
            if(res[0] === -1) {
                res[0] = carInt;
            }

            res[1] = carInt;
        } else {

            for(nStr in numberStr) {
                if(str.slice(carIdx).indexOf(nStr) == 0) {
                    
                    if(res[0] === -1) {
                        res[0] = numberStr[nStr];
                    }
        
                    res[1] = numberStr[nStr];
                    break;
                }
            }
        }
    }

    return res;
}

(async () => {

    try {

        const rl = readline.createInterface({ input: fs.createReadStream("./input.txt") });

        let allCalibrationValuesV1 = 0;
        let allCalibrationValuesV2 = 0;

        rl.on("line", (line) => {
            const calibrationValuesV1 = getFirstAndLastNumberV1(line);
            allCalibrationValuesV1 += calibrationValuesV1.reduce((acc, v) => { return acc * 10 + v; });

            const calibrationValuesV2 = getFirstAndLastNumberV2(line);
            allCalibrationValuesV2 += calibrationValuesV2.reduce((acc, v) => { return acc * 10 + v; });
        });

        await events.once(rl, "close");

        console.log(`Solution 1 : ${allCalibrationValuesV1}`);
        console.log(`Solution 2 : ${allCalibrationValuesV2}`);

    } catch(err) {
        console.error(err);
    }

})();