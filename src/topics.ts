import { Group, makeGroup } from "./group";
import { Time } from "./types";

function groupCountFromTotal(n: number): number {
    // TODO: parameterize ideal group size
    return Math.round((n + 10) / 17.5);
}

export type TopicsByCount = {
    topic: string;
    count: number;
}[];

export function makeTopicGroups(topicsByCount: TopicsByCount, times: Time[]): Group[] {
    const topicGroups = [];
    let timeIndex = 0;

    for (const { topic, count } of topicsByCount) {
        const totalGroups = groupCountFromTotal(count);
        for (let i = 0; i < totalGroups; i++) {
            topicGroups.push(
                makeGroup(topic, times[timeIndex++ % times.length])
            );
        }
    }

    return topicGroups;
}
