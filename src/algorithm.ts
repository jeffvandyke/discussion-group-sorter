import * as _ from "lodash";
import { makeTopicGroups } from "./topics";
import {
    Assignments,
    GroupAssignment,
    makeEmptyStudentAssignments,
} from "./assignments";
import { Student } from "./student";
import { Topic, Time } from "./types";
// import FastPriorityQueue from "fastpriorityqueue";
import { Group } from "./group";
import * as crypto from "crypto";

function hashSha256(nameString: string) {
    const hasher = crypto.createHash("sha256");
    const hash = hasher.update(nameString).digest("hex");
    return hash;
}

class GroupAssignmentsTracker {
    constructor(groups: Group[]) {
        this.groupAssignments = groups.map((g) => new GroupAssignment(g));
        this.originalOrder = groups.map((g) => g.id);
    }

    private originalOrder: string[];

    // Maintain sorted with fewest assignees first
    private groupAssignments: GroupAssignment[];

    // private sortCounts() {
    //     this.groupAssignments.sort((a, b) => a.numAssigned - b.numAssigned);
    // }

    getGroupAssignments() {
        return this.originalOrder.map((id) =>
            this.groupAssignments.find((g) => g.group.id === id)
        );
    }

    /** Assigns group within the times allowed to assign to */
    addStudentToGroup(student: Student, candidates: Time[]) {
        // Use first match - list is sorted
        const eligibleAssignments = this.groupAssignments.filter((g) =>
            candidates.includes(g.group.time)
        );

        // Try to pick a group that prioritizes even
        // distribution as well as populating groups,
        // some improvements could still be made
        const groupAssignment = _.sortBy(
            eligibleAssignments,
            (asmt) =>
                100 * asmt.numAssigned +
                80 * asmt.getGradeCount(student.grade) +
                80 * asmt.getGenderCount(student.gender)
        )[0];
        groupAssignment.addStudent(student);
        // this.sortCounts();
        return groupAssignment.group;
    }
}

// function makeGroupPriorityQueue(groups: Group[]): FastPriorityQueue<GroupAssignmentCount> {
//     const groupsAssignmentTrackers = groups.map((g) => ({
//         group: g,
//         numAssigned: 0,
//     }));
//
//     const pq = new FastPriorityQueue<GroupAssignmentCount>(
//         // Returns true when a has higher priority than b
//         (a, b) => a.numAssigned < b.numAssigned
//     );
//     groupsAssignmentTrackers.forEach(g => pq.add(g));
//     return pq;
// }

export function assignStudentsToGroups(
    students: Student[],
    allTopics: Topic[],
    times: Time[]
): Assignments {
    const topicsByPopularity = allTopics
        .map((t) => ({
            topic: t,
            count: students
                .map((s) => s.chosenTopics.filter((tt) => tt === t).length)
                .reduce((l, r) => l + r, 0),
        }))
        .sort((a, b) => a.count - b.count);

    const groups = makeTopicGroups(topicsByPopularity, times);

    // Sort by a random but deterministic order
    const randomizedStudents = _.sortBy(students, (s) =>
        hashSha256(s.firstName + s.lastName)
    );

    const studentAssignments = makeEmptyStudentAssignments(
        randomizedStudents,
        times
    );

    const groupAssignments: GroupAssignment[] = [];

    // Start with most restrictive (fewest groups)
    topicsByPopularity.forEach(({ topic }) => {
        const topicGroups = groups.filter((g) => g.topic === topic);
        const studentsToAssign = studentAssignments.filter((a) =>
            a.getUnassignedTopics().includes(topic)
        );
        const groupAssignmentsTracker = new GroupAssignmentsTracker(
            topicGroups
        );

        // TODO: start with who has the least times available
        studentsToAssign.forEach((assignment) => {
            const timesAvailable = assignment.getUnassignedTimes();
            const group = groupAssignmentsTracker.addStudentToGroup(
                assignment.student,
                timesAvailable
            );
            assignment.assignGroup(group);
        });
        groupAssignments.push(...groupAssignmentsTracker.getGroupAssignments());
    });

    return {
        studentAssignments: studentAssignments,
        groupAssignments: groupAssignments,
    };
}
