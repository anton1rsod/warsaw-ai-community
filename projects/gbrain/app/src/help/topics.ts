export const TOPIC_BLURBS: Record<string, { name: string; blurb: string }> = {
  general: {
    name: "General",
    blurb: "Casual chat and announcements. Tag #kb to archive a message; you'll get a DM to confirm."
  },
  qa: {
    name: "Questions & Answers",
    blurb: "Ask the community. Tag #kb on great answers to make them findable via /ask."
  },
  guides: {
    name: "Guides",
    blurb: "Long-form how-to content. Auto-archived after 48h unless tagged #skip."
  },
  meetups: {
    name: "Meetups",
    blurb: "Event announcements + recap. Auto-archived; ask /ask 'when's the next meetup?'."
  },
  projects: {
    name: "Projects & Repos",
    blurb: "Member projects and repos. Auto-archived; great input for /search."
  },
  news: {
    name: "News & Signals",
    blurb: "Daily digest source. Auto-archived; daily digest summarizes new items at 09:00 Warsaw time."
  },
  tools: {
    name: "Tools & Stacks",
    blurb: "Tool recommendations and stack discussions. Auto-archived."
  },
  pitches: {
    name: "Builds & Pitches",
    blurb: "Member shipping and pitch decks. Auto-archived."
  }
};
