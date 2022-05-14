import { readFromCsv } from "./src/import";
import { Time } from './src/types';
import {makeTopicsTable} from "./src/topics";

const times: Time[] = ['Tues', 'Wed', 'Thurs'];

(async () => {
    const csvFilename = process.argv[2];
    if (!csvFilename)
        throw new Error("Usage: node ./main.js csv-file-name.csv");
    const { students, topics } = await readFromCsv(csvFilename);
    const topicsByPopularity = topics.map((t) => ({
        topic: t,
        count: students
            .map((s) => s.chosenTopics.filter((tt) => tt === t).length)
            .reduce((l, r) => l + r, 0),
    })).sort((a, b) => a.count - b.count);

    // console.log({
    //     topicsByPopularity,
    //     sum: topicsByPopularity.reduce((prev, { count }) => prev + count, 0)
    // });

    const topicsTable = makeTopicsTable(topicsByPopularity, times);

    console.log(topicsTable);
})().then(
    () => console.log("done"),
    (err) => console.error(err)
);
