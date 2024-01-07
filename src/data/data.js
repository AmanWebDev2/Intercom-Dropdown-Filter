//const comparison = new Map([["eq","is"],["ne","is not"],["starts_with","starts with"],["ends_with","ends with"],["contains","contains"],["contains_exact_word","contains exact word"],["not_contains","does not contain"],["unknown","is unknown"],["known","has any value"]])
const dropdownMenu = [
  {
    attribute: "last_visited_url",
    comparison: [
      { eq: "is" },
      { ne: "is not" },
      { starts_with: "starts with" },
      { ends_with: "ends with" },
      { contains: "contains" },
      { not_contains: "does not contains" },
      { contains_exact_word: "contains exact word" },
      { unknown: "is unknown" },
      { known: "has any value" },
    ],
    type: "string"
  },
  {
    attribute: "time_on_current_page",
    comparison: [{ eq: "is equal to" }],
    type: "duration_integer"
  },
];

const attributes = [
  {
    attribute: "last_visited_url",
    readable: "Current page URL",
    type: "string",
    value: "",
  },

  {
    attribute: "time_on_current_page",
    readable: "Time on current page", 
    type: "duration_integer",
    value: "",
  },
];

export { attributes,dropdownMenu };
