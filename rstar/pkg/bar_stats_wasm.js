import * as wasm from "./bar_stats_wasm_bg.wasm";
export * from "./bar_stats_wasm_bg.js";
import { __wbg_set_wasm } from "./bar_stats_wasm_bg.js";
__wbg_set_wasm(wasm);