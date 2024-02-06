const fs = require("fs");
const readline = require("readline");
const events = require("events");

const MAX_RED = 12;
const MAX_GREEN = 13;
const MAX_BLUE = 14;

function getGameId(line) {
    return parseInt(line.split(":")[0].slice("Game".length+1), 10);
}

function extractCubeInfo(cubeData) {
    const cubeSplitted = cubeData.trim().split(" ");
    return [parseInt(cubeSplitted[0], 10), cubeSplitted[1]];
}

function isPossibleGame(line) {
    let isPossible = true;
    const gameData = line.split(":")[1].trim().split(";");

    for(let gameSetId = 0; gameSetId < gameData.length && isPossible; gameSetId++) {
        const gameSet = gameData[gameSetId];
        const cubeData = gameSet.trim().split(",");

        for(let cubeDataIdx = 0; cubeDataIdx < cubeData.length && isPossible; cubeDataIdx++) {
            const cubeInfo = extractCubeInfo(cubeData[cubeDataIdx]);
            switch(cubeInfo[1]) {
                case "green":
                    if(cubeInfo[0] > MAX_GREEN)
                        isPossible = false;
                break;
                case "red":
                    if(cubeInfo[0] > MAX_RED)
                        isPossible = false;
                break;
                case "blue":
                    if(cubeInfo[0] > MAX_BLUE)
                        isPossible = false;
            }
        }
    }

    return isPossible
}

function getPowerOfGame(line) {
    const minNbCubes = { red: 0, blue: 0, green: 0 };

    const gameData = line.split(":")[1].trim().split(";");
    for(let gameSet of gameData) {
        for(let cubeData of gameSet.trim().split(",")) {
            const cubeInfo = extractCubeInfo(cubeData);

            const color = cubeInfo[1];
            const coloredCubeCnt = cubeInfo[0];

            if(minNbCubes[color] < coloredCubeCnt)
                minNbCubes[color] = coloredCubeCnt;
        }
    }

    return Object.values(minNbCubes).reduce((acc, count) => { return acc * count; });
}

(async () => {

    const rl = readline.createInterface({ input: fs.createReadStream("./input.txt") });

    let possibleGamesCount = 0;
    let allPower = 0;

    rl.on("line", (line) => {
        if(isPossibleGame(line)) 
            possibleGamesCount += getGameId(line);

        allPower += getPowerOfGame(line);
    });

    await events.once(rl, "close");

    console.log(`Solution 1 : ${possibleGamesCount}`);
    console.log(`Solution 2 : ${allPower}`);

})();