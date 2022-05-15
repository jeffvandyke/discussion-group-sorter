import _ from "lodash";
import { Group } from "./group";
import { Gender, Grade, Student } from "./student";
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

    assignGroup(group: Group) {
        const { time } = group;
        if (this.assignments[time] != null) {
            throw new Error(
                "The group time is already assigned to this student"
            );
        }
        this.assignments[time] = group;
    }
}

export function makeEmptyStudentAssignments(
    students: Student[],
    times: Time[]
): StudentAssignment[] {
    return students.map((student) => new StudentAssignment(student, times));
}

export class GroupAssignment {
    constructor(group: Group) {
        this.group = group;
    }

    private readonly _students: Student[] = [];

    readonly group: Group;
    get students() {
        return this._students;
    }
    get numAssigned() {
        return this._students.length;
    }

    getGenderCount(gender: Gender) {
        return this._students.filter((s) => s.gender === gender).length;
    }

    getGradeCount(grade: Grade) {
        return this._students.filter((s) => s.grade === grade).length;
    }

    addStudent(student: Student) {
        this._students.push(student);
    }
}

/** Asserts that all the groups a student is
 * assigned to match with their chosen topics */ 
export function checkStudentAssignmentTopics(asmts: StudentAssignment[]) {
    asmts.forEach((asmt) => {
        if (
            !_.isEqual(
                _.sortBy(asmt.student.chosenTopics),
                _.sortBy(Object.values(asmt.assignments).map((v) => v.topic))
            )
        ) {
            throw new Error(
                `Topics assigned do not match chosen: ${JSON.stringify(asmt)}`
            );
        }
    });
}

export type Assignments = {
    studentAssignments: StudentAssignment[];
    groupAssignments: GroupAssignment[];
};
