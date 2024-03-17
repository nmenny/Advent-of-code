const fs = require("fs");
const readline = require("readline");
const events = require("events");

class Travel {
    allPaths;

    constructor() {
        this.allPaths = {};
        this.processed = undefined;
    }

    addPath(from, to, dist) {
        if (!(from in this.allPaths)) {
            this.allPaths[from] = {};
        }

        this.allPaths[from][to] = dist;

        if (!(to in this.allPaths)) {
            this.allPaths[to] = {};
        }

        this.allPaths[to][from] = dist;
    }

    toString() {
        return this.allPaths;
    }

    getAllPossiblePath() {
        if (this.processed !== undefined) {
            return this.processed;
        }
        let res = [];
        let dists = [];

        for (let from in this.allPaths) {
            const v = this.getAllPossiblePathRec(from);
            const toStr = v[0].join(" ").split(from);
            let idx = 0;

            for (let path of toStr) {
                res.push([from].concat(path.trim().split(" ")));
                dists.push(v[1][idx]);
                idx++;
            }
        }

        this.processed = [res, dists];

        return this.processed;
    }

    printAllPossiblePath() {
        const pathInfo = this.getAllPossiblePath();
        const paths = pathInfo[0];
        const dist = pathInfo[1];

        for (let pathIdx in paths) {
            printPath(paths[pathIdx], dist[pathIdx]);
        }
    }

    getShortestPath() {
        const pathInfo = this.getAllPossiblePath();
        const paths = pathInfo[0];
        const dist = pathInfo[1];

        let idxMin = 0;

        for (let pathIdx in dist) {
            if (dist[pathIdx] < dist[idxMin]) {
                idxMin = pathIdx;
            }
        }

        return [paths[idxMin], dist[idxMin]];
    }

    getLongestPath() {
        const pathInfo = this.getAllPossiblePath();
        const paths = pathInfo[0];
        const dist = pathInfo[1];

        let idxMax = 0;

        for (let pathIdx in dist) {
            if (dist[pathIdx] > dist[idxMax]) {
                idxMax = pathIdx;
            }
        }

        return [paths[idxMax], dist[idxMax]];
    }

    getAllPossiblePathRec(explore, alreadyWent = [], sumDist = 0) {
        let res = [];
        let distRes = [];
        let explored = false;

        for (let dest in this.allPaths[explore]) {
            if (alreadyWent.concat([explore]).indexOf(dest) === -1) {
                explored = true;
                const ret = this.getAllPossiblePathRec(
                    dest,
                    alreadyWent.concat([explore]),
                    sumDist + this.allPaths[explore][dest]
                );

                res = res.concat(ret[0]);
                distRes = distRes.concat(ret[1]);
            }
        }

        if (!explored) {
            return [alreadyWent.concat([explore]), [sumDist]];
        }

        return [res, distRes];
    }
}

function printPath(path) {
    console.log(path[0].join(" -> "), ":", path[1]);
}

(async () => {
    const rl = readline.createInterface({
        input: fs.createReadStream("./input.txt"),
    });

    const travel = new Travel();

    rl.on("line", (line) => {
        const lineArr = line.split(" ");
        travel.addPath(lineArr[0], lineArr[2], parseInt(lineArr[4], 10));
    });

    await events.once(rl, "close");

    console.log("Solution 1 :");
    printPath(travel.getShortestPath());

    console.log("Solution 2 :");
    printPath(travel.getLongestPath());
})();
