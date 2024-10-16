import type { MapDto } from "~/server/utils/dto/dto";
import { generateParams } from "./generateParams";
import type { GetMapQuery } from "~/server/api/map";
import { assert } from "../other/assert";

export async function getMap(mapId: number) : Promise<MapDto> {
  const map = await fetch(
    "/api/map?" +
      new URLSearchParams(
        generateParams<GetMapQuery>(
          ["mapId", mapId],
        ),
      ),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  ).then(async (v) => (await v.json()) as MapDto | null);
  assert(map !== null, "Can't find map")
  console.log('received map', map)
  return map
}
