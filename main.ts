import _ from "lodash";
import { assignStudentsToGroups } from "./src/algorithm";
import { readFromCsv } from "./src/import";
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
    const csvFilename = process.argv[2];
    if (!csvFilename)
        throw new Error("Usage: node ./main.js csv-file-name.csv");
    const { students, topics } = await readFromCsv(csvFilename);

    const { studentAssignments, groupAssignments } = assignStudentsToGroups(
        students,
        topics,
        times
    );

    checkStudentAssignmentTopics(studentAssignments);

    console.log(
        studentAssignments.map((sa) => ({
            student: displayStudent(sa.student),
            groups: times.map((t) => sa.assignments[t].groupName),
        }))
    );

    console.log(
        groupAssignments.map((g) => ({
            group: `${g.group.id} ${g.group.topic}`,
            gropeSize: g.students.length,
            maleToFemale: [Gender.Male, Gender.Female]
                .map(
                    (gender) =>
                        g.students.filter((s) => s.gender === gender).length
                )
                .join(":"),
            gradeCounts: allGrades
                .map(
                    (grade) =>
                        `${grade}: ${
                            g.students.filter((s) => s.grade === grade).length
                        }`
                )
                .join(", "),
            // students: g.students.map(displayStudent),
        }))
    );
})().then(_.noop, (err) => console.error(err));
