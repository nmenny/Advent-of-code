const fs = require("fs");
const readline = require("readline");
const events = require("events");

function getLineData(line) {
	const lineSplt = line.trim().split(" ");
	return lineSplt.map(v => parseInt(v, 10));
}

function extrapolateLine(arr) {
	let currArr = arr;
	const res = [currArr];

	while(currArr.some(v => v !== 0)) {
		let newLine = [];
		for(let arrIdx = 1; arrIdx < currArr.length; arrIdx++) {
			newLine.push(currArr[arrIdx] - currArr[arrIdx-1]);
		}
		res.push(newLine);
		currArr = newLine;
	}

	return res;
}

function getHistoryValue(extrapolated) {
	let addedNewCol = extrapolated.map(v => [0].concat(v.concat([0])));
	let value = 0;
	for(let lineIdx = addedNewCol.length - 2; lineIdx >= 0; lineIdx--) {
		const currLine = addedNewCol[lineIdx];
		const underLine = addedNewCol[lineIdx+1];

		addedNewCol[lineIdx][currLine.length - 1] = (
			currLine[currLine.length - 2] + underLine[underLine.length - 1]
		);

		addedNewCol[lineIdx][0] = (currLine[1] - underLine[0]);
	}

	return { 
		nextV: addedNewCol[0][addedNewCol[0].length - 1],
		prevV : addedNewCol[0][0]
	};
}

(async () => {

	const rl = readline.createInterface(fs.createReadStream("./input.txt"));

	let totalHistoryNextValue = 0;
	let totalHistoryPrevValue = 0;

	rl.on("line", line => {
		const lineD = getLineData(line);
		const extrapolated = extrapolateLine(lineD);
		const values = getHistoryValue(extrapolated);
		totalHistoryNextValue += values.nextV;
		totalHistoryPrevValue += values.prevV;
	});

	await events.once(rl, "close");

	console.log(`Solution 1 : ${totalHistoryNextValue}`);
	console.log(`Solution 2 : ${totalHistoryPrevValue}`);

})();