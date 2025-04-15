import cs from "./cs.json" with { type: "json" };

const dictionaries = { cs };

export const getDictionary = (locale = "cs" as const) => dictionaries[locale];
