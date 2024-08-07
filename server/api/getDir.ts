import {readdirSync} from 'node:fs'

export default defineEventHandler(async () => {
  return {
    a: readdirSync('./chunks/raw'),
    mount: useStorage('assets:drizzle').getMount().base,
    drizzle: await useStorage('assets:drizzle').getKeys(),
    drizzle2: await useStorage('assets:drizzle2').getKeys()
  }
    
})
