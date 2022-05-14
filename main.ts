import _ from "lodash";
import { assignStudentsToGroups } from "./src/algorithm";
import { readFromCsv } from "./src/import";
import { displayStudent } from "./src/student";
import { Time } from "./src/types";

const times: Time[] = ["Tues", "Wed", "Thurs"];

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

    console.log(
        groupAssignments.map((g) => ({
            group: g.group,
            students: g.students.map(displayStudent),
        }))
    );
})().then(_.noop, (err) => console.error(err));
