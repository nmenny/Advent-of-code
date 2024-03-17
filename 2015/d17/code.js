const fs = require("fs");
const readline = require("readline");
const events = require("events");

const QTE_TO_HOLD = 150;

function getNbContainersToHoldGivenQte(containers, targetQte, currQte = 0) {
    if (containers.length === 0) return currQte === targetQte ? 1 : -1;

    if (currQte === targetQte) return 1;

    if (containers.length === 1) return containers[0] + currQte === targetQte ? 1 : -1;

    let cnt = 0;

    for (const containerQteIdx in containers) {
        const nbAbleToHold = getNbContainersToHoldGivenQte(
            containers.slice(parseInt(containerQteIdx) + 1),
            targetQte,
            containers[containerQteIdx] + currQte
        );
        if (nbAbleToHold !== -1) {
            cnt += nbAbleToHold;
        }
    }

    return cnt;
}

function getNbContainersToHoldGivenQteV2(containers, targetQte, currQte = 0, nbContainerUsed = 0) {
    if (containers.length === 0)
        return {
            cnt: [currQte === targetQte ? 1 : -1],
            cntUsed: [nbContainerUsed],
        };

    if (currQte === targetQte) return { cnt: [1], cntUsed: [nbContainerUsed] };

    if (containers.length === 1)
        return {
            cnt: [containers[0] + currQte === targetQte ? 1 : -1],
            cntUsed: [nbContainerUsed + 1],
        };

    let cnt = { cnt: [], cntUsed: [] };

    for (const containerQteIdx in containers) {
        const nbAbleToHold = getNbContainersToHoldGivenQteV2(
            containers.slice(parseInt(containerQteIdx) + 1),
            targetQte,
            containers[containerQteIdx] + currQte,
            nbContainerUsed + 1
        );

        for (let cntIdx in nbAbleToHold.cntUsed) {
            let insertIdx = cnt.cntUsed.indexOf(nbAbleToHold.cntUsed[cntIdx]);
            if (insertIdx === -1) {
                cnt.cntUsed.push(nbAbleToHold.cntUsed[cntIdx]);
                cnt.cnt.push(0);
                insertIdx = cnt.cntUsed.length - 1;
            }

            if (nbAbleToHold.cnt[cntIdx] !== -1) {
                cnt.cnt[insertIdx] += nbAbleToHold.cnt[cntIdx];
            }
        }
    }

    return cnt;
}

(async () => {
    const rl = readline.createInterface({
        input: fs.createReadStream("./input.txt"),
    });

    const containers = [];

    rl.on("line", (line) => {
        if (line.length === 0) return;
        containers.push(parseInt(line));
    });

    await events.once(rl, "close");

    console.log(`Solution 1 : ${getNbContainersToHoldGivenQte(containers, QTE_TO_HOLD)}`);

    // ----

    const res = getNbContainersToHoldGivenQteV2(containers, QTE_TO_HOLD);

    while (res.cntUsed.length > 0) {
        const minContainersUsed = Math.min(...Object.values(res.cntUsed));
        const cntIdx = res.cntUsed.indexOf(minContainersUsed);

        if (res.cnt[cntIdx] > 0) {
            console.log(`Solution 2 : ${res.cnt[cntIdx]}`);
            break;
        }

        res.cntUsed = res.cntUsed.slice(0, cntIdx).concat(res.cntUsed.slice(cntIdx + 1));
        res.cnt = res.cnt.slice(0, cntIdx).concat(res.cnt.slice(cntIdx + 1));
    }
})();
