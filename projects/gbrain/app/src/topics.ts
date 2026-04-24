import type { TopicClass } from "./types";
import { loadConfig } from "./config";

export interface TopicInfo {
  id: number;
  name: string;
  class: TopicClass;
}

export function buildTopicMap(
  cfg = loadConfig()
): Map<number, TopicInfo> {
  const t = cfg.topics;
  const entries: Array<[number | undefined, string, TopicClass]> = [
    [t.generalId, "General", "casual"],
    [t.qaId, "Questions & Answers", "casual"],
    [t.guidesId, "Guides", "formal"],
    [t.meetupsId, "Meetups", "formal"],
    [t.projectsId, "Projects & Repos", "formal"],
    [t.newsSignalsId, "News & Signals", "formal"],
    [t.toolsId, "Tools & Stacks", "formal"],
    [t.pitchesId, "Builds & Pitches", "formal"]
  ];
  const map = new Map<number, TopicInfo>();
  for (const [id, name, klass] of entries) {
    if (typeof id === "number") map.set(id, { id, name, class: klass });
  }
  return map;
}
