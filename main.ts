import _ from "lodash";
import { readFromCsv } from "./src/import";
import { Time } from "./src/types";
import { makeTopicGroups } from "./src/topics";
import { makeEmptyAssignments } from "./src/assignments";

const times: Time[] = ["Tues", "Wed", "Thurs"];

(async () => {
    const csvFilename = process.argv[2];
    if (!csvFilename)
        throw new Error("Usage: node ./main.js csv-file-name.csv");
    const { students, topics } = await readFromCsv(csvFilename);
    const topicsByPopularity = topics
        .map((t) => ({
            topic: t,
            count: students
                .map((s) => s.chosenTopics.filter((tt) => tt === t).length)
                .reduce((l, r) => l + r, 0),
        }))
        .sort((a, b) => a.count - b.count);

    const groups = makeTopicGroups(topicsByPopularity, times);

    const randomizedStudents = _.sortBy(students, Math.random);

    const studentAssignments = makeEmptyAssignments(randomizedStudents, times);

    console.log(studentAssignments.map((a) => a.assignments));
})().then(_.noop, (err) => console.error(err));
