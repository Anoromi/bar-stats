import { eq, inArray, like, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { groupByMapped, Grouped } from "../array/groupBy";
import { MapEntity } from "../database/schema";

export const getMapsQuery = (ids: number[]) => {
  const child = alias(mapTable, "child");
  return db
    .select()
    .from(mapTable)
    .where(inArray(mapTable.id, ids))
    .innerJoin(child, eq(child.subclassOfId, mapTable.id));
};

export const getMapsByMapIdQuery = (mapIds: number[]) => {
  const child = alias(mapTable, "child");
  return db
    .select()
    .from(mapTable)
    .where(inArray(mapTable.mapId, mapIds))
    .innerJoin(child, eq(child.subclassOfId, mapTable.id));
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
  return db
    .select()
    .from(mapTable)
    .where(like(mapTable.name, sql`${mapName}%`))
    .limit(20);
};

export class MapService {
  async getMaps(ids: number[]) {
    const result = await getMapsQuery(ids);
    return groupByMapped(result, {
      selectGroupKey: (value) => value.map,
      inGroup: (value, group) => value.map.id === group.id,
      selectGroupValue: (value) => value.child,
    });
  }

  async getMapsByMapId(mapIds: number[]) {
    const result = await getMapsByMapIdQuery(mapIds);
    return groupByMapped(result, {
      selectGroupKey: (value) => value.map,
      inGroup: (value, group) => value.map.id === group.id,
      selectGroupValue: (value) => value.child,
    });
  }

  async getMapByName(
    mapName: string,
  ): Promise<Grouped<MapEntity, MapEntity> | null> {
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
    else return grouped as Grouped<MapEntity, MapEntity>;
  }

  async getMapSuggestions(mapName: string): Promise<MapEntity[]> {
    const result = await logAnalyze(findMapByNameLikeQuery(mapName));
    return result;
  }
}

export function useMapService() {
  return new MapService();
}
