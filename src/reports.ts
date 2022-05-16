import _ from "lodash";

import { Assignments } from "./assignments";
import { Time } from "./types";
import {
    displayStudent,
    displayStudentLastFirst,
    displayStudentTraits,
    Gender,
    Grade,
    Student,
} from "./student";

type Params = {
    times: Time[];
    grades: Grade[];
};

export function overview({
    studentAssignments,
    groupAssignments,
}: Assignments) {
    const students = studentAssignments.map((a) => a.student);
    const groups = groupAssignments.map((g) => g.group);
    const topics = [...new Set(groups.map((g) => g.topic))];

    const countTotals = (groups: Record<string, any[]>) =>
        Object.entries(groups).reduce<Record<string, number>>(
            (prev, [k, v]) => ({
                ...prev,
                [k]: v.length,
            }),
            {}
        );

    return {
        students: {
            totalStudents: students.length,
            gradeTotals: countTotals(_.groupBy(students, "grade")),
            genderTotals: countTotals(_.groupBy(students, "gender")),
        },
        groupTotals: {
            totalGroups: groups.length,
            totalTopics: topics.length,
        },
    };
}

export function allLetters(
    { studentAssignments }: Assignments,
    { times }: Params
) {
    return studentAssignments
        .map((sa) => times.map((t) => sa.assignments[t].groupName).join(" "))
        .join("\n");
}

export function studentWristbands(
    { studentAssignments }: Assignments,
    { times }: Params
): string[][] {
    const data = _.orderBy(
        studentAssignments.map((sa) => ({
            lastName: sa.student.lastName,
            firstName: sa.student.firstName,
            schedule: times.map((t) => sa.assignments[t].groupName).join(", "),
        })),
        ["lastName", "firstName"]
    );
    return [
        ["Last Name", "First Name", "Wristband Schedule"],
        ...data.map((v) => [v.lastName, v.firstName, v.schedule]),
    ];
}

function breakdownStudentStats(students: Student[], grades: Grade[]) {
    return {
        total: students.length,
        genderTotals: [Gender.Male, Gender.Female].map(
            (gender) => students.filter((s) => s.gender === gender).length
        ),
        gradeTotals: grades.map(
            (grade) => students.filter((s) => s.grade === grade).length
        ),
    };
}

export function groupBreakdowns(
    { groupAssignments }: Assignments,
    { times, grades }: Params
) {
    const breakdowns = times.map(
        (time) =>
            [
                time,
                groupAssignments
                    .filter((g) => g.group.time === time)
                    .map((g) => ({
                        name: g.group.groupName,
                        topic: g.group.topic,
                        // studentOverview: g.students.map(s => `${s.gender}-${s.grade}`).join(' '),
                        studentStats: breakdownStudentStats(g.students, grades),
                        students: g.students.map((s) => ({
                            name: displayStudentLastFirst(s),
                            traits: displayStudentTraits(s),
                        })),
                    })),
            ] as const
    );
    return breakdowns;
}

export function programSheets(
    assignments: Assignments,
    params: Params
): { time: Time; cells: string[][] }[] {
    const breakdowns = groupBreakdowns(assignments, params);
    const { grades } = params;

    return breakdowns.map(([time, groups]) => ({
        time,
        cells: [
            [`Groups for ${time}`],
            [],
            ...groups
                .map((g) => [
                    [`${g.name} - ${g.topic}`],
                    [
                        `Size: ${g.studentStats.total}`,
                        // `M:F - ${g.maleToFemale}`,
                        `${g.studentStats.genderTotals[0]} M, ${g.studentStats.genderTotals[1]} F`,
                        ...grades.map(
                            (gd, i) => `${gd}: ${g.studentStats.gradeTotals[i]}`
                        ),
                    ],
                    ...g.students.map((s) => [s.name, "", "", s.traits]),
                    [],
                ])
                .flat(),
        ],
    }));
}

export function topicBreakdown(
    { studentAssignments, groupAssignments }: Assignments,
    { grades }: Params
) {
    const students = studentAssignments.map((sa) => sa.student);
    const topics = _.uniq(students.map((s) => s.chosenTopics).flat());

    const breakdown = _.orderBy(
        topics.map((topic) => {
            const studentsChoosingTopic = students.filter((s) =>
                s.chosenTopics.includes(topic)
            );
            return {
                topic,
                numberOfGroups: groupAssignments
                    .map((ga) => ga.group)
                    .filter((g) => g.topic === topic).length,
                studentStats: breakdownStudentStats(
                    studentsChoosingTopic,
                    grades
                ),
            };
        }),
        "studentStats.total",
        "desc"
    );

    return [
        ["Topic", "Students", "Groups", "Males", "Females", ...grades],
        ...breakdown.map((t) => [
            t.topic,
            t.studentStats.total,
            t.numberOfGroups,
            ...t.studentStats.genderTotals,
            ...t.studentStats.gradeTotals,
        ]),
    ];
}

export function groupIndex(
    { studentAssignments, groupAssignments }: Assignments,
    { times, grades }: Params
): (string | number)[][] {
    const sectionHeader = ["Name", "Topic"];
    const timeSections = times.map((time) => ({
        time,
        groups: groupAssignments
            .filter((ga) => ga.group.time === time)
            .map((ga) => [ga.group.groupName, ga.group.topic]),
    }));
}
