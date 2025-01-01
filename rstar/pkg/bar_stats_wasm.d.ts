/* tslint:disable */
/* eslint-disable */
export function clusterize_with_limit(data: (BarPartialPlayerData)[], eps: number, min_pts: number, _max_pts: number, cluster_size_factor_threshold: number): DepthClusterizationResults;
export function moving_average(values: Float64Array, length: number, method: MovingAverageOptions): Float64Array;
export enum MovingAverageOptions {
  EMA = 0,
  SMA = 1,
  SMM = 2,
  WSMA = 3,
  SSMA = 4,
}
export class BarPartialPlayerData {
  free(): void;
  constructor(battle_index: number, x: number, y: number);
  battle_index: number;
  x: number;
  y: number;
}
export class DepthClusterizationResults {
  private constructor();
  free(): void;
  labels: Uint32Array;
  cluster_count: number;
}
export class JSRtree {
  free(): void;
  constructor();
  add(id: number, x: number, y: number): void;
  range_query(x: number, y: number, eps: number): Uint32Array;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly __wbg_jsrtree_free: (a: number, b: number) => void;
  readonly jsrtree_new: () => number;
  readonly jsrtree_add: (a: number, b: number, c: number, d: number) => [number, number];
  readonly jsrtree_range_query: (a: number, b: number, c: number, d: number) => [number, number, number, number];
  readonly __wbg_barpartialplayerdata_free: (a: number, b: number) => void;
  readonly __wbg_get_barpartialplayerdata_battle_index: (a: number) => number;
  readonly __wbg_set_barpartialplayerdata_battle_index: (a: number, b: number) => void;
  readonly __wbg_get_barpartialplayerdata_x: (a: number) => number;
  readonly __wbg_set_barpartialplayerdata_x: (a: number, b: number) => void;
  readonly __wbg_get_barpartialplayerdata_y: (a: number) => number;
  readonly __wbg_set_barpartialplayerdata_y: (a: number, b: number) => void;
  readonly barpartialplayerdata_new: (a: number, b: number, c: number) => number;
  readonly __wbg_depthclusterizationresults_free: (a: number, b: number) => void;
  readonly __wbg_get_depthclusterizationresults_labels: (a: number) => [number, number];
  readonly __wbg_set_depthclusterizationresults_labels: (a: number, b: number, c: number) => void;
  readonly __wbg_get_depthclusterizationresults_cluster_count: (a: number) => number;
  readonly __wbg_set_depthclusterizationresults_cluster_count: (a: number, b: number) => void;
  readonly clusterize_with_limit: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly moving_average: (a: number, b: number, c: number, d: number) => [number, number, number, number];
  readonly memory: WebAssembly.Memory;
  readonly __wbindgen_export_1: WebAssembly.Table;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_thread_destroy: (a?: number, b?: number, c?: number) => void;
  readonly __wbindgen_start: (a: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput, memory?: WebAssembly.Memory, thread_stack_size?: number }} module - Passing `SyncInitInput` directly is deprecated.
* @param {WebAssembly.Memory} memory - Deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput, memory?: WebAssembly.Memory, thread_stack_size?: number } | SyncInitInput, memory?: WebAssembly.Memory): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput>, memory?: WebAssembly.Memory, thread_stack_size?: number }} module_or_path - Passing `InitInput` directly is deprecated.
* @param {WebAssembly.Memory} memory - Deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput>, memory?: WebAssembly.Memory, thread_stack_size?: number } | InitInput | Promise<InitInput>, memory?: WebAssembly.Memory): Promise<InitOutput>;
