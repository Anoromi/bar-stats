import * as wasm from "./rstar_bg.wasm";
export * from "./rstar_bg.js";
import { __wbg_set_wasm } from "./rstar_bg.js";
__wbg_set_wasm(wasm);