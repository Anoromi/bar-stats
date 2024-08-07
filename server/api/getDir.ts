import {readdirSync} from 'node:fs'

export default defineEventHandler(() => {
  return readdirSync('./chunks/raw', {recursive: true})
})
