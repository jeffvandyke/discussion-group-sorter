import fs from "fs/promises";
import { parse } from "csv-parse/sync";
import { makeStudent, Student } from "./student";
import { Topic } from "./types";

export async function readFromCsv(file: string): Promise<{
    students: Student[];
    topics: Topic[];
}> {
    const txt = await fs.readFile(file, "utf-8");
    const records: string[][] = parse(txt).slice(1);
    const students: Student[] = records.map((row) =>
        makeStudent({
            lastName: row[0],
            firstName: row[1],
            gender: row[2],
            grade: row[3],
            chosenTopics: [row[4], row[5], row[6]],
        })
    );

    const topics = [
        ...new Set(records.flatMap((row) => [row[4], row[5], row[6]])),
    ];

    return {
        students,
        topics,
    };
}
