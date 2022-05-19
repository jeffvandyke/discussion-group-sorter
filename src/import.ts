import * as _ from "lodash";
import * as fs from "fs/promises";
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

export async function readFromFile(
    filename: string,
    totalTimes: number
): Promise<{
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
            church: row[4],
            chosenTopics: row[5].split("|").slice(0, 3),
        })
    );

    const topics = [
        ...new Set(students.flatMap((student) => student.chosenTopics)),
    ];

    const invalidTopicStudents = students.filter(
        (s) => s.chosenTopics.length !== totalTimes
    );
    if (invalidTopicStudents.length > 0) {
        // Choose most popular topics
        const topicsByPopularity = _.orderBy(
            topics.map((topic) => ({
                topic,
                count: students.filter((s) => s.chosenTopics.includes(topic))
                    .length,
            })),
            "count",
            "desc"
        );

        invalidTopicStudents.forEach((s) => {
            while (s.chosenTopics.length < totalTimes) {
                const mostPopularNewTopic = topicsByPopularity.filter(
                    (p) => !s.chosenTopics.includes(p.topic)
                )[0].topic;
                console.warn(
                    `Student ${s.firstName} ${s.lastName} has too few topics, adding topic "${mostPopularNewTopic}"`
                );
                (s.chosenTopics as string[]).push(mostPopularNewTopic);
            }
        });
    }

    return {
        students,
        topics,
    };
}
