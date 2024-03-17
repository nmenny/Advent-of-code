const fs = require("fs");
const readline = require("readline");
const events = require("events");

class System {
    static unaryInstructionSet = ["NOT"];
    static binaryInstructionSet = ["AND", "OR", "LSHIFT", "RSHIFT"];
    static affectationInstruction = "->";
    sigNbBit;
    signals;
    unexecutedIntructions;
    overridenWires;

    constructor(sigNbBit = 16) {
        this.sigNbBit = 2 ** sigNbBit;
        this.signals = {};
        this.unexecutedIntructions = [];
        this.overridenWires = [];
    }

    reset() {
        this.signals = {};
        this.unexecutedIntructions = [];
        this.overridenWires = [];
    }

    // Execute one given instruction
    executeInstruction(instruction) {
        const splittedInstr = this.splitInstruction(instruction);
        const wireValue = this.computeInstruction(splittedInstr[0]);
        const wireAffected = this.computeAffectation(wireValue, splittedInstr[1]);

        // If the instruction has not affected any wire, stop here
        if (wireAffected === undefined) {
            this.unexecutedIntructions.push(splittedInstr);
            return;
        }

        // Else, it's possible that the affection allows the system to execute the unexecuted instructions

        let instructionProcessed = false;

        do {
            instructionProcessed = false;

            const newUnexecutedInstruction = [];

            // Goes through all the unexecuted instructions to try executing them
            for (let splittedInstr of this.unexecutedIntructions) {
                const wireValue = this.computeInstruction(splittedInstr[0]);
                const wireAffected = this.computeAffectation(wireValue, splittedInstr[1]);

                // If the instruction has not affected any wire, stays as unexecuted
                if (wireAffected === undefined) {
                    newUnexecutedInstruction.push(splittedInstr);
                } else {
                    instructionProcessed |= true;
                }
            }

            this.unexecutedIntructions = newUnexecutedInstruction;
        } while (instructionProcessed);
    }

    // get the signal of the wire
    // returns -1 if the wire is not set
    getWireSignal(wireId) {
        if (Object.keys(this.signals).indexOf(wireId) !== -1) {
            return this.signals[wireId];
        }
        return -1;
    }

    toString() {
        return this.signals;
    }

    // Can override a wire to ignore all instructions that changes the value of the wire
    overrideWire(id, signal) {
        if (signal <= -1 || signal >= this.sigNbBit) {
            return false;
        }

        this.setWireSignal(id, signal);
        this.overridenWires.push(id);
        return true;
    }

    setWireSignal(id, signal) {
        if (this.overridenWires.indexOf(id) === -1) {
            this.signals[id] = signal;
        }
    }

    // Gets the value from a provided wire or direct signal (int value)
    // Returns -1 if the wire is not set
    getDirectOrWiredSignal(signalOrWire) {
        const directSignal = parseInt(signalOrWire, 10);

        // If the provided signal is a direct one
        if (!isNaN(directSignal)) return directSignal;

        // Else it must be a wire signal
        return this.getWireSignal(signalOrWire);
    }

    // Splits the instruction to have an array with [lop, rop] (corresponding to instruction "lop -> rop")
    splitInstruction(instruction) {
        return instruction.split(System.affectationInstruction).map((v) => {
            return v
                .trim()
                .split(" ")
                .map((v2) => {
                    return v2.trim();
                });
        });
    }

    // Compute one instruction contained in the provided left operand
    // Returns -1 if it cannot find a correct value (i.e. one of the wire needed in the instruction is not set)
    computeInstruction(lopSplitted) {
        // If the operator is alone, it's just a getter
        if (lopSplitted.length === 1) {
            return this.getDirectOrWiredSignal(lopSplitted[0]);
        }

        // Checks if the instruction is unary
        for (let instrId = 0; instrId < System.unaryInstructionSet.length; instrId++) {
            if (lopSplitted.indexOf(System.unaryInstructionSet[instrId]) !== -1) {
                return this.computeUnaryInstruction(System.unaryInstructionSet[instrId], lopSplitted[1]);
            }
        }

        // Then, if not unary, checks if the instruction is binary
        for (let instrId = 0; instrId < System.binaryInstructionSet.length; instrId++) {
            if (lopSplitted.indexOf(System.binaryInstructionSet[instrId]) !== -1) {
                return this.computeBinaryInstruction(
                    System.binaryInstructionSet[instrId],
                    lopSplitted[0],
                    lopSplitted[2]
                );
            }
        }

        // If the instruction is unknown
        return -1;
    }

    computeUnaryInstruction(instruction, compo) {
        switch (instruction) {
            case "NOT":
                return this.computeNOT(compo);
        }

        return -1;
    }

    computeNOT(compo) {
        const compoValue = this.getDirectOrWiredSignal(compo);

        if (compoValue !== -1) {
            return this.sigNbBit - 1 - compoValue;
        }

        return -1;
    }

    computeBinaryInstruction(instruction, compo1, compo2) {
        switch (instruction) {
            case "AND":
                return this.computeAND(compo1, compo2);
            case "OR":
                return this.computeOR(compo1, compo2);
            case "LSHIFT":
                return this.computeLSHIFT(compo1, compo2);
            case "RSHIFT":
                return this.computeRSHIFT(compo1, compo2);
        }

        return -1;
    }

    computeAND(c1, c2) {
        return this.computeBinaryOperator("&", c1, c2);
    }

    computeOR(c1, c2) {
        return this.computeBinaryOperator("|", c1, c2);
    }

    computeLSHIFT(c1, c2) {
        return this.computeBinaryOperator("<<", c1, c2);
    }

    computeRSHIFT(c1, c2) {
        return this.computeBinaryOperator(">>>", c1, c2);
    }

    computeBinaryOperator(operator, c1, c2) {
        const c1Val = this.getDirectOrWiredSignal(c1);
        const c2Val = this.getDirectOrWiredSignal(c2);

        if (c1Val === -1 || c2Val === -1) return -1;

        return eval(`${c1Val} ${operator} ${c2Val}`);
    }

    // Affects a given value to the given right operand
    // Returns undefined if the value cannot be set (i.e. == -1)
    computeAffectation(value, ropSplitted) {
        if (value === -1) return undefined;

        this.setWireSignal(ropSplitted[0], value);

        return ropSplitted[0];
    }
}

(async () => {
    const rl = readline.createInterface({
        input: fs.createReadStream("./input.txt"),
    });

    const syst = new System();

    rl.on("line", (line) => {
        syst.executeInstruction(line);
    });

    await events.once(rl, "close");

    const sigA = syst.getWireSignal("a");

    console.log(`Solution 1 : ${sigA}`);

    syst.reset();
    syst.overrideWire("b", sigA);

    const rl2 = readline.createInterface({
        input: fs.createReadStream("./input.txt"),
    });

    rl2.on("line", (line) => {
        syst.executeInstruction(line);
    });

    await events.once(rl2, "close");

    const sigA2 = syst.getWireSignal("a");

    console.log(`Solution 2 : ${sigA2}`);
})();
