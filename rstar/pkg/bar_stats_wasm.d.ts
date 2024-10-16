/* tslint:disable */
/* eslint-disable */
/**
 * @param {(BarPartialPlayerData)[]} data
 * @param {number} eps
 * @param {number} min_pts
 * @returns {DepthClusterizationResults}
 */
export function depth_clusterize(data: (BarPartialPlayerData)[], eps: number, min_pts: number): DepthClusterizationResults;
export class BarPartialPlayerData {
  free(): void;
  /**
   * @param {number} battle_index
   * @param {number} x
   * @param {number} y
   */
  constructor(battle_index: number, x: number, y: number);
  battle_index: number;
  x: number;
  y: number;
}
export class DepthClusterizationResults {
  free(): void;
  cluster_count: number;
  labels: Int32Array;
}
export class SpatialIndex {
  free(): void;
  constructor();
  /**
   * @param {number} id
   * @param {number} x
   * @param {number} y
   */
  add(id: number, x: number, y: number): void;
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} eps
   * @returns {Uint32Array}
   */
  range_query(x: number, y: number, eps: number): Uint32Array;
}
