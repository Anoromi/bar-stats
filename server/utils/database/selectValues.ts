import { sql } from "drizzle-orm"
import { SQLiteAsyncDialect } from "drizzle-orm/sqlite-core"



export function selectValues(columnNames: string[], values: unknown[][]) {
  
  const parsedArray = sql.join(values.map(v => sql`(${sql.join(v.map(x => sql`${x}`), sql`,`)})`), sql`,`)

  const dialect = new SQLiteAsyncDialect()
  console.log(dialect.sqlToQuery(parsedArray))
  
  const renamedColumns = sql.raw(columnNames.map((v, i) => `column${i + 1} as ${v}`).join(','))
  
  const query = sql`(select ${renamedColumns} from (values ${parsedArray}))`
  return query
}
