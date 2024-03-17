const fs = require("fs");

const NB_STEPS = 100;
const ON = "#";
const OFF = ".";

function incorrectCoords(lightsMap, lightX, lightY) {
    return lightY < 0 || lightY >= lightsMap.length || lightX < 0 || lightX >= lightsMap[lightY].length;
}

function isInCorner(lightsMap, lightX, lightY) {
    return (
        (lightX === 0 && lightY === 0) ||
        (lightX === 0 && lightY === lightsMap.length - 1) ||
        (lightX === lightsMap[lightY].length - 1 && lightY === 0) ||
        (lightX === lightsMap[lightY].length - 1 && lightY === lightsMap.length - 1)
    );
}

function getOnNeighbours(lightsMap, lightX, lightY) {
    if (incorrectCoords(lightsMap, lightX, lightY)) {
        return -1;
    }

    let nbOnNeighbours = 0;

    for (let y = lightY - 1; y <= lightY + 1; y++) {
        if (y < 0 || y >= lightsMap.length) continue;
        for (let x = lightX - 1; x <= lightX + 1; x++) {
            if (x < 0 || x >= lightsMap[y].length) continue;
            if (x === lightX && y === lightY) continue;

            nbOnNeighbours += lightsMap[y][x] === ON ? 1 : 0;
        }
    }

    return nbOnNeighbours;
}

function toggleLight(lightsMap, lightX, lightY) {
    if (incorrectCoords(lightsMap, lightX, lightY)) {
        return;
    }

    if (lightsMap[lightY][lightX] === ON) lightsMap[lightY][lightX] = OFF;
    else lightsMap[lightY][lightX] = ON;
}

function toggleAll(lightsMap, whichToToggle) {
    for (let toggler of whichToToggle) {
        toggleLight(lightsMap, toggler[0], toggler[1]);
    }
}

function toggleAllV2(lightsMap, whichToToggle) {
    for (let toggler of whichToToggle) {
        if (isInCorner(lightsMap, toggler[0], toggler[1])) continue;
        toggleLight(lightsMap, toggler[0], toggler[1]);
    }
}

function nextStep(lightsMap) {
    const whichToToggle = [];

    for (let lightY = 0; lightY < lightsMap.length; lightY++) {
        for (let lightX = 0; lightX < lightsMap[lightY].length; lightX++) {
            const nbOnNeighbours = getOnNeighbours(lightsMap, lightX, lightY);

            if (lightsMap[lightY][lightX] === ON && nbOnNeighbours !== 2 && nbOnNeighbours !== 3) {
                whichToToggle.push([lightX, lightY]);
            } else if (lightsMap[lightY][lightX] === OFF && nbOnNeighbours === 3) {
                whichToToggle.push([lightX, lightY]);
            }
        }
    }

    return whichToToggle;
}

function getNbLightsOn(lightsMap) {
    return lightsMap
        .map((v) =>
            v.reduce((acc, v) => {
                if (v === ON) return acc + 1;
                return acc;
            }, 0)
        )
        .reduce((acc, v) => acc + v);
}

fs.readFile("./input.txt", (err, data) => {
    if (err) throw err;

    const lightsMap = data
        .toString()
        .split("\n")
        .map((v) => v.split(""))
        .filter((line) => line.length > 0);
    const lightsMapV2 = JSON.parse(JSON.stringify(lightsMap));

    for (let currStep = 1; currStep <= NB_STEPS; currStep++) {
        const whichToggle = nextStep(lightsMap);
        const whichToggleV2 = nextStep(lightsMapV2);
        toggleAll(lightsMap, whichToggle);
        toggleAllV2(lightsMapV2, whichToggleV2);
    }

    console.log(`Solution 1 : ${getNbLightsOn(lightsMap)}`);
    console.log(`Solution 2 : ${getNbLightsOn(lightsMapV2)}`);
});
