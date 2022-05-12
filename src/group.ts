import { Topic, Time } from "./types";

type GroupId = string;

export type Group = {
    id: GroupId;
    topic: Topic;
    time: Time;
};
