import _ from "lodash";
import { assignStudentsToGroups } from "./src/algorithm";
import { readFromFile } from "./src/import";
import { Grade } from "./src/student";
import { Time } from "./src/types";
import { checkStudentAssignmentTopics } from "./src/assignments";
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
    process.stdout.write("Reading...");

    let tStart = performance.now();
    const getMsTime = () => (-tStart + (tStart = performance.now())).toFixed(3)

    const { students, topics } = await readFromFile(spreadsheetFilename);
    process.stdout.write(` DONE (${getMsTime()} ms)\nAssigning...`);

    const assignments = assignStudentsToGroups(students, topics, times);
    process.stdout.write(` DONE (${getMsTime()} ms)\nChecking...`);
    checkStudentAssignmentTopics(assignments.studentAssignments);

    const reportParams = [assignments, parameters] as const;

    process.stdout.write(` DONE (${getMsTime()} ms)\nBuilding reports...`);
    const sheets: output.SheetTuples = [
        ["Group Index", reports.groupIndex(...reportParams)],
        ...reports
            .programSheets(...reportParams)
            .map<[string, string[][]]>((v) => [`${v.time} Groups`, v.cells]),
        ["Wristbands", reports.studentWristbands(...reportParams)],
        ["Topic Breakdown", reports.topicBreakdown(...reportParams)],
    ];
    process.stdout.write(` DONE (${getMsTime()} ms)\nSaving Excel file...`);
    output.writeXlsx("Discussion Groups Sorted.xlsx", sheets);
    process.stdout.write(` DONE (${getMsTime()} ms)\n`);
    console.log("Overview: ", reports.overview(...reportParams));
})().then(_.noop, (err) => console.error(err));
