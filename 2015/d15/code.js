const fs = require("fs");
const readline = require("readline");
const events = require("events");

const MAX_TABLESPOON = 100;
const NB_CALORIES = 500;

class Counter {
    constructor() {
        this.counts = [];
        this.sumAlways = NaN;
        this.max = NaN;
        this.min = NaN;
        this.reset = false;
    }

    addCount() {
        this.counts.push(0);
    }

    getCount(cntIdx) {
        if (cntIdx < 0 || cntIdx >= this.counts.length) throw new Error("Incorrect index");

        return this.counts[cntIdx];
    }

    init({ max = 100, min = 1, sumAlways = NaN } = {}) {
        this.max = max;
        this.min = min;
        this.sumAlways = sumAlways;
        this.reset = false;

        for (const countIdx in this.counts) {
            this.counts[countIdx] = this.min;
        }

        if (!isNaN(sumAlways)) {
            this.max = sumAlways - this.counts.length + 1;
            this.counts[this.counts.length - 1] = this.max;
        }
    }

    sum() {
        return this.counts.reduce((acc, v) => v + acc);
    }

    rest() {
        return this.sumAlways - this.counts.slice(0, this.counts.length - 1).reduce((acc, v) => v + acc);
    }

    plusOne() {
        if (!isNaN(this.sumAlways)) {
            const lastIdx = this.counts.length - 1;
            const prevIdx = lastIdx - 1;

            if (prevIdx >= 0) {
                do {
                    this.counts[lastIdx] = this.counts[lastIdx] > this.min ? this.counts[lastIdx] - 1 : -1;
                    this.propagate(prevIdx);
                    if (this.counts[lastIdx] == -1) {
                        this.counts[lastIdx] = this.rest() > 0 ? this.rest() : this.min;
                    }
                } while (this.sum() != this.sumAlways);
            }
        }
    }

    propagate(fromIdx) {
        if (fromIdx < 0) return;
        this.counts[fromIdx]++;
        if (this.counts[fromIdx] > this.max) {
            if (fromIdx == 0) {
                this.reset = true;
            }
            this.counts[fromIdx] = this.min;
            this.propagate(fromIdx - 1);
        }
    }
}

class Recipe {
    constructor() {
        this.ingredients = {};
        this.count = new Counter();
        this.maxTeaspoonOfIngredient = -1;

        this.ingredientsList = [];
    }

    addIngredient(ingredientName, properties) {
        this.ingredients[ingredientName] = {};
        this.count.addCount();
        for (const prop of properties) {
            const trimmed = prop.trim();
            const splitted = trimmed.split(" ").map((d) => d.trim());
            this.ingredients[ingredientName][splitted[0]] = parseInt(splitted[1]);
        }
    }

    calculateScore() {
        let score = 1;
        if (this.ingredientsList.length === 0) return 0;

        const properties = Object.keys(this.ingredients[this.ingredientsList[0]]);
        for (const property of properties) {
            if (property === "calories") continue;

            let ingredScore = 0;
            for (const ingredientIdx in this.ingredientsList) {
                const ingredient = this.ingredientsList[ingredientIdx];
                const ingredientProps = this.ingredients[ingredient][property];
                const cnt = this.count.getCount(parseInt(ingredientIdx));

                if (cnt === 0 || ingredientProps === 0) continue;

                ingredScore += ingredientProps * cnt;
            }

            if (ingredScore <= 0) return 0;

            score *= ingredScore;
        }

        return score;
    }

    calculateCalories() {
        if (this.ingredientsList.length === 0) return 0;

        let calories = 0;
        for (const ingredientIdx in this.ingredientsList) {
            const ingredient = this.ingredientsList[ingredientIdx];
            const ingredientProps = this.ingredients[ingredient]["calories"];
            const cnt = this.count.getCount(parseInt(ingredientIdx));

            if (cnt === 0 || ingredientProps === 0) continue;

            calories += ingredientProps * cnt;
        }

        if (calories <= 0) return 0;

        return calories;
    }

    *compute(nbTeaspoonIngred = 100) {
        if (nbTeaspoonIngred <= 0) throw new Error("The number of teaspoons cannot be <= 0");

        this.ingredientsList = Object.keys(this.ingredients);

        this.count.init({ min: 1, sumAlways: nbTeaspoonIngred });

        while (!this.count.reset) {
            this.count.plusOne();
            yield this.calculateScore();
        }
    }

    *computeWithCalories(nbTeaspoonIngred = 100, exactCalories = 500) {
        if (nbTeaspoonIngred <= 0) throw new Error("The number of teaspoons cannot be <= 0");

        this.ingredientsList = Object.keys(this.ingredients);

        this.count.init({ min: 1, sumAlways: nbTeaspoonIngred });

        while (!this.count.reset) {
            this.count.plusOne();
            if (this.calculateCalories() === exactCalories) {
                yield this.calculateScore();
            }
        }
    }
}

(async () => {
    const recipe = new Recipe();

    const rl = readline.createInterface({
        input: fs.createReadStream("./input.txt"),
    });

    rl.on("line", (line) => {
        if (line.length === 0) return;

        const splitted = line.split(":");
        const ingredientName = splitted[0].trim();
        const ingredientProps = splitted[1].split(",").map((d) => d.trim());

        recipe.addIngredient(ingredientName, ingredientProps);
    });

    await events.once(rl, "close");

    let maxScore = 0;
    for (const score of recipe.compute(MAX_TABLESPOON)) {
        if (score > maxScore) {
            maxScore = score;
        }
    }

    console.log(`Solution 1 : ${maxScore}`);

    maxScore = 0;
    for (const score of recipe.computeWithCalories(MAX_TABLESPOON, NB_CALORIES)) {
        if (score > maxScore) {
            maxScore = score;
        }
    }

    console.log(`Solution 2 : ${maxScore}`);
})();
