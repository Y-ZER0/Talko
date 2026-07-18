export const searchKeys = {
  all: ["search"] as const,
  list: (query: string) => [...searchKeys.all, "list", query] as const,
};
