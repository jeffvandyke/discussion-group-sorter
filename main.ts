import { readFromCsv } from "./src/import";

(async () => {
    const csvFilename = process.argv[2];
    if (!csvFilename) throw new Error('Usage: node ./main.js csv-file-name.csv');
    const records = await readFromCsv(csvFilename);
    console.log(records);
})().then(
    () => console.log("done"),
    (err) => console.error(err)
);
