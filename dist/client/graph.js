// Generate List
export const generateList = (repo) => {
    let prevCommitSha = null;
    let existingLanes = [[], [], [], [], []];
    const generatedList = [];
    const oldToNewRepo = repo.reverse();
    oldToNewRepo.forEach((commit, index) => {
        var _a, _b, _c;
        if (((_a = commit === null || commit === void 0 ? void 0 : commit.parents) === null || _a === void 0 ? void 0 : _a.length) == 0) {
            // Initial Commit
            existingLanes[0].push(commit);
            generatedList.push({ commit, lane: 0 });
            prevCommitSha = commit.sha;
        }
        else if (((_b = commit === null || commit === void 0 ? void 0 : commit.parents) === null || _b === void 0 ? void 0 : _b.length) == 1) {
            // Linear Commit
            let lane = null;
            const findInLane = (lane) => {
                const inLane = existingLanes[lane].find((c) => {
                    return c.sha == commit.parents[0].sha;
                });
                if (inLane) {
                    lane = lane;
                    return true;
                }
                return false;
            };
            // Push commit to the parents lane
            // Push commit to the generted list
            if (existingLanes[0].length && findInLane(0)) {
                existingLanes[0].push(commit);
                generatedList.push({ commit, lane: 0 });
            }
            else if (existingLanes[1].length && findInLane(1)) {
                existingLanes[1].push(commit);
                generatedList.push({ commit, lane: 1 });
            }
            else if (existingLanes[2].length && findInLane(2)) {
                existingLanes[2].push(commit);
                generatedList.push({ commit, lane: 2 });
            }
            else if (existingLanes[3].length && findInLane(3)) {
                existingLanes[3].push(commit);
                generatedList.push({ commit, lane: 3 });
            }
            else if (existingLanes[4].length && findInLane(4)) {
                existingLanes[4].push(commit);
                generatedList.push({ commit, lane: 4 });
            }
            else {
                console.log("ERROR finding commit in existing lane");
            }
        }
        else if (((_c = commit === null || commit === void 0 ? void 0 : commit.parents) === null || _c === void 0 ? void 0 : _c.length) == 2) {
            // Merge commit
        }
    });
    return generatedList;
};
