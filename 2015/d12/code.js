const data = require("./input.json");

function countNb(data) {
    let cnt = 0;

    if (Array.isArray(data)) {
        for (let value of data) {
            const v = countNb(value);
            const vInt = parseInt(v, 10);
            if (!isNaN(vInt)) {
                cnt += vInt;
            } else {
                cnt += 0;
            }
        }
    } else if (typeof data === "object") {
        for (let key in data) {
            const v = countNb(data[key]);
            const vInt = parseInt(v, 10);
            if (!isNaN(vInt)) {
                cnt += vInt;
            } else {
                cnt += 0;
            }
        }
    } else {
        return data;
    }

    return cnt;
}

function countNbV2(data) {
    let cnt = 0;

    if (Array.isArray(data)) {
        for (let value of data) {
            const v = countNbV2(value);
            const vInt = parseInt(v, 10);
            if (!isNaN(vInt)) {
                cnt += vInt;
            } else {
                cnt += 0;
            }
        }
    } else if (typeof data === "object") {
        for (let key in data) {
            if (data[key] === "red") {
                return 0;
            }
            const v = countNbV2(data[key]);
            const vInt = parseInt(v, 10);
            if (!isNaN(vInt)) {
                cnt += vInt;
            } else {
                cnt += 0;
            }
        }
    } else {
        return data;
    }

    return cnt;
}

console.log("Solution 1 : ", countNb(data));
console.log("Solution 2 : ", countNbV2(data));
