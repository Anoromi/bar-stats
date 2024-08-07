import { getBarReplay } from "../utils/api-calls/bar-replay"
import { getBarReplayList } from "../utils/api-calls/bar-replay-list"




export default defineEventHandler(async () => {


  try {

    const requests = (await getBarReplayList(5, 1000)).data.map(v => v.id).map(v => getBarReplay(v))

    const result = await Promise.all(requests)


    for (let v of result.slice(undefined, 3)) {
      //console.log(v.id)
      //console.log(v.AllyTeams)
    }
    console.log('ended')
  } catch (e) {
    console.log(e)
  }




})