class Graph {
    constructor() {
        this.nodes = new Map();
    }
    *bfs(first) {
        const visited = new Set();
        const visitList = [];
        visitList.push(first);
        while (visitList.length > 0) {
            const node = visitList[0];
            visitList.splice(0, 1);
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
                this.nodes.get(node).children.forEach(child => visitList.push(child));
            }
        }
    }
    addNode(value) {
        const node = this.nodes.get(value);
        if (node) {
            return node;
        }
        else {
            const node = new Node(value);
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
    constructor(value) {
        this.value = value;
        this.parents = [];
        this.children = [];
    }
    addParent(value) {
        this.parents.push(value);
    }
    addChild(value) {
        this.children.push(value);
    }
    removeAdjacent(value) {
        this.removeParent(value);
        this.removeChild(value);
    }
    removeParent(value) {
        const index = this.parents.indexOf(value);
        if (index > -1) {
            const deleteCount = 1;
            this.parents.splice(index, deleteCount);
        }
    }
    removeChild(value) {
        const index = this.children.indexOf(value);
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
        return this.children.indexOf(value) > -1;
    }
    isParent(value) {
        return this.parents.indexOf(value) > -1;
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
    let bfs = CommitGraph.bfs(firstCommit);
    let doneTraversing = false;
    let laneHeads = [firstCommit, null, null, null, null];
    while (!doneTraversing) {
        const currentNode = bfs.next();
        if (currentNode.done) {
            doneTraversing = true;
        }
        else {
            if ((_a = currentNode === null || currentNode === void 0 ? void 0 : currentNode.value) === null || _a === void 0 ? void 0 : _a.value) {
                const lane = laneHeads.indexOf((_b = currentNode === null || currentNode === void 0 ? void 0 : currentNode.value) === null || _b === void 0 ? void 0 : _b.value);
                if (lane < 0) {
                    //merge commit-ish
                    const lanes = laneHeads.filter(laneHead => !!laneHead);
                    const laneIndexes = lanes.map((lane, index) => index);
                    generatedList.push(laneIndexes);
                }
                else {
                    generatedList.push([lane]);
                }
                if ((_d = (_c = currentNode === null || currentNode === void 0 ? void 0 : currentNode.value) === null || _c === void 0 ? void 0 : _c.children) === null || _d === void 0 ? void 0 : _d.length) {
                    switch (currentNode.value.children.length) {
                        case 1:
                            laneHeads[lane] = currentNode.value.children[0];
                            break;
                        case 2:
                            laneHeads[lane] = currentNode.value.children[0];
                            const nextLane = lane + 1 > 5 ? 5 : lane + 1;
                            laneHeads[nextLane] = currentNode.value.children[1];
                            break;
                    }
                }
            }
            else {
                console.log("DNE currentNode?.value?.value");
            }
        }
    }
    return generatedList;
};
