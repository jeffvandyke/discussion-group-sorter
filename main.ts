import _ from "lodash";
import { assignStudentsToGroups } from "./src/algorithm";
import { readFromFile } from "./src/import";
import { displayStudent, Gender, Grade } from "./src/student";
import { Time } from "./src/types";
import {
    checkStudentAssignmentTopics,
    StudentAssignment,
} from "./src/assignments";
import * as reports from "./src/reports";
import * as output from "./src/output";

const times: Time[] = ["Tues", "Wed", "Thurs"];

const grades = [Grade.Ten, Grade.Eleven, Grade.Twelve, Grade.PostHigh];

const parameters = {
    times,
    grades,
};

(async () => {
    const spreadsheetFilename = process.argv[2];
    if (!spreadsheetFilename)
        throw new Error("Usage: node ./main.js input-file-name.[xlsx|csv]");
    const { students, topics } = await readFromFile(spreadsheetFilename);

    const assignments = assignStudentsToGroups(students, topics, times);
    checkStudentAssignmentTopics(assignments.studentAssignments);

    const reportParams = [assignments, parameters] as const;

    console.log("Overview: ", reports.overview(assignments));

    output.writeXlsx("Discussion Groups Sorted.xlsx", [
        // ["Group Index", reports.groupIndex(...reportParams)],
        ...reports
            .programSheets(...reportParams)
            .map<[string, string[][]]>((v) => [`${v.time} Groups`, v.cells]),
        ["Wristbands", reports.studentWristbands(...reportParams)],
        ["Topic Breakdown", reports.topicBreakdown(...reportParams)],
    ]);

    // console.log('Group assignment breakdowns:',
    //     reports.groupBreakdowns(...reportParams).flat().flat());
})().then(_.noop, (err) => console.error(err));
