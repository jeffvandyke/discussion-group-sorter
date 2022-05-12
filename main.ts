import { readFromCsv } from "./src/import";

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
    })).sort((a, b) => b.count - a.count);
    console.log({
        topicsByPopularity,
        sum: topicsByPopularity.reduce((prev, { count }) => prev + count, 0)
    });
})().then(
    () => console.log("done"),
    (err) => console.error(err)
);
