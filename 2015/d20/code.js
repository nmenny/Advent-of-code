const fs = require("fs");

function* getAllDivisors(n) {
    for (let i = 1; i * i <= n; i++) {
        if (n % i === 0) {
            yield i;

            if (n / i !== i) {
                yield n / i;
            }
        }
    }
}

fs.readFile("input.txt", (err, data) => {
    if (err) throw err;

    const numberOfPresents = parseInt(data.toString().split("\n")[0]);
    let houseI = 0;
    let presentCount = 0;

    do {
        houseI++;
        presentCount = 0;
        for (let divisor of getAllDivisors(houseI)) {
            presentCount += divisor * 10;
        }
    } while (presentCount < numberOfPresents);

    console.log(`Solution 1 : ${houseI}`);

    // --

    houseI = 0;
    presentCount = 0;

    do {
        houseI++;
        presentCount = 0;
        for (let divisor of getAllDivisors(houseI)) {
            if (divisor * 50 > houseI) {
                presentCount += divisor * 11;
            }
        }
    } while (presentCount < numberOfPresents);

    console.log(`Solution 2 : ${houseI}`);
});
