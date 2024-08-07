import {readdirSync} from 'node:fs'

export default defineEventHandler(() => {
  return {
    a: readdirSync('./chunks/raw'),
    mount: useStorage('assets:drizzle').getMount().base

  }
    
})
