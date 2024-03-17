const fs = require("fs");
const readline = require("readline");
const events = require("events");

const NB_CARDS_PER_HAND = 5;
const cardsLabels = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];
const cardsLabelsWithJoker = ["J", "2", "3", "4", "5", "6", "7", "8", "9", "T", "Q", "K", "A"];
const handTypes = [isHighCard, isOnePair, isTwoPair, isThreeOfKind, isFullHouse, isFourOfKind, isFiveOfKind];

// ---------------
// Utils

function extractDataFromLine(line) {
    const lineSplt = line.split(" ");

    return { hand: lineSplt[0], bid: parseInt(lineSplt[1], 10) };
}

function getNbCardsWithSameLabel(hand) {
    const handSorted = hand.split("").toSorted();
    let cardsWithSameLabels = {};

    let currCard = handSorted[0];
    let currCardCnt = 1;

    for (let cardIdx = 1; cardIdx < handSorted.length; cardIdx++) {
        if (handSorted[cardIdx] !== currCard) {
            if (!(currCardCnt in cardsWithSameLabels)) {
                cardsWithSameLabels[currCardCnt] = [];
            }
            cardsWithSameLabels[currCardCnt].push(currCard);

            currCardCnt = 1;
            currCard = handSorted[cardIdx];
        } else {
            currCardCnt++;
        }
    }

    if (!(currCardCnt in cardsWithSameLabels)) {
        cardsWithSameLabels[currCardCnt] = [];
    }
    cardsWithSameLabels[currCardCnt].push(currCard);

    return cardsWithSameLabels;
}

function* getCombiOfCards(arr, nbEltInCombi) {
    if (nbEltInCombi === 1) {
        for (let elt of arr) {
            yield [elt];
        }
    } else {
        for (let arrIdx in arr) {
            for (const combi of getCombiOfCards(arr.slice(arrIdx), nbEltInCombi - 1)) {
                yield [arr[arrIdx]].concat(combi);
            }
        }
    }
}

// ---------------
// Hand types

function isXOfKind(cardsWithSameLabels, x) {
    return (
        cardsWithSameLabels[x] !== undefined &&
        cardsWithSameLabels[x].length === 1 &&
        (x === NB_CARDS_PER_HAND ||
            (cardsWithSameLabels[1] !== undefined && cardsWithSameLabels[1].length === NB_CARDS_PER_HAND - x))
    );
}

function isFiveOfKind(cardsWithSameLabels) {
    return isXOfKind(cardsWithSameLabels, 5);
}

function isFourOfKind(cardsWithSameLabels) {
    return isXOfKind(cardsWithSameLabels, 4);
}

function isFullHouse(cardsWithSameLabels) {
    return cardsWithSameLabels[3] !== undefined && cardsWithSameLabels[2] !== undefined;
}

function isThreeOfKind(cardsWithSameLabels) {
    return isXOfKind(cardsWithSameLabels, 3);
}

function isTwoPair(cardsWithSameLabels) {
    return (
        cardsWithSameLabels[2] !== undefined &&
        cardsWithSameLabels[2].length === 2 &&
        cardsWithSameLabels[1] !== undefined
    );
}

function isOnePair(cardsWithSameLabels) {
    return isXOfKind(cardsWithSameLabels, 2);
}

function isHighCard(cardsWithSameLabels) {
    return cardsWithSameLabels[1] !== undefined && cardsWithSameLabels[1].length === NB_CARDS_PER_HAND;
}

// --------------------
// Comparisons

function getCardStrength(cardLabel) {
    return cardsLabels.indexOf(cardLabel);
}

function getHandStrength(hand) {
    const diffLabels = getNbCardsWithSameLabel(hand);

    for (let typeIdx = 0; typeIdx < handTypes.length; typeIdx++) {
        if (handTypes[typeIdx](diffLabels)) {
            return typeIdx;
        }
    }

    return -1;
}

function isBetterHand(hand1, hand2) {
    if (getHandStrength(hand1) === getHandStrength(hand2)) {
        for (let cardIdx in hand1) {
            if (getCardStrength(hand1[cardIdx]) === getCardStrength(hand2[cardIdx])) {
                continue;
            }

            return getCardStrength(hand1[cardIdx]) > getCardStrength(hand2[cardIdx]);
        }
        return false;
    }

    return getHandStrength(hand1) > getHandStrength(hand2);
}

function getCardStrengthWithJoker(cardLabel) {
    return cardsLabelsWithJoker.indexOf(cardLabel);
}

function getHandStrengthWithJoker(hand) {
    // Extract the non joker cards
    let nbJoker = 0;
    let handWithoutJoker = "";
    for (let card of hand) {
        if (card === "J") {
            nbJoker++;
            continue;
        }

        handWithoutJoker += card;
    }

    let bestHandStrength = getHandStrength(hand);

    if (nbJoker === 0 || bestHandStrength === 6) return bestHandStrength;

    // If there are joker cards

    // Get all the possible cards for the jokers
    const diffLabels = getNbCardsWithSameLabel(handWithoutJoker);
    let nbPossCards = Object.values(diffLabels).reduce((acc, v) => {
        return acc.concat(v);
    }, []);
    for (let i = 0; i < nbJoker; i++) {
        for (let cardIdx = 0; cardIdx < cardsLabels.length; cardIdx++) {
            if (nbPossCards.indexOf(cardsLabels[cardIdx]) === -1) {
                nbPossCards.push(cardsLabels[cardIdx]);
                break;
            }
        }
    }

    for (let combi of getCombiOfCards(nbPossCards, nbJoker)) {
        const combiHand = combi.join("");
        const handStrength = getHandStrength(handWithoutJoker + combiHand);
        if (handStrength > bestHandStrength) {
            bestHandStrength = handStrength;
        }

        if (bestHandStrength === 6) {
            break;
        }
    }

    return bestHandStrength;
}

function isBetterHandWithJoker(hand1, hand2) {
    const hand1Strength = getHandStrengthWithJoker(hand1);
    const hand2Strength = getHandStrengthWithJoker(hand2);
    if (hand1Strength === hand2Strength) {
        for (let cardIdx in hand1) {
            if (getCardStrengthWithJoker(hand1[cardIdx]) === getCardStrengthWithJoker(hand2[cardIdx])) {
                continue;
            }

            return getCardStrengthWithJoker(hand1[cardIdx]) > getCardStrengthWithJoker(hand2[cardIdx]);
        }
        return false;
    }

    return hand1Strength > hand2Strength;
}

// --------------------
// The game

class GameSet {
    constructor() {
        this.cards = [];
        this.bids = [];
    }

    searchInsertIndex(hand) {
        let lower = 0;
        let upper = this.cards.length;

        let idx = 0;

        while (upper !== lower) {
            idx = Math.floor((lower + upper) / 2);
            const currHand = this.cards[idx];

            if (this.cmpCards(hand, currHand)) {
                lower = idx + 1;
            } else {
                upper = idx;
            }
        }

        return Math.floor((lower + upper) / 2);
    }

    cmpCards(hand1, hand2) {
        return isBetterHand(hand1, hand2);
    }

    insertNewHand(hand, bid) {
        const insertIdx = this.searchInsertIndex(hand);
        this.cards.splice(insertIdx, 0, hand);
        this.bids.splice(insertIdx, 0, bid);
    }

    computeTotal() {
        let currIdx = 0;
        let lastHand = "";
        let res = 0;

        for (let bidIdx = 0; bidIdx < this.bids.length; bidIdx++) {
            if (lastHand !== this.cards[bidIdx]) {
                currIdx = bidIdx;
                lastHand = this.cards[bidIdx];
            }

            res += this.bids[bidIdx] * (currIdx + 1);
        }

        return res;
    }
}

class GameSetWithJoker extends GameSet {
    constructor() {
        super();
    }
    cmpCards(hand1, hand2) {
        return isBetterHandWithJoker(hand1, hand2);
    }
}

(async () => {
    const rl = readline.createInterface(fs.createReadStream("./input.txt"));

    const gs = new GameSet();
    const gsJ = new GameSetWithJoker();

    rl.on("line", (line) => {
        const data = extractDataFromLine(line);
        gs.insertNewHand(data.hand, data.bid);
        gsJ.insertNewHand(data.hand, data.bid);
    });

    await events.once(rl, "close");

    console.log("Solution 1 : ", gs.computeTotal());
    console.log("Solution 2 : ", gsJ.computeTotal());
})();
