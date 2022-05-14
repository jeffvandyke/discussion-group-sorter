import { Topic, Time } from "./types";

type GroupId = string;
type Slot = string;

export type Group = {
    id: GroupId;
    slot: Slot;
    topic: Topic;
    time: Time;
};

// Grows when a new time is asked
const letterIdsPerTime = {};

const letters = Array.from(Array(26)).map((_, i) =>
    String.fromCharCode("A".charCodeAt(0) + i)
);

const groupIds = letters.concat(letters.map(l => l + l));

function makeSlotPerTime(time: string): Slot {
    if (!(time in letterIdsPerTime)) {
        letterIdsPerTime[time] = 0;
    }
    const id = groupIds[letterIdsPerTime[time]];
    letterIdsPerTime[time] += 1;
    return id;
}

export function makeGroup(topic: string, time: Time): Group {
    const slot = makeSlotPerTime(time);
    return {
        id: `${time}-${slot}`,
        slot,
        topic,
        time,
    };
}
