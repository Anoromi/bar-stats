import { z } from "zod"

const barCachedUsers = z.array(
  z.object({
    id: z.number().int(),
    username: z.string(),
    countryCode: z.string().nullable()
  })
)

//export const getCachedUsers = defineCachedFunction(async () => {
//  const response = barCachedUsers.parse(await $fetch('https://api.bar-rts.com/cached-users'))
//  const collator = new Intl.Collator(undefined, {
//    sensitivity: 'variant'
//  }).compare
//  response.sort((a, b) => collator(a.username, b.username))
//  console.log('response finished')
//  return response
//}, {
//  maxAge: 60 * 60,
//  name: 'cached-users',
//
//})


export async function getCachedUsers() {
  const response = barCachedUsers.parse(await $fetch('https://api.bar-rts.com/cached-users'))
  const collator = new Intl.Collator(undefined, {
    sensitivity: 'variant'
  }).compare
  response.sort((a, b) => collator(a.username, b.username))
  console.log('response finished')
  return response

}