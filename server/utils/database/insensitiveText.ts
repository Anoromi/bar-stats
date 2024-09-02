import { customType } from "drizzle-orm/sqlite-core";

export const insensitiveText = customType<{
  data: string;
  notNull: true;
  default: true;
}>({
  dataType() {
    return `text COLLATE NOCASE`;
  },
});
