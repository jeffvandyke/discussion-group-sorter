import _ from "lodash";
import { assignStudentsToGroups } from "./src/algorithm";
import { readFromFile } from "./src/import";
import { displayStudent, Gender, Grade } from "./src/student";
import { Time } from "./src/types";
import { StudentAssignment } from "./src/assignments";

const times: Time[] = ["Tues", "Wed", "Thurs"];

const allGrades = [Grade.Ten, Grade.Eleven, Grade.Twelve, Grade.PostHigh];

function checkStudentAssignmentTopics(asmts: StudentAssignment[]) {
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

(async () => {
    const spreadsheetFilename = process.argv[2];
    if (!spreadsheetFilename)
        throw new Error("Usage: node ./main.js input-file-name.[xlsx|csv]");
    const { students, topics } = await readFromFile(spreadsheetFilename);

    const { studentAssignments, groupAssignments } = assignStudentsToGroups(
        students,
        topics,
        times
    );

    checkStudentAssignmentTopics(studentAssignments);

    // console.log(
    //     "grade counts:",
    //     Object.entries(_.groupBy(students, "grade")).map(([k, v]) => [
    //         k,
    //         v.length,
    //     ])
    // );
    // console.log(
    //     "gender counts:",
    //     Object.entries(_.groupBy(students, "gender")).map(([k, v]) => [
    //         k,
    //         v.length,
    //     ])
    // );

    // console.log(JSON.stringify(
    //     studentAssignments.map((sa) => ({
    //         // student: displayStudent(sa.student),
    //         groups: times.map((t) => "'" + sa.assignments[t].groupName + "'").join(' '),
    //         topics: Object.values(sa.assignments).map(a => a.topic)
    //     }))
    //     , null, 2)
    // );

    // console.log(
    //     "All letters",
    //     studentAssignments
    //         .map((sa) =>
    //             times.map((t) => sa.assignments[t].groupName).join(" ")
    //         )
    //         .join("\n")
    // );

    // console.log('Group assignment breakdowns:',
    //     groupAssignments.map((g) => ({
    //         group: `${g.group.id} ${g.group.topic}`,
    //         gropeSize: g.students.length,
    //         // students: g.students.map(displayStudent),
    //         // studentOverview: g.students.map(s => `${s.gender}-${s.grade}`).join(' '),
    //         maleToFemale: [Gender.Male, Gender.Female]
    //             .map(
    //                 (gender) =>
    //                     g.students.filter((s) => s.gender === gender).length
    //             )
    //             .join(":"),
    //         gradeCounts: allGrades
    //             .map(
    //                 (grade) =>
    //                     `${grade}: ${
    //                         g.students.filter((s) => s.grade === grade).length
    //                     }`
    //             )
    //             .join(", "),
    //         // students: g.students.map(displayStudent),
    //     }))
    // );

    // console.log(
    //     "Topic breakdown",
    //     topics.map((topic) => {
    //         const studentsChoosingTopic = students.filter((s) =>
    //             s.chosenTopics.includes(topic)
    //         );
    //         return {
    //             topic,
    //             numberOfGroups: groupAssignments.map(ga => ga.group)
    //                 .filter(g => g.topic === topic).length,
    //             maleToFemale: [Gender.Male, Gender.Female]
    //                 .map(
    //                     (gender) =>
    //                         studentsChoosingTopic.filter(
    //                             (s) => s.gender === gender
    //                         ).length
    //                 )
    //                 .join(":"),
    //             gradeCounts: allGrades
    //                 .map(
    //                     (grade) =>
    //                         `${grade}: ${
    //                             studentsChoosingTopic.filter(
    //                                 (s) => s.grade === grade
    //                             ).length
    //                         }`
    //                 )
    //                 .join(", "),
    //         };
    //     })
    // );

    console.log("Group count:", groupAssignments.length);
})().then(_.noop, (err) => console.error(err));
