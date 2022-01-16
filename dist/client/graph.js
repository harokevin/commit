class Graph {
    constructor() {
        this.nodes = new Map();
    }
    // Return the nodes in order by date
    // Use BFS but prioritize by oldest node gets visited first.
    // Does there need to be an exception for when a visited node needs to be visited again?
    // Duplicates should not be able to be added to the visitList. It should be a set or commit ed92d313ff5d51f2db86c8e8da7767f99c77e7b4 will be processed twice. NVM the check to make sure we have not already visited it fixes this and prevents additons to the visitList
    *dateOrderSearch(first) {
        const visited = new Set();
        const visitList = [];
        visitList.push(first);
        while (visitList.length > 0) {
            debugger;
            const node = visitList[0]; //TODO have to add the date before you can sort by it. Commiter.date vs author.date
            visitList.splice(0, 1); // Remove array element 0
            if (node && !visited.has(node)) {
                yield this.nodes.get(node);
                visited.add(node);
                this.nodes.get(node).children.forEach(child => visitList.push(child));
            }
        }
    }
    *bfs(first) {
        const visited = new Set();
        const visitList = [];
        visitList.push(first);
        while (visitList.length > 0) {
            const node = visitList[0];
            visitList.splice(0, 1); // Remove array element 0
            if (node && !visited.has(node)) {
                yield this.nodes.get(node);
                visited.add(node);
                this.nodes.get(node).children.forEach(child => visitList.push(child));
            }
        }
    }
    *dfs(first) {
        const visited = new Set();
        const visitList = [];
        visitList.push(first);
        while (visitList.length > 0) {
            const node = visitList.pop();
            if (node && !visited.has(node)) {
                yield node;
                visited.add(node);
                const reversedChildren = this.nodes.get(node).children.reverse();
                reversedChildren.forEach(child => visitList.push(child));
            }
        }
    }
    addNode(value, date) {
        const node = this.nodes.get(value);
        if (node) {
            return node;
        }
        else {
            const node = new Node(value, date);
            this.nodes.set(value, node);
            return node;
        }
    }
    removeNode(value) {
        const currentNode = this.nodes.get(value);
        if (currentNode) {
            this.nodes.forEach(node => node.removeAdjacent(value));
        }
        return this.nodes.delete(value);
    }
    addEdge(source, destination) {
        const sourceNode = this.addNode(source);
        const destinationNode = this.addNode(destination);
        if (!sourceNode.isChild(destination)) {
            sourceNode.addChild(destination);
        }
        if (!destinationNode.isParent(source)) {
            destinationNode.addParent(source);
        }
        return [sourceNode, destinationNode];
    }
    removeEdge(source, destination) {
        const sourceNode = this.nodes.get(source);
        const destinationNode = this.nodes.get(destination);
        if (sourceNode && destinationNode) {
            sourceNode.removeChild(destination);
            destinationNode.removeParent(source);
        }
        return [sourceNode, destinationNode];
    }
}
class Node {
    constructor(value, date) {
        this.value = value;
        this.date = date;
        this.parents = [];
        this.children = [];
    }
    addParent(value, date) {
        this.parents.push({ value, date });
    }
    addChild(value, date) {
        this.children.push({ value, date });
    }
    removeAdjacent(value) {
        this.removeParent(value);
        this.removeChild(value);
    }
    removeParent(value) {
        const index = this.parents.findIndex(p => p.value === value);
        if (index > -1) {
            const deleteCount = 1;
            this.parents.splice(index, deleteCount);
        }
    }
    removeChild(value) {
        const index = this.children.findIndex(c => c.value === value);
        if (index > -1) {
            const deleteCount = 1;
            this.children.splice(index, deleteCount);
        }
    }
    isAdjacent(value) {
        this.isChild(value);
        this.isParent(value);
    }
    isChild(value) {
        return this.children.findIndex(c => c.value === value) > -1;
    }
    isParent(value) {
        return this.parents.findIndex(p => p.value === value) > -1;
    }
}
// Generate List
export const generateList = (repo) => {
    var _a, _b, _c, _d;
    const CommitGraph = new Graph();
    const generatedList = [];
    const oldToNewRepo = repo.reverse();
    let firstCommit = null;
    oldToNewRepo.forEach((commit, index) => {
        var _a, _b, _c;
        if (((_a = commit === null || commit === void 0 ? void 0 : commit.parents) === null || _a === void 0 ? void 0 : _a.length) == 0) {
            // Initial Commit
            CommitGraph.addNode(commit.sha);
            firstCommit = commit.sha;
        }
        else if (((_b = commit === null || commit === void 0 ? void 0 : commit.parents) === null || _b === void 0 ? void 0 : _b.length) == 1) {
            // Linear Commit
            CommitGraph.addNode(commit.sha);
            const source = commit.parents[0].sha;
            const desination = commit.sha;
            CommitGraph.addEdge(source, desination);
        }
        else if (((_c = commit === null || commit === void 0 ? void 0 : commit.parents) === null || _c === void 0 ? void 0 : _c.length) == 2) {
            // Merge commit
            CommitGraph.addNode(commit.sha);
            const source1 = commit.parents[0].sha;
            const source2 = commit.parents[1].sha;
            const desination = commit.sha;
            CommitGraph.addEdge(source1, desination);
            CommitGraph.addEdge(source2, desination);
        }
    });
    let dateOrderSearch = CommitGraph.dateOrderSearch(firstCommit);
    let doneTraversing = false;
    let laneHeads = [firstCommit, null, null, null, null];
    while (!doneTraversing) {
        const currentNode = dateOrderSearch.next();
        if (currentNode.done) {
            doneTraversing = true;
        }
        else {
            if ((_a = currentNode === null || currentNode === void 0 ? void 0 : currentNode.value) === null || _a === void 0 ? void 0 : _a.value) {
                const lane = laneHeads.indexOf((_b = currentNode === null || currentNode === void 0 ? void 0 : currentNode.value) === null || _b === void 0 ? void 0 : _b.value);
                const existingLaneNotFound = lane < 0;
                if (existingLaneNotFound) {
                    // If there is not existing lane create a row where each 
                    // lane gets a node if there is a value in the lane head
                    // TODO This is currently a way to visually prototype merge commits
                    // This will be replaced by merge commit piping across lanes and rows
                    // merge commit-ish
                    const lanes = laneHeads.filter(laneHead => !!laneHead);
                    const laneIndexes = lanes.map((lane, index) => index);
                    generatedList.push(laneIndexes);
                }
                else {
                    // Continue to build lane on top of existing lane.
                    generatedList.push([lane]);
                }
                // Make new lanes/branches if a commit has multiple children
                if ((_d = (_c = currentNode === null || currentNode === void 0 ? void 0 : currentNode.value) === null || _c === void 0 ? void 0 : _c.children) === null || _d === void 0 ? void 0 : _d.length) {
                    switch (currentNode.value.children.length) {
                        case 1:
                            laneHeads[lane] = currentNode.value.children[0];
                            break;
                        case 2:
                            laneHeads[lane] = currentNode.value.children[1];
                            const nextLane = lane + 1 > 5 ? 5 : lane + 1;
                            laneHeads[nextLane] = currentNode.value.children[0];
                            break;
                    }
                    // Handele a merge commit
                    // if (currentNode.value?.parents?.length > 1) {
                    // 	if (laneHeads[4]) {
                    // 		laneHeads[4] = null;
                    // 	} else if (laneHeads[3]) {
                    // 		laneHeads[3] = null;
                    // 	} else if (laneHeads[2]) {
                    // 		laneHeads[2] = null;
                    // 	} else if (laneHeads[1]) {
                    // 		laneHeads[1] = null;
                    // 	}
                    // }
                }
            }
            else {
                console.log("DNE currentNode?.value?.value");
            }
        }
    }
    // debugger;
    //improptu test
    /* actual
    [
      [3],
      [3],
      [3],
      [2],
      [3],
      [0,1,2,3],
      [2],
      [3],
      [0,1,2,3],
      [2],
      [3],
      [0,1,2,3],
      [2],
      [3],
      [0,1,2,3],
      [2],
      [3],
      [2],
      [2],
      [2],
      [2],
      [2],
      [2],
      [2],
      [1],
      [2],
      [1],
      [2],
      [1],
      [2],
      [1],
      [2],
      [0],
      [1], // exp 0
      [2], // exp 0
      [0], // exp 0
      [1],
      [0], // First straight 6
      [0],
      [0],
      [0],
      [0],
      [0]
    ]
    
    */
    // Length 43
    // expected
    // Length 62-63
    /*
    Index N At Top
      [
        [0],
        [3], // End of 7 In 3
        [3],
        [3],
        [3],
        [3],
        [3],
        [3],
        [0],
        [2],
        [2],
        [1],
        [2],
        [2],
        [1],
        [2],
        [0], //End of 9 in 0
        [0],
        [0],
        [0],
        [0],
        [0],
        [0],
        [0],
        [0],
        [1], // End of 4 in 1
        [1],
        [1],
        [1],
        [0],
        [0],
        [2],
        [1],
        [0],
        [0],
        [0],
        [1],
        [0], // First straight 6
        [0],
        [0],
        [0],
        [0],
        [0]
      ]
    Index 0 at bottom
      */
    return generatedList;
};
