import * as fs from "fs/promises";
import * as _ from "lodash";
import faker, { GenderType } from "@faker-js/faker";

const outFilename = "examples/sample-input.csv";

faker.seed(100);

const topics = [
    "Doubt and Assurance",
    "Worldly Culture & the Antithesis",
    "Anxiety",
    "Bullying",
    "Personal Devotions",
    "Godly Friends",
    "Social Media",
    "Vocations",
];

const grades = ["10", "11", "12", "Post High School"];

const churches = [
    "Zion",
    "Faith",
    "Hope",
    "Grace",
    "First",
    "Harvest",
    "Peace",
    "Unity",
    "Trinity",
];

const students = _.times(100, () => {
    const gender = faker.name.gender(true);
    return [
        faker.name.firstName(gender.toLowerCase() as GenderType),
        faker.name.lastName(gender.toLowerCase() as GenderType),
        gender,
        _.sample(grades),
        _.sample(churches),
        _.sampleSize(topics, 3).join("|"),
    ];
});

(async () => {
    const header = [
        "First Name",
        "Last Name",
        "Gender",
        "Grade",
        "Church",
        "Chosen Topics",
    ];
    const csv = [header.join(","), ...students.map((s) => s.join(","))].join(
        "\n"
    );
    await fs.writeFile(outFilename, csv);
})();
