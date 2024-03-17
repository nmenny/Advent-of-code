const fs = require("fs");

function convertToIntArr(arr) {
    const res = [];
    for (let value of arr) {
        if (value !== "") {
            res.push(parseInt(value, 10));
        }
    }
    return res;
}

function computeNbWaysToWin(times, distances) {
    const nbWaysToWinPerRace = [];

    for (let race in times) {
        const tmax = times[race];
        const dmax = distances[race];
        let cntOver = 0;
        let overDist = false;
        for (let t = 1; t <= tmax; t++) {
            const d = t * (tmax - t);

            // The formula is a parabola, so when it start decreasing it is not useful to continue
            if (d < dmax && overDist) {
                break;
            }

            if (d > dmax) {
                overDist = true;
                cntOver++;
            }
        }

        nbWaysToWinPerRace.push(cntOver);
    }

    return nbWaysToWinPerRace;
}

fs.readFile("./input.txt", "utf8", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    const dataSplit = data.split("\n");

    // -----------------------------
    // Version 1

    const times = convertToIntArr(dataSplit[0].split(":")[1].trim().split(" "));
    const distances = convertToIntArr(dataSplit[1].split(":")[1].trim().split(" "));

    const nbWaysToWinPerRace = computeNbWaysToWin(times, distances);

    console.log(
        `Solution 1 : ${nbWaysToWinPerRace.reduce((acc, v) => {
            return acc * v;
        })}`
    );

    // ------------
    // Version 2

    const singleTime = parseInt(
        times.reduce((acc, v) => {
            return acc + "" + v;
        }),
        10
    );
    const singleDist = parseInt(
        distances.reduce((acc, v) => {
            return acc + "" + v;
        }),
        10
    );

    const nbWaysToWin = computeNbWaysToWin([singleTime], [singleDist]);

    console.log(`Solution 2 : ${nbWaysToWin[0]}`);
});
