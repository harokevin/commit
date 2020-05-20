import { GitHubCommit } from './Maigard_git-class_commits.js'

// Node
interface node {
	sha: number
	parents: {
		sha: string
	}, 
	children: {
		sha: string
	}
}

// Generate List
export const generateList = (repo: GitHubCommit[]):({commit: GitHubCommit, lane: number}[]) => {
	let prevCommitSha = null;
	let existingLanes = [[],[],[],[],[]];
	const generatedList = [];
	const oldToNewRepo = repo.reverse();
	oldToNewRepo.forEach((commit, index) => {
		if (commit?.parents?.length == 0) {
			// Initial Commit
			existingLanes[0].push(commit);
			generatedList.push({ commit, lane: 0});
			prevCommitSha = commit.sha;
		} else if (commit?.parents?.length == 1) {
			// Linear Commit
			let lane = null;
			const findInLane  = (lane: number) => {
				const inLane = existingLanes[lane].find((c: GitHubCommit) => {
					return c.sha == commit.parents[0].sha;
				});
				if (inLane) {
					lane = lane;
					return true;
				}
				return false;
			}
			// Push commit to the parents lane
			// Push commit to the generted list
			if (existingLanes[0].length && findInLane(0)) {
				existingLanes[0].push(commit);
				generatedList.push({ commit, lane: 0});
			} else if (existingLanes[1].length && findInLane(1)) {
				existingLanes[1].push(commit);
				generatedList.push({ commit, lane: 1});
			} else if (existingLanes[2].length && findInLane(2)) {
				existingLanes[2].push(commit);
				generatedList.push({ commit, lane: 2});
			} else if (existingLanes[3].length && findInLane(3)) {
				existingLanes[3].push(commit);
				generatedList.push({ commit, lane: 3});
			} else if (existingLanes[4].length && findInLane(4)) {
				existingLanes[4].push(commit);
				generatedList.push({ commit, lane: 4});
			} else {
				console.log("ERROR finding commit in existing lane");
			}
		} else if (commit?.parents?.length == 2) {
			// Merge commit
		}
	});
	return generatedList;
}