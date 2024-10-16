import { between, eq, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import type { Grouped } from "../array/groupBy";

export const getMapsQuery = (ids: number[]) => {
  const child = alias(mapTable, "child");
  return db
    .select()
    .from(mapTable)
    .where(inArray(mapTable.id, ids))
    .innerJoin(child, eq(child.subclassOfId, mapTable.id));
};

export const getMapsByMapIdQuery = (mapIds: number[]) => {
  return db.select().from(mapTable).where(inArray(mapTable.mapId, mapIds));
};

export const findMapByNameQuery = (mapName: string) => {
  const child = alias(mapTable, "child");
  return db
    .select()
    .from(mapTable)
    .where(eq(mapTable.name, mapName))
    .leftJoin(child, eq(child.subclassOfId, mapTable.id));
};

export const findMapByNameLikeQuery = (mapName: string) => {
  const maxValue = mapName + String.fromCodePoint(1114111);
  return db
    .select()
    .from(mapTable)
    .limit(10)
    .where(between(mapTable.name, mapName, maxValue));
};

export class MapService {
  async getMaps(ids: number[]) {
    const result = await getMapsQuery(ids);
    return groupByMappedWithMap(result, {
      selectGroupKey: (value) => value.map,
      selectGroupValue: (value) => value.child,
      getMappableKey: (group) => group.id,
    });
  }

  async getMapsByMapId(mapIds: number[]) {
    return await getMapsByMapIdQuery(mapIds);
  }

  async getMapByName(mapName: string): Promise<Grouped<MapDto, MapDto> | null> {
    const result = await findMapByNameQuery(mapName);
    if (result.length === 0) return null;
    const grouped = groupByMapped(result, {
      selectGroupKey: (value) => value.map,
      inGroup: (value, group) => value.map?.id === group?.id,
      selectGroupValue: (value) => value.child,
    })[0];
    if (grouped.values.every((v) => v === null))
      return {
        key: grouped.key,
        values: [],
      };
    else return grouped as Grouped<MapDto, MapDto>;
  }

  async getMapSuggestions(mapName: string): Promise<MapDto[]> {
    const result = findMapByNameLikeQuery(mapName);
    return result;
  }
}

export function useMapService() {
  return new MapService();
}
