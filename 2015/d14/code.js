const fs = require("fs");

const simulationTime = 2503;

class Reindeer {
    constructor(name, speed, runTime, restTime) {
        this.name = name;
        this.speed = speed;
        this.runTime = runTime;
        this.restTime = restTime;
        this.distanceTraveled = 0;
        this.t = 0;
        this.exhausted = false;
        this.points = 0;
    }

    action() {
        this.t++;
        if (this.exhausted) {
            if (this.t >= this.restTime) {
                this.t = 0;
                this.exhausted = false;
            }
        } else {
            this.distanceTraveled += this.speed;
            if (this.t >= this.runTime) {
                this.t = 0;
                this.exhausted = true;
            }
        }
    }

    givePoints(nbPoints) {
        this.points += nbPoints;
    }
}

function lineToReindeer(line) {
    const lineSplt = line.split(" ");

    const reindeerName = lineSplt[0];
    const speed = parseInt(lineSplt[3], 10);
    const runTime = parseInt(lineSplt[6], 10);
    const restTime = parseInt(lineSplt[13], 10);

    return new Reindeer(reindeerName, speed, runTime, restTime);
}

function getReindeersMaxDist(reindeers) {
    return Math.max(...reindeers.map((reindeer) => reindeer.distanceTraveled));
}

function getReindeersMaxPoint(reindeers) {
    return Math.max(...reindeers.map((reindeer) => reindeer.points));
}

function givePointsToLeadingReindeers(reindeers) {
    const maxDistTraveled = getReindeersMaxDist(reindeers);
    reindeers.forEach((reindeer) => {
        if (reindeer.distanceTraveled === maxDistTraveled) {
            reindeer.givePoints(1);
        }
    });
}

fs.readFile("./input.txt", "utf8", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    const dataSplt = data.split("\n");
    const reindeers = [];

    for (let line of dataSplt) {
        reindeers.push(lineToReindeer(line));
    }

    let t = 0;

    while (t < simulationTime) {
        reindeers.forEach((reindeer) => reindeer.action());
        givePointsToLeadingReindeers(reindeers);
        t++;
    }

    console.log(`Solution 1 : ${getReindeersMaxDist(reindeers)}`);
    console.log(`Solution 2 : ${getReindeersMaxPoint(reindeers)}`);
});
