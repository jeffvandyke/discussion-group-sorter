import { Topic } from "./types";

export type StudentId = number & { _type: "StudentId" };

export enum Gender {
    Male = "M",
    Female = "F",
}

// TODO: make flexible
export enum Grade {
    Ten = "10th",
    Eleven = "11th",
    Twelve = "12th",
    PostHigh = "Post High",
}

export type Student = {
    readonly id: StudentId;
    readonly lastName: string;
    readonly firstName: string;
    /** Marker to avoid dups, unused... */
    readonly suffix?: string;
    readonly gender: Gender;
    readonly grade: Grade;
    /** 3 for this problem */
    readonly chosenTopics: ReadonlyArray<Topic>;
};

export function displayStudent(s: Student) {
    return `${s.firstName} ${s.lastName} (${s.gender}, ${s.grade})`;
}

export function displayStudentTraits(s: Student) {
    return `${s.gender}, ${s.grade}`;
}

export function displayStudentLastFirst(s: Student) {
    return `${s.lastName}, ${s.firstName}`;
}

const makeId = (() => {
    let nextId = 1;
    return () => nextId++ as StudentId;
})();

type StudentInput = Omit<Student, "id" | "gender" | "grade"> & {
    gender: string;
    grade: string;
};

export function makeStudent(input: StudentInput): Student {
    function parseGrade(grade: string): Grade {
        const normal = grade.trim().toLowerCase();
        if (normal.includes("post") && normal.includes("high"))
            return Grade.PostHigh;
        if (normal === "10") return Grade.Ten;
        if (normal === "11") return Grade.Eleven;
        if (normal === "12") return Grade.Twelve;
        throw new Error(`Unparsable grade: "${grade}"`);
    }

    return {
        id: makeId(),
        ...input,
        gender: input.gender.toLowerCase().includes("female")
            ? Gender.Female
            : Gender.Male,
        grade: parseGrade(input.grade),
    };
}
