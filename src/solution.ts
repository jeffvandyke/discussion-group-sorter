import { Student } from "./student";
import { Group } from "./group";
import { Time } from "./types";

export type Solution = {
    times: Array<{
        time: Time;
        groups: Array<{
            group: Group;
            students: Array<Student>;
        }>;
    }>;
};

export function cost(/* s: Solution */) {
    // - Group counts
    // - Even distribution
    return 1;
}
