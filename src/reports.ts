import * as _ from "lodash";

import { Assignments } from "./assignments";
import { Time } from "./types";
import {
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

export function overview(
    { studentAssignments, groupAssignments }: Assignments,
    { times, grades }: Params
) {
    const students = studentAssignments.map((a) => a.student);
    const groups = groupAssignments.map((g) => g.group);
    const topics = [...new Set(groups.map((g) => g.topic))];

    const studentStats = breakdownStudentStats(students, grades);

    return {
        students: {
            total: studentStats.total,
            genderTotals: {
                Males: studentStats.genderTotals[0],
                Females: studentStats.genderTotals[1],
            },
            gradeTotals: Object.fromEntries(
                grades.map((grade, i) => [grade, studentStats.gradeTotals[i]])
            ),
        },
        groupTotals: {
            totalGroups: groups.length,
            timeTotals: Object.fromEntries(
                times.map((t) => [
                    t,
                    groupAssignments.filter((g) => g.group.time === t).length,
                ])
            ),
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
                    [g.name, g.topic],
                    [
                        `Size: ${g.studentStats.total}`,
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
    assignments: Assignments,
    params: Params
): (string | number)[][] {
    const { groupAssignments } = assignments;
    const { times, grades } = params;

    const ovData = overview(assignments, params);

    const overviewTable = [
        ["Students", ovData.students.total],
        [
            "Males",
            ovData.students.genderTotals.Males,
            "Females",
            ovData.students.genderTotals.Females,
        ],
        Object.entries(ovData.students.gradeTotals).flat(),
        [],
        ["Groups", ovData.groupTotals.totalGroups],
        Object.entries(ovData.groupTotals.timeTotals).flat(),
        [],
        ["Topics", ovData.groupTotals.totalTopics],
    ];

    // Groups

    const groupsHeader = [
        "Name",
        "Topic",
        "Students",
        "Males",
        "Females",
        ...grades,
    ];
    const timeSections = times.map((time) => ({
        time,
        groups: groupAssignments
            .filter((ga) => ga.group.time === time)
            .map((ga) => {
                const stats = breakdownStudentStats(ga.students, grades);
                return [
                    ga.group.groupName,
                    ga.group.topic,
                    stats.total,
                    ...stats.genderTotals, // X 2
                    ...stats.gradeTotals, // X 4
                ];
            }),
    }));

    return [
        ...overviewTable,
        [],
        [],
            ["Group Schedule"],
            [],
            ..._.zip(...timeSections
                .map((ts) => [
                    [`Groups for ${ts.time}`, '', '', ''],
                    // ['', '', '', ''],
                    ["Name", "Topic", "Size", ''],
                    ...ts.groups.map(g => [...g.slice(0, 3), '']),
                ]))
                .map(rowColSet => rowColSet.flat()),
            [],
            [],
            ["Groups in topic order"],
            [],
            [groupsHeader[0], "Time", ...groupsHeader.slice(1)],
            ..._.zip(
                ...timeSections.map(({ time, groups }) =>
                                    groups.map((g) => [g[0], time, ...g.slice(1)])
                                   )
            ).flat(),
    ];
}
