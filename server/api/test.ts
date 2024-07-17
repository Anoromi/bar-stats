import * as z from 'zod'


const requestQuery = z.object({
  user: z.string().optional()
})


export type TestRequestQuery = z.infer<typeof requestQuery>



export default defineEventHandler<{
  query: TestRequestQuery
}, Promise<{hello: string}>>(
  async (event) => {
  let j = requestQuery.parse(getQuery(event))


  return {
    hello: 'hello ' + (j.user ?? 'hehe')
  }
})