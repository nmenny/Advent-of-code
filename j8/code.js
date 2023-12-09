const fs = require("fs");

function extractNodeInfo(line) {
	const re = /(.*) = \((.*), (.*)\)/;
	const reArr = re.exec(line);

	return { nodeName: reArr[1], leftNode: reArr[2], rightNode: reArr[3] };
}

function gcd(a, b) 
{ 
    if (b == 0) 
        return a; 
    return gcd(b, a % b); 
} 
 

function findlcm(arr) 
{ 

    let ans = arr[0]; 
 
    for (let i = 1; i < arr.length; i++) {
        ans = (((arr[i] * ans)) / 
                (gcd(arr[i], ans))); 
    }
 
    return ans; 
} 

class Navigation {

	static startNode = "AAA";
	static exitNode = "ZZZ";

	constructor() {
		this.instructions = "";
		this.step = 0;
		this.currInstruction = -1;
		this.map = {}
		this.currNode = this._getStartingNode();
	}

	_getStartingNode() {
		return Navigation.startNode;
	}

	addInstructions(instructions) {
		this.instructions = instructions.trim();
		this.currInstruction = 0;
	}

	addNode(nodeName, leftNode, rightNode) {
		if(!(nodeName in this.map))
			this.map[nodeName] = {"L" : leftNode, "R": rightNode}
	}

	_followInstruction(instruction) {
		this.currNode = this.map[this.currNode][instruction];
	}

	_endReached() {
		return this.currNode === Navigation.exitNode
	}

	findExit() {
		while(!this._endReached()) {
			const instruction = this.instructions[this.currInstruction];
			this._followInstruction(instruction);
			this.currInstruction = (this.currInstruction + 1) % this.instructions.length;
			this.step++;
		}
	}
}

class NavigationV2 extends Navigation {
	constructor() {
		super();
	}

	*_getNode() {
		for(let node in this.map) {
			if(node[node.length - 1] === "A") {
				yield node
			}
		}
	}

	_endReached() {
		return this.currNode[this.currNode.length-1] === "Z";
	}

	findExit() {
		let loopCycles = [];

		for(let node of this._getNode()) {
			this.currInstruction = 0;
			this.step = 0;

			this.currNode = node;

			super.findExit();

			loopCycles.push(this.step);
		}

		this.step = findlcm(loopCycles);
	}
}

fs.readFile("./input.txt", "utf8", (err, data) => {
	if(err) {
		console.error(err);
		return;
	}

	const dataSplt = data.split("\n");

	const nav = new Navigation();
	const navV2 = new NavigationV2();

	nav.addInstructions(dataSplt[0]);
	navV2.addInstructions(dataSplt[0]);

	for(let node of dataSplt.slice(2)) {
		const nodeInfo = extractNodeInfo(node);
		nav.addNode(nodeInfo.nodeName, nodeInfo.leftNode, nodeInfo.rightNode);
		navV2.addNode(nodeInfo.nodeName, nodeInfo.leftNode, nodeInfo.rightNode);
	}

	nav.findExit();
	console.log(`Solution 1 : ${nav.step}`);

	navV2.findExit()
	console.log(`Solution 2 : ${navV2.step}`);
});