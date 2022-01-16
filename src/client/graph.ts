import { GitHubCommit } from './Maigard_git-class_commits.js'

class Graph {
	nodes: Map<string, Node>;
	
	constructor() {
		this.nodes = new Map<string, Node>();
	}

	*bfs(first: string): Generator<Node> {
		const visited = new Set<string>();
		const visitList: string[] = [];
	
		visitList.push(first);
	
		while(visitList.length > 0) {
			const node = visitList[0];
			visitList.splice(0,1);
			if(node && !visited.has(node)) {
				yield this.nodes.get(node);
				visited.add(node);
				this.nodes.get(node).children.forEach(child => visitList.push(child));
			}
		}
	}

	*dfs(first: string) {
		const visited = new Set<string>();
		const visitList: string[] = [];
	
		visitList.push(first);
	
		while(visitList.length > 0) {
			const node = visitList.pop();
			if(node && !visited.has(node)) {
				yield node;
				visited.add(node);
				this.nodes.get(node).children.forEach(child => visitList.push(child));
			}
		}
	}

	addNode(value: string): Node {
		const node = this.nodes.get(value);
		if (node) {
			return node;
		} else {
			const node = new Node(value);
			this.nodes.set(value, node);
			return node;
		}
	}

	removeNode(value: string): boolean {
		const currentNode = this.nodes.get(value);
		if (currentNode) {
			this.nodes.forEach(node => node.removeAdjacent(value));
		}
		return this.nodes.delete(value);
	}

	addEdge(source: string, destination: string): [Node, Node] {
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

	removeEdge(source: string, destination): [Node, Node] {
		const sourceNode = this.nodes.get(source);
		const destinationNode = this.nodes.get(destination);

		if (sourceNode && destinationNode) {
			sourceNode.removeChild(destination);
			destinationNode.removeParent(source);
		}

		return [sourceNode, destinationNode]
	}
}

class Node {
	value: string;
	parents: string[];
	children: string[];

	constructor(value: string) {
		this.value = value;
		this.parents = [];
		this.children = [];
	}

	addParent(value: string) {
		this.parents.push(value);
	}

	addChild(value: string) {
		this.children.push(value);
	}

	removeAdjacent(value: string) {
		this.removeParent(value);
		this.removeChild(value);
	}

	removeParent(value: string) {
		const index = this.parents.indexOf(value);
		if (index > -1) {
			const deleteCount = 1;
			this.parents.splice(index, deleteCount);
		}
	}

	removeChild(value: string) {
		const index = this.children.indexOf(value)
		if (index > -1) {
			const deleteCount = 1;
			this.children.splice(index, deleteCount);
		}
	}

	isAdjacent(value: string) {
		this.isChild(value);
		this.isParent(value);
	}

	isChild(value: string) {
		return this.children.indexOf(value) > -1;
	}

	isParent(value: string) {
		return this.parents.indexOf(value) > -1;
	}

}

// Generate List
export const generateList = (repo: GitHubCommit[]) :(number[][]) => {
	const CommitGraph = new Graph();
	const generatedList = [];
	const oldToNewRepo = repo.reverse();
	let firstCommit :string = null;
	oldToNewRepo.forEach((commit, index) => {
		if (commit?.parents?.length == 0) {
			// Initial Commit
			CommitGraph.addNode(commit.sha);
			firstCommit = commit.sha;
		} else if (commit?.parents?.length == 1) {
			// Linear Commit
			CommitGraph.addNode(commit.sha);
			const source = commit.parents[0].sha;
			const desination = commit.sha;
			CommitGraph.addEdge(source, desination);
		} else if (commit?.parents?.length == 2) {
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
		} else {
			if (currentNode?.value?.value) {
				const lane = laneHeads.indexOf(currentNode?.value?.value);
				if (lane < 0) {
					//merge commit-ish
					const lanes = laneHeads.filter(laneHead => !!laneHead);
					const laneIndexes = lanes.map((lane, index) => index);
					generatedList.push(laneIndexes);
				} else {
					generatedList.push([lane]);
				}

				if (currentNode?.value?.children?.length) {
					switch (currentNode.value.children.length) {
						case 1:
							laneHeads[lane] = currentNode.value.children[0];
							break;
						case 2:
							laneHeads[lane] = currentNode.value.children[0];
							const nextLane = lane+1 > 5 ? 5 : lane+1;
							laneHeads[nextLane] = currentNode.value.children[1];
							break;
					}
				}
			} else {
				console.log("DNE currentNode?.value?.value")
			}
		}
	}

	return generatedList;
}