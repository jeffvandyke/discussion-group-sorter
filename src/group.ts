import { Topic, Time } from "./types";

type GroupId = string;
type GroupName = string;

export type Group = {
    readonly id: GroupId;
    readonly groupName: GroupName;
    readonly topic: Topic;
    readonly time: Time;
};

// Grows when a new time is asked
const letterIdsPerTime = {};

const letters = Array.from(Array(26)).map((_, i) =>
    String.fromCharCode("A".charCodeAt(0) + i)
);

const groupIds = letters.concat(letters.map(l => l + l));

function makeGroupNamePerTime(time: string): GroupName {
    if (!(time in letterIdsPerTime)) {
        letterIdsPerTime[time] = 0;
    }
    const id = groupIds[letterIdsPerTime[time]];
    letterIdsPerTime[time] += 1;
    return id;
}

export function makeGroup(topic: string, time: Time): Group {
    const groupName = makeGroupNamePerTime(time);
    return {
        id: `${time}-${groupName}`,
        groupName,
        topic,
        time,
    };
}
