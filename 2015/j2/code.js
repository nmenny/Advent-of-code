const fs = require("fs");
const readline = require("readline");
const events = require("events");

function convToInt(line) {
    const lineArr = line.split("x")
    return lineArr.map((v) => { return parseInt(v) })
}

function computeAreas(l, w, h) {
    return [l*w, w*h, h*l]
}

function computePerimeters(l, w, h) {
    return [2*l, 2*w, 2*h]
}

function getWrappingInfo(line) {
    const areas = computeAreas(...convToInt(line))

    // [Total area, extra wrapping paper needed]
    return [areas.reduce((acc, v) => { return acc + 2*v }, 0), Math.min(...areas)]
}

function getRibbonInfo(line) {
    const sizes = convToInt(line)
    const perims = computePerimeters(...sizes)

    // [Total ribbon, extra for box]
    return [
        Math.min(...[perims[0] + perims[1], perims[1] + perims[2], perims[2] + perims[0]]),
        sizes.reduce((acc, v) => { return acc * v })
    ]
}

(async () => {
    try {
        const rl = readline.createInterface({
            input: fs.createReadStream('./input.txt')
        });

        let totalWrapping = 0
        let totalRibbon = 0

        rl.on('line', (line) => {
            const wrappingInfo = getWrappingInfo(line)
            const ribbonInfo = getRibbonInfo(line)
            totalWrapping += wrappingInfo.reduce((acc, v) => { return acc + v })
            totalRibbon += ribbonInfo.reduce((acc, v) => { return acc + v })
        });

        await events.once(rl, 'close');

        console.log(`Solution 1 : ${totalWrapping}`)
        console.log(`Solution 2 : ${totalRibbon}`)

    } catch (err) {
        console.error(err);
    }
})();

