import { z } from "zod"


const result = z.array(
  z.object({
    id: z.number(),
    username: z.string(),
    countryCode: z.string().nullable()
  })
)

export default defineCachedEventHandler<any, Promise<z.infer<typeof result>>>(async (event) => {
  const response = result.parse(await $fetch('https://api.bar-rts.com/cached-users'))
  response.sort((a, b) => a.username.localeCompare(b.username))
  return response
}, {
  maxAge: 60 * 60
})