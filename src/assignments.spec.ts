import faker from "@faker-js/faker";
import { StudentAssignment } from "./assignments";
import { makeGroup } from "./group";
import { makeStudent } from "./student";

describe("StudentAssignment", () => {
    const sampleStudent = makeStudent({
        lastName: faker.name.lastName(),
        firstName: faker.name.firstName(),
        gender: "Male",
        grade: "10",
        chosenTopics: ["Apples", "Bananas", "Cherry"],
    });

    const emptyAssignment = new StudentAssignment(sampleStudent, [
        "Tues",
        "Wed",
        "Thurs",
    ]);
    const partialAssignment = new StudentAssignment(sampleStudent, {
        Tues: null,
        Wed: makeGroup("Apples", "Wed"),
        Thurs: null,
    });
    const fullAssignment = new StudentAssignment(sampleStudent, {
        Tues: makeGroup("Bananas", "Tues"),
        Wed: makeGroup("Apples", "Wed"),
        Thurs: makeGroup("Cherry", "Thurs"),
    });

    test("getUnassignedTimes", () => {
        expect(emptyAssignment.getUnassignedTimes()).toEqual([
            "Tues",
            "Wed",
            "Thurs",
        ]);
        expect(partialAssignment.getUnassignedTimes()).toEqual([
            "Tues",
            "Thurs",
        ]);
        expect(fullAssignment.getUnassignedTimes()).toEqual([]);
    });

    test("getUnassignedTopics", () => {
        expect(emptyAssignment.getUnassignedTopics()).toEqual([
            "Apples",
            "Bananas",
            "Cherry",
        ]);
        expect(partialAssignment.getUnassignedTopics()).toEqual([
            "Bananas",
            "Cherry",
        ]);
        expect(fullAssignment.getUnassignedTopics()).toEqual([]);
    });
});
