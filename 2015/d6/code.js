const fs = require("fs");
const readline = require("readline");
const events = require("events");

const instructions = {
    "turn on": turnOnLights,
    "turn off": turnOffLights,
    toggle: toggleLights,
};

const instructionsV2 = {
    "turn on": turnOnLightsV2,
    "turn off": turnOffLightsV2,
    toggle: toggleLightsV2,
};

function turnOnLights(lights, tlCorner, brCorner) {
    for (let y = tlCorner[1]; y <= brCorner[1]; y++) {
        lights[y].fill(true, tlCorner[0], brCorner[0] + 1);
    }
}

function turnOffLights(lights, tlCorner, brCorner) {
    for (let y = tlCorner[1]; y <= brCorner[1]; y++) {
        lights[y].fill(false, tlCorner[0], brCorner[0] + 1);
    }
}

function toggleLights(lights, tlCorner, brCorner) {
    for (let y = tlCorner[1]; y <= brCorner[1]; y++) {
        for (let x = tlCorner[0]; x <= brCorner[0]; x++) {
            lights[y][x] ^= true;
        }
    }
}

function countNbLightsOn(lights) {
    return lights.reduce((acc, col) => {
        return (
            acc +
            col.reduce((acc2, lg) => {
                return acc2 + (lg ? 1 : 0);
            }, 0)
        );
    }, 0);
}

function turnOnLightsV2(lights, tlCorner, brCorner) {
    for (let y = tlCorner[1]; y <= brCorner[1]; y++) {
        for (let x = tlCorner[0]; x <= brCorner[0]; x++) {
            lights[y][x]++;
        }
    }
}

function turnOffLightsV2(lights, tlCorner, brCorner) {
    for (let y = tlCorner[1]; y <= brCorner[1]; y++) {
        for (let x = tlCorner[0]; x <= brCorner[0]; x++) {
            lights[y][x] = lights[y][x] == 0 ? lights[y][x] : lights[y][x] - 1;
        }
    }
}

function toggleLightsV2(lights, tlCorner, brCorner) {
    for (let y = tlCorner[1]; y <= brCorner[1]; y++) {
        for (let x = tlCorner[0]; x <= brCorner[0]; x++) {
            lights[y][x] += 2;
        }
    }
}

function countBrightness(lights) {
    return lights.reduce((acc, col) => {
        return (
            acc +
            col.reduce((acc2, lg) => {
                return acc2 + lg;
            })
        );
    }, 0);
}

(async () => {
    const lights = new Array(1000);
    const lightsV2 = new Array(1000);

    for (let idx = 0; idx < lights.length; idx++) {
        lights[idx] = new Array(1000).fill(false);
        lightsV2[idx] = new Array(1000).fill(0);
    }

    const rl = readline.createInterface({
        input: fs.createReadStream("./input.txt"),
    });

    rl.on("line", (line) => {
        for (const key of Object.getOwnPropertyNames(instructions)) {
            if (line.indexOf(key) != -1) {
                const coords = line.slice(key.length).split("through");

                const intCoords = coords.map((coord) => {
                    return coord.split(",").map((compo) => {
                        return parseInt(compo, 10);
                    });
                });

                instructions[key](lights, intCoords[0], intCoords[1]);
                instructionsV2[key](lightsV2, intCoords[0], intCoords[1]);

                break;
            }
        }
    });

    await events.once(rl, "close");

    console.log(`Solution 1 : ${countNbLightsOn(lights)}`);
    console.log(`Solution 2 : ${countBrightness(lightsV2)}`);
})();
