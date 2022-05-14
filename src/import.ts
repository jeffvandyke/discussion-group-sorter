import fs from "fs/promises";
import { parse } from "csv-parse/sync";
import * as Xlsx from "xlsx";
import { makeStudent, Student } from "./student";
import { Topic } from "./types";

function parseCsv(csvString: string) {
    const records: string[][] = parse(csvString).slice(1);
    return records;
}

async function readCsv(filename: string) {
    const txt = await fs.readFile(filename, "utf-8");
    return parseCsv(txt);
}

function readXlsx(filename: string) {
    const workbook = Xlsx.readFile(filename);
    const sheet1 = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheet1];
    const sheetCsv = Xlsx.utils.sheet_to_csv(sheet);
    return parseCsv(sheetCsv);
}

export async function readFromFile(filename: string): Promise<{
    students: Student[];
    topics: Topic[];
}> {
    const records: string[][] = filename.endsWith(".csv")
        ? await readCsv(filename)
        : readXlsx(filename);
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
