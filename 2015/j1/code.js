const fs = require("fs");
const { inspect } = require("util");

const BASEMENT_LEVEL = -1

fs.readFile('./input.txt', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    let currentFloor = 0
    let instructionPositionForBasement = 0
    
    for(instructionIdx in data) {
        switch(data[instructionIdx]) {
            case '(':
                currentFloor++
            break;
            case ')':
                currentFloor--
            break;
        }

        if(currentFloor === BASEMENT_LEVEL && instructionPositionForBasement === 0) {
            instructionPositionForBasement = parseInt(instructionIdx) + 1
        }
    }

    console.log(`Solution 1 : ${currentFloor}`)
    console.log(`Solution 2 : ${instructionPositionForBasement}`)

});

