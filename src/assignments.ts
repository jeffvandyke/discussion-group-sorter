import _ from "lodash";
import { Group } from "./group";
import { Student } from "./student";
import { Time } from "./types";

type GroupAssignments = {
    [key: Time]: Group | null;
};

export class StudentAssignment {
    /** Creates an assignment from students, and either empty time slots
     * or a pre-filled assignment */
    constructor(student: Student, assignmentsArg: GroupAssignments | Time[]) {
        this.student = student;
        this.assignments = _.isArray(assignmentsArg)
            ? assignmentsArg.reduce((prev, t) => {
                  prev[t] = null;
                  return prev;
              }, {})
            : assignmentsArg;
    }

    readonly student: Student;
    // One assignment for every time available
    assignments: GroupAssignments;

    getUnassignedTimes() {
        return Object.entries(this.assignments)
            .filter(([_, v]) => v == null)
            .map(([k, _]) => k);
    }

    getUnassignedTopics() {
        return this.student.chosenTopics.filter(
            (t) => !Object.values(this.assignments).some((o) => o?.topic === t)
        );
    }
}

export function makeEmptyAssignments(
    students: Student[],
    times: Time[]
): StudentAssignment[] {
    return students.map((student) => new StudentAssignment(student, times));
}
