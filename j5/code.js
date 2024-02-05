const fs = require("fs");

const SRC = 0;
const DEST = 1;
const RANGE = 2;

function extractSeedInfo(seedData) {
    const splt = seedData.split(" ").slice(1);

    return splt.map((v) => { return parseInt(v, 10); });
}

function extractSeedRangeInfo(seedData) {
    const seedInfo = extractSeedInfo(seedData);

    let res = [];
    for(let seedIdx = 0; seedIdx < seedInfo.length; seedIdx += 2) {
        res.push([seedInfo[seedIdx], seedInfo[seedIdx+1]]);
    }  

    return res;
}

function extractMap(mapInfo) {

    const mapFromTo = mapInfo[0].split("-to-");
    const from = mapFromTo[0].trim();
    const to = mapFromTo[1].split(" ")[0].trim();

    let mapping = [];

    for(let mapInfoIdx = 1; mapInfoIdx < mapInfo.length; mapInfoIdx++) {
        const splt = mapInfo[mapInfoIdx].split(" ");

        const destRangeStart = parseInt(splt[0], 10);
        const srcRangeStart = parseInt(splt[1], 10);
        const range = parseInt(splt[2], 10);

        mapping.push([srcRangeStart, destRangeStart, range]);
    }

    return {
        src: from,
        dest: to,
        ranges: mapping,
    }
}

function findSrcInMap(src, maps) {
    for(let map of maps) {
        if(map.src === src) {
            return map;
        }
    }

    return undefined;
}

function getMappingDestValue(map, srcValue) {
    for(let table of map.ranges) {
        if(srcValue >= table[SRC] && srcValue < (table[SRC] + table[RANGE])) {
            return table[DEST] + (srcValue - table[SRC]);
        }
    }

    return srcValue;
}

function find(seeds, maps, dest) {
    let currSrc = "seed";
    let currSrcIds = seeds;

    while(currSrc !== dest) {
        const map = findSrcInMap(currSrc, maps);

        if(!map) {
            break;
        }

        for(let currSrcIdx = 0; currSrcIdx < currSrcIds.length; currSrcIdx++) {
            const currSrcId = currSrcIds[currSrcIdx]
            currSrcIds[currSrcIdx] = getMappingDestValue(map, currSrcId)
        }

        currSrc = map.dest;
    }

    return currSrcIds;
}

function findMinWithSeedRange(seedRanges, maps, dest) {
    let minDest = Infinity;

    for(let seedRange of seedRanges) {
        for(let seedIdx = 0; seedIdx < seedRange[1]; seedIdx++) {
            const currDest = find([seedRange[0] + seedIdx], maps, dest)[0];
            if(minDest > currDest) {
                minDest = currDest;
            }
        }
    }

    return minDest;
}

fs.readFile("./input.txt", "utf8", (err, data) => {

    if(err) {
        throw err;
    }

    let datasplt = data.split("\n").filter(d => d.length > 0);

    const dataMaps = [];
    let idxSplt = 0;

    while((idxSplt = datasplt.indexOf('')) !== -1) {
        dataMaps.push(datasplt.splice(0, idxSplt++));
        datasplt.splice(0, 1); // removes the trailing space
    }

    dataMaps.push(datasplt);

    const seeds = extractSeedInfo(dataMaps[0][0]);

    const maps = [];

    for(let dataMapIdx = 1; dataMapIdx < dataMaps.length; dataMapIdx++) {
        maps.push(extractMap(dataMaps[dataMapIdx]));
    }

    const locs = find(seeds, maps, "location");

    console.log(`Solution 1 : ${Math.min(...locs)}`);

    // --

    const seedRanges = extractSeedRangeInfo(dataMaps[0][0]);

    console.log(`Solution 2 : ${findMinWithSeedRange(seedRanges, maps, "location")}`);

});