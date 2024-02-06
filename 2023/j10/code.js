const fs = require("fs");
const readline = require("readline");
const events = require("events");

const direction = { LEFT: 1, UP : 2, RIGHT : 3, DOWN : 4 }
const acceptableDir = {
    "|": [direction.DOWN, direction.UP],
    "-": [direction.LEFT, direction.RIGHT],
    "L": [direction.UP, direction.RIGHT],
    "J": [direction.UP, direction.LEFT],
    "7": [direction.DOWN, direction.LEFT],
    "F": [direction.DOWN, direction.RIGHT],
    "S": [direction.DOWN, direction.UP, direction.LEFT, direction.RIGHT]
}

const X = 0;
const Y = 1;
const PIPE_TYPE = 2;
const CNT = 3;

const PIPE = 0;
const GOTO_DIR = 1;

function moveInDir(x, y, dir) {
    switch(dir) {
        case direction.DOWN:
            return [ x, y+1 ];
        case direction.UP:
            return [ x, y-1 ];
        case direction.LEFT:
            return [ x-1, y ];
        case direction.RIGHT:
            return [ x+1, y ];
    }
    return undefined;
}

function getReverseDir(dir) {
    switch(dir) {
        case direction.DOWN:
            return direction.UP;
        case direction.UP:
            return direction.DOWN;
        case direction.LEFT:
            return direction.RIGHT;
        case direction.RIGHT:
            return direction.LEFT;
    }
    return undefined;
}

function getPipeAt(x, y, map) {
    if(!(y in map))
        return undefined

    for(let pipe of map[y]) {
        if(pipe[X] === x)
            return pipe;
    }

    return undefined
}

function setCntOfPipeAt(x, y, cnt, map) {
    if(y in map) {
        for(let pipeIdx in map[y]) {
            if(map[y][pipeIdx][X] === x) {
                map[y][pipeIdx][CNT] = cnt;
                break;
            }
        }
    }
}

function init(start, map) {
    const pipe = getPipeAt(...start, map);

    if(pipe[PIPE_TYPE] !== "S") 
        return undefined;

    const aroundDir = acceptableDir["S"];
    const res = [];

    for(let dir of aroundDir) {
        const newCoord = moveInDir(...start, dir);
        const destPipe = getPipeAt(...newCoord, map);
        const revDir = getReverseDir(dir);
        if(destPipe && acceptableDir[destPipe[PIPE_TYPE]].indexOf(revDir) !== -1) {
            res.push([ destPipe, revDir ]);
        }
    }

    return res;
}

function getNext(pipe, comingDir, map) {
    let newX = pipe[X];
    let newY = pipe[Y];
    let newDir = undefined;
    switch(pipe[PIPE_TYPE]) {
        case "|":
            if(comingDir === direction.UP) {
                newY += 1;
                newDir = direction.UP;
            } else if(comingDir === direction.DOWN) {
                newY -= 1;
                newDir = direction.DOWN;
            }
            break;
        case "-":
            if(comingDir === direction.LEFT) {
                newX += 1;
                newDir = direction.LEFT;
            } else if(comingDir === direction.RIGHT) {
                newX -= 1;
                newDir = direction.RIGHT;
            }
            break;
        case "L":
            if(comingDir === direction.UP) {
                newX += 1;
                newDir = direction.LEFT;
            } else if(comingDir === direction.RIGHT) {
                newY -= 1;
                newDir = direction.DOWN;
            }
            break;
        case "J":
            if(comingDir === direction.UP) {
                newX -= 1;
                newDir = direction.RIGHT;
            } else if(comingDir === direction.LEFT) {
                newY -= 1;
                newDir = direction.DOWN;
            }
            break;
        case "7":
            if(comingDir === direction.DOWN) {
                newX -= 1;
                newDir = direction.RIGHT;
            } else if(comingDir === direction.LEFT) {
                newY += 1;
                newDir = direction.UP;
            }
            break;
        case "F":
            if(comingDir === direction.DOWN) {
                newX += 1;
                newDir = direction.LEFT;
            } else if(comingDir === direction.RIGHT) {
                newY += 1;
                newDir = direction.UP;
            }
            break;
    }

    if(newDir) {
        const newPipe = getPipeAt(newX, newY, map);
        if(newPipe && acceptableDir[newPipe[PIPE_TYPE]].indexOf(newDir) !== -1) {
            return [ newPipe, newDir ];
        }
    }

    return undefined;
}

(async () => {

    const rl = readline.createInterface(fs.createReadStream("./input.txt"));

    const map = {};
    const startPt = [-1, -1];
    let y = 0;

    rl.on("line", line => {
        const mapLine = [];
        let x = 0;

        for(let pipe of line) {
            if(pipe !== ".") {

                if(pipe === "S") {
                    startPt[X]= x;
                    startPt[Y] = y;
                    mapLine.push([x, y, pipe, 0]);
                } else {
                    mapLine.push([x, y, pipe, -1]);
                }
            }

            x++;
        }

        if(mapLine.length !== 0) {
            map[y] = mapLine;    
        }

        y++;
    });

    await events.once(rl, "close");

    let exploreStates = init(startPt, map);
    let step = 1;
    let maxStep = 0;

    let statesToStopExploring = [];

    while(exploreStates.length !== 0) {
        for(let pipeIdx in exploreStates) {
            const pipe = exploreStates[pipeIdx][PIPE];
            const exploreDir = exploreStates[pipeIdx][GOTO_DIR];
            setCntOfPipeAt(pipe[X], pipe[Y], step, map);

            if(pipe[CNT] > maxStep) {
                maxStep = pipe[CNT];
            }

            exploreStates[pipeIdx] = getNext(pipe, exploreDir, map);

            if(exploreStates[pipeIdx][PIPE][CNT] !== -1) {
                statesToStopExploring.push(pipeIdx);
            }
        }

        let cntRm = 0;
        for(let idxToRm of statesToStopExploring) {
            exploreStates.splice(idxToRm - cntRm, 1);
            cntRm++;
        }

        step++;
    }

    console.log(`Solution 1 : ${maxStep}`);

})();

