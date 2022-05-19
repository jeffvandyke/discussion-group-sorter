import * as _ from "lodash";
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

if (!global.performance) {
    global.performance = Date as any;
}

let tStart = performance.now();
const getMsTime = () => (-tStart + (tStart = performance.now())).toFixed(3);

const begin = (txt: string) => process.stdout.write(`${txt}... `);
const done = () => process.stdout.write(`DONE (${getMsTime()} ms)\n`);

(async () => {
    const spreadsheetFilename = process.argv[2];
    const outFilename = process.argv[3];
    if (!spreadsheetFilename || !outFilename)
        throw new Error(
            "Usage: node ./main.js input-file-name.[xlsx|csv] output-filename.xlsx"
        );
    begin("Reading");

    const { students, topics } = await readFromFile(
        spreadsheetFilename,
        times.length
    );
    done();

    begin(`Assigning`);
    const assignments = assignStudentsToGroups(students, topics, times);
    done();

    begin(`Checking`);
    checkStudentAssignmentTopics(assignments.studentAssignments);
    const reportParams = [assignments, parameters] as const;
    done();

    begin(`Building reports`);
    const sheets: output.SheetTuples = [
        ["Group Index", reports.groupIndex(...reportParams)],
        ...reports
            .programSheets(...reportParams)
            .map<[string, string[][]]>((v) => [`${v.time} Groups`, v.cells]),
        ["Wristbands", reports.studentWristbands(...reportParams)],
        ["Topic Breakdown", reports.topicBreakdown(...reportParams)],
    ];

    // // Check duplicate students
    //
    // const wristbands = reports.studentWristbands(...reportParams);
    // console.log(
    //     JSON.stringify(
    //         Object.entries(
    //             _.groupBy(wristbands, (s) =>
    //                 (s[0] + s[1]).toLowerCase().replace(" ", "")
    //             )
    //         ).filter(([k, v]) => v.length > 1),
    //         null,
    //         2
    //     )
    // );

    done();
    begin(`Saving Excel file`);
    output.writeXlsx(outFilename, sheets);
    done();

    console.log("Overview: ", reports.overview(...reportParams));
})().then(_.noop, (err) => console.error(err));
