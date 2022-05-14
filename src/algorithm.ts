import _ from "lodash";
import { makeTopicGroups } from "./topics";
import {
    GroupAssignment,
    makeEmptyStudentAssignments,
    StudentAssignment,
} from "./assignments";
import { Student } from "./student";
import { Topic, Time } from "./types";
// import FastPriorityQueue from "fastpriorityqueue";
import { Group } from "./group";

class GroupAssignmentsTracker {
    constructor(groups: Group[]) {
        this.groupAssignments = groups.map((g) => new GroupAssignment(g));
        this.originalOrder = groups.map((g) => g.id);
    }

    private originalOrder: string[];

    // Maintain sorted with fewest assignees first
    private groupAssignments: GroupAssignment[];

    private sortCounts() {
        this.groupAssignments.sort((a, b) => a.numAssigned - b.numAssigned);
    }

    getGroupAssignments() {
        return this.originalOrder.map((id) =>
            this.groupAssignments.find((g) => g.group.id === id)
        );
    }

    /** Assigns group within the times allowed to assign to */
    addStudentToGroup(student: Student, candidates: Time[]) {
        // Use first match - list is sorted
        const foundAssignment = this.groupAssignments.find((g) =>
            candidates.includes(g.group.time)
        );
        foundAssignment.addStudent(student);
        this.sortCounts();
        return foundAssignment.group;
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

type Results = {
    studentAssignments: StudentAssignment[];
    groupAssignments: GroupAssignment[];
};

export function assignStudentsToGroups(
    students: Student[],
    allTopics: Topic[],
    times: Time[]
): Results {
    const topicsByPopularity = allTopics
        .map((t) => ({
            topic: t,
            count: students
                .map((s) => s.chosenTopics.filter((tt) => tt === t).length)
                .reduce((l, r) => l + r, 0),
        }))
        .sort((a, b) => a.count - b.count);

    const groups = makeTopicGroups(topicsByPopularity, times);

    const randomizedStudents = _.sortBy(students, Math.random);
    const studentAssignments = makeEmptyStudentAssignments(
        randomizedStudents,
        times
    );

    const groupAssignments = [];

    // Start with most restrictive (fewest groups)
    topicsByPopularity.slice(0, 1 /* WIP */).forEach(({ topic }) => {
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
