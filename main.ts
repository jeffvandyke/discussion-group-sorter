import _ from "lodash";
import { assignStudentsToGroups } from "./src/algorithm";
import { readFromCsv } from "./src/import";
import { Time } from "./src/types";

const times: Time[] = ["Tues", "Wed", "Thurs"];

(async () => {
    const csvFilename = process.argv[2];
    if (!csvFilename)
        throw new Error("Usage: node ./main.js csv-file-name.csv");
    const { students, topics } = await readFromCsv(csvFilename);

    const studentAssignments = assignStudentsToGroups(students, topics, times);

    console.log(studentAssignments.map((a) => a.assignments));
})().then(_.noop, (err) => console.error(err));
