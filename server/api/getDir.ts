import {readdirSync} from 'node:fs'

export default defineEventHandler(() => {
  return readdirSync('../', {recursive: true})
})
