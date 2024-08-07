import { readdir, readdirSync } from "node:fs"

export default defineNitroPlugin(async () => {
  const result = readdirSync('.', {recursive: true})

  for(let v of result) {
    console.log(v)
  }
  
})

